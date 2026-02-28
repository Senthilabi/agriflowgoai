import { Order, User, Product, OrderStateLog, LedgerEntry } from '@/types/domain';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Arun Kumar', email: 'arun@agri.com', phone: '+91 9876543210', role: 'ADMIN', kyc_status: true, subscription_status: true, created_at: '2025-01-15' },
  { id: 'u2', name: 'Lakshmi Farms', email: 'lakshmi@farms.in', phone: '+91 9876543211', role: 'PRODUCER', kyc_status: true, subscription_status: true, created_at: '2025-02-01' },
  { id: 'u3', name: 'Kavitha Rice Mill', email: 'kavitha@ricemill.in', phone: '+91 9876543212', role: 'PROCESSOR', kyc_status: true, subscription_status: true, created_at: '2025-02-10' },
  { id: 'u4', name: 'Tamil Express Logistics', email: 'tamil@logistics.in', phone: '+91 9876543213', role: 'LOGISTICS', kyc_status: true, subscription_status: true, created_at: '2025-02-15' },
  { id: 'u5', name: 'Fresh Mart Chennai', email: 'freshmart@retail.in', phone: '+91 9876543214', role: 'RETAILER', kyc_status: true, subscription_status: true, created_at: '2025-03-01' },
  { id: 'u6', name: 'Meena Organic Farm', email: 'meena@organic.in', phone: '+91 9876543215', role: 'PRODUCER', kyc_status: true, subscription_status: true, created_at: '2025-03-05' },
  { id: 'u7', name: 'Selvam Oil Press', email: 'selvam@oilpress.in', phone: '+91 9876543216', role: 'PROCESSOR', kyc_status: false, subscription_status: true, created_at: '2025-03-10' },
  { id: 'u8', name: 'Metro Grocers', email: 'metro@grocers.in', phone: '+91 9876543217', role: 'RETAILER', kyc_status: true, subscription_status: true, created_at: '2025-03-12' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', category: 'Rice', variety: 'Ponni Raw Rice', description: 'Premium quality Ponni rice from Tamil Nadu', unit: 'kg', active: true },
  { id: 'p2', category: 'Rice', variety: 'Sona Masoori', description: 'Lightweight everyday rice', unit: 'kg', active: true },
  { id: 'p3', category: 'Oil', variety: 'Cold-Pressed Groundnut Oil', description: 'Traditional chekku oil', unit: 'litre', active: true },
  { id: 'p4', category: 'Oil', variety: 'Cold-Pressed Sesame Oil', description: 'Nallennai - gingelly oil', unit: 'litre', active: true },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', product_id: 'p1', product_name: 'Ponni Raw Rice', quantity: 500, retailer_id: 'u5', retailer_name: 'Fresh Mart Chennai', assigned_producer_id: 'u2', assigned_producer_name: 'Lakshmi Farms', assigned_processor_id: 'u3', assigned_processor_name: 'Kavitha Rice Mill', assigned_logistics_id: 'u4', assigned_logistics_name: 'Tamil Express Logistics', total_value: 45000, commission_percent: 8, status: 'IN_TRANSIT', created_at: '2026-02-10', updated_at: '2026-02-25' },
  { id: 'ORD-002', product_id: 'p3', product_name: 'Cold-Pressed Groundnut Oil', quantity: 200, retailer_id: 'u8', retailer_name: 'Metro Grocers', assigned_producer_id: 'u6', assigned_producer_name: 'Meena Organic Farm', assigned_processor_id: 'u7', assigned_processor_name: 'Selvam Oil Press', total_value: 62000, commission_percent: 10, status: 'PROCESSING_STARTED', created_at: '2026-02-15', updated_at: '2026-02-22' },
  { id: 'ORD-003', product_id: 'p2', product_name: 'Sona Masoori', quantity: 1000, retailer_id: 'u5', retailer_name: 'Fresh Mart Chennai', assigned_producer_id: 'u2', assigned_producer_name: 'Lakshmi Farms', total_value: 72000, commission_percent: 8, status: 'RAW_CONFIRMED', created_at: '2026-02-18', updated_at: '2026-02-20' },
  { id: 'ORD-004', product_id: 'p4', product_name: 'Cold-Pressed Sesame Oil', quantity: 100, retailer_id: 'u8', retailer_name: 'Metro Grocers', total_value: 38000, commission_percent: 10, status: 'ORDER_CREATED', created_at: '2026-02-26', updated_at: '2026-02-26' },
  { id: 'ORD-005', product_id: 'p1', product_name: 'Ponni Raw Rice', quantity: 750, retailer_id: 'u5', retailer_name: 'Fresh Mart Chennai', assigned_producer_id: 'u6', assigned_producer_name: 'Meena Organic Farm', assigned_processor_id: 'u3', assigned_processor_name: 'Kavitha Rice Mill', assigned_logistics_id: 'u4', assigned_logistics_name: 'Tamil Express Logistics', total_value: 67500, commission_percent: 8, status: 'DELIVERED', created_at: '2026-01-20', updated_at: '2026-02-15' },
  { id: 'ORD-006', product_id: 'p3', product_name: 'Cold-Pressed Groundnut Oil', quantity: 300, retailer_id: 'u8', retailer_name: 'Metro Grocers', assigned_producer_id: 'u2', assigned_producer_name: 'Lakshmi Farms', assigned_processor_id: 'u7', assigned_processor_name: 'Selvam Oil Press', assigned_logistics_id: 'u4', assigned_logistics_name: 'Tamil Express Logistics', total_value: 93000, commission_percent: 10, status: 'SETTLED', created_at: '2026-01-05', updated_at: '2026-02-01' },
];

