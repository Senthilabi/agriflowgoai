// Types for the Agri Supply Chain Orchestration Engine

export type UserRole = 'ADMIN' | 'PRODUCER' | 'PROCESSOR' | 'LOGISTICS' | 'RETAILER';

export type OrderStatus =
  | 'ORDER_CREATED'
  | 'PRODUCER_ASSIGNED'
  | 'RAW_CONFIRMED'
  | 'PROCESSOR_ASSIGNED'
  | 'PROCESSING_STARTED'
  | 'PROCESSING_COMPLETED'
  | 'LOGISTICS_ASSIGNED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'SETTLED'
  | 'CANCELLED';

export type LedgerStatus = 'PENDING' | 'ELIGIBLE' | 'RELEASED';

// Legacy float-based types removed — use DbOrder, DbStateLog, DbLedgerEntry from OrderStore

// OrderStateLog and LedgerEntry types live in OrderStore.tsx as DbStateLog / DbLedgerEntry

// State machine transition rules
export const STATE_TRANSITIONS: Record<OrderStatus, { next: OrderStatus; allowed_role: UserRole }[]> = {
  ORDER_CREATED: [{ next: 'PRODUCER_ASSIGNED', allowed_role: 'ADMIN' }],
  PRODUCER_ASSIGNED: [{ next: 'RAW_CONFIRMED', allowed_role: 'PRODUCER' }],
  RAW_CONFIRMED: [{ next: 'PROCESSOR_ASSIGNED', allowed_role: 'ADMIN' }],
  PROCESSOR_ASSIGNED: [{ next: 'PROCESSING_STARTED', allowed_role: 'PROCESSOR' }],
  PROCESSING_STARTED: [{ next: 'PROCESSING_COMPLETED', allowed_role: 'PROCESSOR' }],
  PROCESSING_COMPLETED: [{ next: 'LOGISTICS_ASSIGNED', allowed_role: 'ADMIN' }],
  LOGISTICS_ASSIGNED: [{ next: 'IN_TRANSIT', allowed_role: 'LOGISTICS' }],
  IN_TRANSIT: [{ next: 'DELIVERED', allowed_role: 'LOGISTICS' }],
  DELIVERED: [{ next: 'SETTLED', allowed_role: 'ADMIN' }],
  SETTLED: [],
  CANCELLED: [],
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  ORDER_CREATED: 'Order Created',
  PRODUCER_ASSIGNED: 'Producer Assigned',
  RAW_CONFIRMED: 'Raw Confirmed',
  PROCESSOR_ASSIGNED: 'Processor Assigned',
  PROCESSING_STARTED: 'Processing Started',
  PROCESSING_COMPLETED: 'Processing Completed',
  LOGISTICS_ASSIGNED: 'Logistics Assigned',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  SETTLED: 'Settled',
  CANCELLED: 'Cancelled',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  ORDER_CREATED: 'bg-muted text-muted-foreground',
  PRODUCER_ASSIGNED: 'bg-info/10 text-info',
  RAW_CONFIRMED: 'bg-info/20 text-info',
  PROCESSOR_ASSIGNED: 'bg-warning/10 text-warning',
  PROCESSING_STARTED: 'bg-warning/20 text-warning',
  PROCESSING_COMPLETED: 'bg-warning/30 text-warning-foreground',
  LOGISTICS_ASSIGNED: 'bg-accent/20 text-accent-foreground',
  IN_TRANSIT: 'bg-accent/30 text-accent-foreground',
  DELIVERED: 'bg-success/10 text-success',
  SETTLED: 'bg-success/20 text-success',
  CANCELLED: 'bg-destructive/10 text-destructive',
};
