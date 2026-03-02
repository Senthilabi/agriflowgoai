import React, { createContext, useContext, useState, useCallback } from 'react';
import { Order, OrderStateLog, LedgerEntry, OrderStatus, STATE_TRANSITIONS, STATUS_LABELS } from '@/types/domain';
import { MOCK_ORDERS, MOCK_STATE_LOGS, MOCK_LEDGER } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OrderStoreContextType {
  orders: Order[];
  stateLogs: OrderStateLog[];
  ledger: LedgerEntry[];
  transitionOrder: (orderId: string, nextStatus: OrderStatus) => boolean;
}

const OrderStoreContext = createContext<OrderStoreContextType | undefined>(undefined);

export const OrderStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(JSON.stringify(MOCK_ORDERS)));
  const [stateLogs, setStateLogs] = useState<OrderStateLog[]>(() => JSON.parse(JSON.stringify(MOCK_STATE_LOGS)));
  const [ledger, setLedger] = useState<LedgerEntry[]>(() => JSON.parse(JSON.stringify(MOCK_LEDGER)));
  const { user } = useAuth();

  const transitionOrder = useCallback((orderId: string, nextStatus: OrderStatus): boolean => {
    if (!user) return false;

    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    const allowed = STATE_TRANSITIONS[order.status];
    const transition = allowed.find(t => t.next === nextStatus && t.allowed_role === user.role);
    if (!transition) {
      toast.error('Transition not allowed', {
        description: `Your role (${user.role}) cannot move from ${STATUS_LABELS[order.status]} to ${STATUS_LABELS[nextStatus]}.`,
      });
      return false;
    }

    const previousState = order.status;
    const now = new Date().toISOString();

    // Update order
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: nextStatus, updated_at: now.split('T')[0] } : o
    ));

    // Add audit log
    const newLog: OrderStateLog = {
      id: `sl-${Date.now()}`,
      order_id: orderId,
      previous_state: previousState,
      new_state: nextStatus,
      changed_by_user_id: user.id,
      changed_by_name: user.name,
      timestamp: now,
    };
    setStateLogs(prev => [...prev, newLog]);

    // Update ledger on DELIVERED → mark PENDING entries as ELIGIBLE
    if (nextStatus === 'DELIVERED') {
      setLedger(prev => prev.map(e =>
        e.order_id === orderId && e.status === 'PENDING' ? { ...e, status: 'ELIGIBLE' } : e
      ));
    }

    // Update ledger on SETTLED → mark ELIGIBLE entries as RELEASED
    if (nextStatus === 'SETTLED') {
      setLedger(prev => prev.map(e =>
        e.order_id === orderId && e.status === 'ELIGIBLE' ? { ...e, status: 'RELEASED' } : e
      ));
    }

    toast.success(`${STATUS_LABELS[previousState]} → ${STATUS_LABELS[nextStatus]}`, {
      description: `Order ${orderId} advanced successfully.`,
    });

    return true;
  }, [orders, user]);

  return (
    <OrderStoreContext.Provider value={{ orders, stateLogs, ledger, transitionOrder }}>
      {children}
    </OrderStoreContext.Provider>
  );
};

export const useOrderStore = () => {
  const context = useContext(OrderStoreContext);
  if (!context) throw new Error('useOrderStore must be used within OrderStoreProvider');
  return context;
};