export const MOCK_STATE_LOGS: OrderStateLog[] = [
  { id: 'sl1', order_id: 'ORD-001', previous_state: null, new_state: 'ORDER_CREATED', changed_by_user_id: 'u5', changed_by_name: 'Fresh Mart Chennai', timestamp: '2026-02-10T09:00:00Z' },
  { id: 'sl2', order_id: 'ORD-001', previous_state: 'ORDER_CREATED', new_state: 'PRODUCER_ASSIGNED', changed_by_user_id: 'u1', changed_by_name: 'Arun Kumar', timestamp: '2026-02-11T10:30:00Z' },
  { id: 'sl3', order_id: 'ORD-001', previous_state: 'PRODUCER_ASSIGNED', new_state: 'RAW_CONFIRMED', changed_by_user_id: 'u2', changed_by_name: 'Lakshmi Farms', timestamp: '2026-02-14T14:00:00Z' },
  { id: 'sl4', order_id: 'ORD-001', previous_state: 'RAW_CONFIRMED', new_state: 'PROCESSOR_ASSIGNED', changed_by_user_id: 'u1', changed_by_name: 'Arun Kumar', timestamp: '2026-02-15T09:00:00Z' },
  { id: 'sl5', order_id: 'ORD-001', previous_state: 'PROCESSOR_ASSIGNED', new_state: 'PROCESSING_STARTED', changed_by_user_id: 'u3', changed_by_name: 'Kavitha Rice Mill', timestamp: '2026-02-17T08:00:00Z' },
  { id: 'sl6', order_id: 'ORD-001', previous_state: 'PROCESSING_STARTED', new_state: 'PROCESSING_COMPLETED', changed_by_user_id: 'u3', changed_by_name: 'Kavitha Rice Mill', timestamp: '2026-02-20T16:00:00Z' },
  { id: 'sl7', order_id: 'ORD-001', previous_state: 'PROCESSING_COMPLETED', new_state: 'LOGISTICS_ASSIGNED', changed_by_user_id: 'u1', changed_by_name: 'Arun Kumar', timestamp: '2026-02-21T10:00:00Z' },
  { id: 'sl8', order_id: 'ORD-001', previous_state: 'LOGISTICS_ASSIGNED', new_state: 'IN_TRANSIT', changed_by_user_id: 'u4', changed_by_name: 'Tamil Express Logistics', timestamp: '2026-02-23T06:00:00Z' },
];

export const MOCK_LEDGER: LedgerEntry[] = [
  { id: 'l1', order_id: 'ORD-006', actor_id: 'u2', actor_name: 'Lakshmi Farms', role: 'PRODUCER', gross_amount: 46500, commission_deducted: 4650, net_amount: 41850, status: 'RELEASED', created_at: '2026-01-05' },
  { id: 'l2', order_id: 'ORD-006', actor_id: 'u7', actor_name: 'Selvam Oil Press', role: 'PROCESSOR', gross_amount: 27900, commission_deducted: 2790, net_amount: 25110, status: 'RELEASED', created_at: '2026-01-05' },
  { id: 'l3', order_id: 'ORD-006', actor_id: 'u4', actor_name: 'Tamil Express Logistics', role: 'LOGISTICS', gross_amount: 9300, commission_deducted: 930, net_amount: 8370, status: 'RELEASED', created_at: '2026-01-05' },
  { id: 'l4', order_id: 'ORD-005', actor_id: 'u6', actor_name: 'Meena Organic Farm', role: 'PRODUCER', gross_amount: 33750, commission_deducted: 2700, net_amount: 31050, status: 'ELIGIBLE', created_at: '2026-01-20' },
  { id: 'l5', order_id: 'ORD-005', actor_id: 'u3', actor_name: 'Kavitha Rice Mill', role: 'PROCESSOR', gross_amount: 20250, commission_deducted: 1620, net_amount: 18630, status: 'ELIGIBLE', created_at: '2026-01-20' },
  { id: 'l6', order_id: 'ORD-001', actor_id: 'u2', actor_name: 'Lakshmi Farms', role: 'PRODUCER', gross_amount: 22500, commission_deducted: 1800, net_amount: 20700, status: 'PENDING', created_at: '2026-02-10' },
];
