import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus, STATUS_LABELS } from '@/types/domain';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DbOrder {
  id: string;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  retailer_id: string;
  retailer_name: string | null;
  assigned_producer_id: string | null;
  assigned_producer_name: string | null;
  assigned_processor_id: string | null;
  assigned_processor_name: string | null;
  assigned_logistics_id: string | null;
  assigned_logistics_name: string | null;
  total_value_paise: number;
  commission_bps: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface DbStateLog {
  id: string;
  order_id: string;
  previous_state: string | null;
  new_state: string;
  changed_by_user_id: string | null;
  changed_by_name: string | null;
  timestamp: string;
}

export interface DbLedgerEntry {
  id: string;
  order_id: string;
  actor_id: string;
  actor_name: string | null;
  role: string;
  gross_paise: number;
  commission_paise: number;
  net_paise: number;
  status: string;
  created_at: string;
}

interface OrderStoreContextType {
  orders: DbOrder[];
  stateLogs: DbStateLog[];
  ledger: DbLedgerEntry[];
  loading: boolean;
  transitionOrder: (orderId: string, nextStatus: OrderStatus) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}

const OrderStoreContext = createContext<OrderStoreContextType | undefined>(undefined);

export const OrderStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [stateLogs, setStateLogs] = useState<DbStateLog[]>([]);
  const [ledger, setLedger] = useState<DbLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const refreshOrders = useCallback(async () => {
    const [ordersRes, logsRes, ledgerRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_state_logs').select('*').order('timestamp', { ascending: true }),
      supabase.from('ledger_entries').select('*').order('created_at', { ascending: true }),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data as DbOrder[]);
    if (logsRes.data) setStateLogs(logsRes.data as DbStateLog[]);
    if (ledgerRes.data) setLedger(ledgerRes.data as DbLedgerEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
    } else {
      setOrders([]);
      setStateLogs([]);
      setLedger([]);
      setLoading(false);
    }
  }, [isAuthenticated, refreshOrders]);

  const transitionOrder = useCallback(async (orderId: string, nextStatus: OrderStatus): Promise<boolean> => {
    const { data, error } = await supabase.rpc('transition_order', {
      p_order_id: orderId,
      p_next_status: nextStatus,
    });

    if (error) {
      toast.error('Transition failed', { description: error.message });
      return false;
    }

    const result = data as { success: boolean; error?: string; previous_status?: string; new_status?: string };

    if (!result.success) {
      toast.error('Transition not allowed', { description: result.error });
      return false;
    }

    toast.success(`${STATUS_LABELS[result.previous_status as OrderStatus]} → ${STATUS_LABELS[result.new_status as OrderStatus]}`, {
      description: `Order advanced successfully.`,
    });

    await refreshOrders();
    return true;
  }, [refreshOrders]);

  return (
    <OrderStoreContext.Provider value={{ orders, stateLogs, ledger, loading, transitionOrder, refreshOrders }}>
      {children}
    </OrderStoreContext.Provider>
  );
};

export const useOrderStore = () => {
  const context = useContext(OrderStoreContext);
  if (!context) throw new Error('useOrderStore must be used within OrderStoreProvider');
  return context;
};
