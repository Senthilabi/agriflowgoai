import { useAuth } from '@/contexts/AuthContext';
import { MOCK_ORDERS, MOCK_LEDGER } from '@/data/mock-data';
import MetricCard from '@/components/MetricCard';
import StatusBadge from '@/components/StatusBadge';
import OrderPipeline from '@/components/OrderPipeline';
import { Link } from 'react-router-dom';
import { ShoppingCart, TrendingUp, Users, CreditCard, ArrowRight } from 'lucide-react';
import { OrderStatus } from '@/types/domain';

const STATUS_ORDER: OrderStatus[] = [
  'ORDER_CREATED', 'PRODUCER_ASSIGNED', 'RAW_CONFIRMED', 'PROCESSOR_ASSIGNED',
  'PROCESSING_STARTED', 'PROCESSING_COMPLETED', 'LOGISTICS_ASSIGNED',
  'IN_TRANSIT', 'DELIVERED', 'SETTLED',
];

const DashboardPage = () => {
  const { user } = useAuth();

  const totalGMV = MOCK_ORDERS.reduce((sum, o) => sum + o.total_value, 0);
  const totalCommission = MOCK_ORDERS.reduce((sum, o) => sum + (o.total_value * o.commission_percent / 100), 0);
  const activeOrders = MOCK_ORDERS.filter(o => !['SETTLED', 'CANCELLED'].includes(o.status));
  const settledOrders = MOCK_ORDERS.filter(o => o.status === 'SETTLED');

  // Pipeline breakdown
  const pipelineCounts = STATUS_ORDER.map(status => ({
    status,
    count: MOCK_ORDERS.filter(o => o.status === status).length,
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display">
          {user?.role === 'ADMIN' ? 'Command Center' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1">Chennai Cluster — Rice &amp; Cold-Pressed Oil</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Active Orders"
          value={activeOrders.length}
          sub={`${settledOrders.length} settled`}
          icon={<ShoppingCart className="h-5 w-5" />}
          trend="up"
        />
        <MetricCard
          label="Total GMV"
          value={`₹${(totalGMV / 1000).toFixed(1)}K`}
          sub="This month"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <MetricCard
          label="Commission Earned"
          value={`₹${(totalCommission / 1000).toFixed(1)}K`}
          sub={`Avg ${(totalCommission / totalGMV * 100).toFixed(1)}%`}
          icon={<CreditCard className="h-5 w-5" />}
          trend="neutral"
        />
        <MetricCard
          label="Active Partners"
          value={7}
          sub="2 producers, 2 processors"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Pipeline View */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8 shadow-card">
        <h2 className="text-lg font-display mb-4">Order Pipeline</h2>
        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          {pipelineCounts.map(({ status, count }) => (
            <div key={status} className="text-center">
              <div className={`text-xl font-display ${count > 0 ? 'text-foreground' : 'text-muted-foreground/30'}`}>
                {count}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-1">
                {status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-lg border border-border shadow-card">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-display">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {MOCK_ORDERS.slice(0, 5).map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium">{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {order.product_name} · {order.quantity} {order.product_name.includes('Oil') ? 'L' : 'kg'} · {order.retailer_name}
                </div>
              </div>
              <div className="hidden md:block w-48">
                <OrderPipeline currentStatus={order.status} />
              </div>
              <div className="text-right">
                <div className="font-medium">₹{order.total_value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{order.commission_percent}% commission</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
