import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_ORDERS } from '@/data/mock-data';
import StatusBadge from '@/components/StatusBadge';
import OrderPipeline from '@/components/OrderPipeline';
import { OrderStatus, STATUS_LABELS } from '@/types/domain';
import { Search, Filter } from 'lucide-react';

const ALL_STATUSES: OrderStatus[] = [
  'ORDER_CREATED', 'PRODUCER_ASSIGNED', 'RAW_CONFIRMED', 'PROCESSOR_ASSIGNED',
  'PROCESSING_STARTED', 'PROCESSING_COMPLETED', 'LOGISTICS_ASSIGNED',
  'IN_TRANSIT', 'DELIVERED', 'SETTLED', 'CANCELLED',
];

const OrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = MOCK_ORDERS.filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.product_name.toLowerCase().includes(search.toLowerCase()) && !o.retailer_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display">Orders</h1>
          <p className="text-muted-foreground mt-1">{MOCK_ORDERS.length} total orders in system</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
            className="pl-10 pr-8 py-2.5 bg-card border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Order ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Product</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Retailer</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 hidden lg:table-cell">Pipeline</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <Link to={`/orders/${order.id}`} className="font-mono text-sm font-medium text-primary hover:underline">
                    {order.id}
                  </Link>
                </td>
                <td className="p-4">
                  <div className="text-sm">{order.product_name}</div>
                  <div className="text-xs text-muted-foreground">{order.quantity} {order.product_name.includes('Oil') ? 'L' : 'kg'}</div>
                </td>
                <td className="p-4 text-sm">{order.retailer_name}</td>
                <td className="p-4"><StatusBadge status={order.status} /></td>
                <td className="p-4 hidden lg:table-cell w-48"><OrderPipeline currentStatus={order.status} /></td>
                <td className="p-4 text-right">
                  <div className="text-sm font-medium">₹{order.total_value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{order.commission_percent}%</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">No orders match your filters</div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
