import { useAuth } from '@/contexts/AuthContext';
import { useOrderStore, DbOrder, DbLedgerEntry } from '@/contexts/OrderStore';
import MetricCard from '@/components/MetricCard';
import StatusBadge from '@/components/StatusBadge';
import OrderPipeline from '@/components/OrderPipeline';
import { Link } from 'react-router-dom';
import { ShoppingCart, TrendingUp, Users, CreditCard, ArrowRight, Package, Truck, Clock, CheckCircle, Wheat, Droplets } from 'lucide-react';
import { OrderStatus, UserRole } from '@/types/domain';

const STATUS_ORDER: OrderStatus[] = [
  'ORDER_CREATED', 'PRODUCER_ASSIGNED', 'RAW_CONFIRMED', 'PROCESSOR_ASSIGNED',
  'PROCESSING_STARTED', 'PROCESSING_COMPLETED', 'LOGISTICS_ASSIGNED',
  'IN_TRANSIT', 'DELIVERED', 'SETTLED',
];

const ROLE_GREETINGS: Record<UserRole, { title: string; subtitle: string }> = {
  ADMIN: { title: 'Command Center', subtitle: 'Chennai Cluster — Rice & Cold-Pressed Oil' },
  PRODUCER: { title: 'Farm Dashboard', subtitle: 'Your production assignments & earnings' },
  PROCESSOR: { title: 'Processing Hub', subtitle: 'Your processing queue & status' },
  LOGISTICS: { title: 'Logistics Center', subtitle: 'Your shipments & delivery schedule' },
  RETAILER: { title: 'My Orders', subtitle: 'Track your orders & spending' },
};

// Helper: paise → display string
const fmtPaise = (p: number) => `₹${(p / 100).toLocaleString()}`;
const fmtPaiseK = (p: number) => `₹${(p / 100000).toFixed(1)}K`;

const DashboardPage = () => {
  const { profile } = useAuth();
  const { orders, ledger } = useOrderStore();

  if (!profile) return null;

  const role = profile.role;
  const greeting = ROLE_GREETINGS[role];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display">{greeting.title}</h1>
        <p className="text-muted-foreground mt-1">{greeting.subtitle}</p>
      </div>

      {role === 'ADMIN' && <AdminDashboard orders={orders} ledger={ledger} />}
      {role === 'PRODUCER' && <ProducerDashboard orders={orders} ledger={ledger} userId={profile.id} />}
      {role === 'PROCESSOR' && <ProcessorDashboard orders={orders} ledger={ledger} userId={profile.id} />}
      {role === 'LOGISTICS' && <LogisticsDashboard orders={orders} ledger={ledger} userId={profile.id} />}
      {role === 'RETAILER' && <RetailerDashboard orders={orders} userId={profile.id} />}
    </div>
  );
};

// ─── ADMIN ────
const AdminDashboard = ({ orders, ledger }: { orders: DbOrder[]; ledger: DbLedgerEntry[] }) => {
  const totalGMV = orders.reduce((s, o) => s + o.total_value_paise, 0);
  const totalCommission = orders.reduce((s, o) => s + Math.round(o.total_value_paise * o.commission_bps / 10000), 0);
  const activeOrders = orders.filter(o => !['SETTLED', 'CANCELLED'].includes(o.status));
  const settledOrders = orders.filter(o => o.status === 'SETTLED');
  const pipelineCounts = STATUS_ORDER.map(status => ({ status, count: orders.filter(o => o.status === status).length }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Active Orders" value={activeOrders.length} sub={`${settledOrders.length} settled`} icon={<ShoppingCart className="h-5 w-5" />} trend="up" />
        <MetricCard label="Total GMV" value={fmtPaiseK(totalGMV)} sub="This month" icon={<TrendingUp className="h-5 w-5" />} trend="up" />
        <MetricCard label="Commission Earned" value={fmtPaiseK(totalCommission)} sub={`Avg ${totalGMV > 0 ? (totalCommission / totalGMV * 100).toFixed(1) : 0}%`} icon={<CreditCard className="h-5 w-5" />} trend="neutral" />
        <MetricCard label="Active Partners" value="—" sub="View in Actors page" icon={<Users className="h-5 w-5" />} />
      </div>
      <div className="bg-card rounded-lg border border-border p-6 mb-8 shadow-card">
        <h2 className="text-lg font-display mb-4">Order Pipeline</h2>
        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          {pipelineCounts.map(({ status, count }) => (
            <div key={status} className="text-center">
              <div className={`text-xl font-display ${count > 0 ? 'text-foreground' : 'text-muted-foreground/30'}`}>{count}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-1">{status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}</div>
            </div>
          ))}
        </div>
      </div>
      <RecentOrdersList orders={orders} />
    </>
  );
};

// ─── PRODUCER ─────
const ProducerDashboard = ({ orders, ledger, userId }: { orders: DbOrder[]; ledger: DbLedgerEntry[]; userId: string }) => {
  const myOrders = orders.filter(o => o.assigned_producer_id === userId);
  const awaitingConfirmation = myOrders.filter(o => o.status === 'PRODUCER_ASSIGNED');
  const confirmed = myOrders.filter(o => !['ORDER_CREATED', 'PRODUCER_ASSIGNED'].includes(o.status));
  const myLedger = ledger.filter(e => e.actor_id === userId);
  const totalEarned = myLedger.filter(e => e.status === 'RELEASED').reduce((s, e) => s + e.net_paise, 0);
  const pendingPayout = myLedger.filter(e => e.status !== 'RELEASED').reduce((s, e) => s + e.net_paise, 0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Assigned Orders" value={myOrders.length} sub={`${awaitingConfirmation.length} awaiting action`} icon={<Wheat className="h-5 w-5" />} trend={awaitingConfirmation.length > 0 ? 'up' : 'neutral'} />
        <MetricCard label="Confirmed" value={confirmed.length} sub="Raw material sent" icon={<CheckCircle className="h-5 w-5" />} />
        <MetricCard label="Total Earned" value={fmtPaiseK(totalEarned)} sub="Released" icon={<CreditCard className="h-5 w-5" />} trend="up" />
        <MetricCard label="Pending Payout" value={fmtPaiseK(pendingPayout)} sub="Awaiting settlement" icon={<Clock className="h-5 w-5" />} trend="neutral" />
      </div>
      {awaitingConfirmation.length > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-warning-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Action Required</h3>
          <p className="text-sm text-muted-foreground mt-1">{awaitingConfirmation.length} order{awaitingConfirmation.length > 1 ? 's' : ''} waiting for confirmation.</p>
        </div>
      )}
      <RecentOrdersList orders={myOrders} emptyMessage="No orders assigned to you yet." />
    </>
  );
};

// ─── PROCESSOR ────
const ProcessorDashboard = ({ orders, ledger, userId }: { orders: DbOrder[]; ledger: DbLedgerEntry[]; userId: string }) => {
  const myOrders = orders.filter(o => o.assigned_processor_id === userId);
  const inProcessing = myOrders.filter(o => ['PROCESSOR_ASSIGNED', 'PROCESSING_STARTED'].includes(o.status));
  const completed = myOrders.filter(o => ['PROCESSING_COMPLETED', 'LOGISTICS_ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'SETTLED'].includes(o.status));
  const myLedger = ledger.filter(e => e.actor_id === userId);
  const totalEarned = myLedger.filter(e => e.status === 'RELEASED').reduce((s, e) => s + e.net_paise, 0);
  const pendingPayout = myLedger.filter(e => e.status !== 'RELEASED').reduce((s, e) => s + e.net_paise, 0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="In Processing" value={inProcessing.length} sub={`${myOrders.length} total`} icon={<Droplets className="h-5 w-5" />} trend={inProcessing.length > 0 ? 'up' : 'neutral'} />
        <MetricCard label="Completed" value={completed.length} sub="Done" icon={<CheckCircle className="h-5 w-5" />} />
        <MetricCard label="Total Earned" value={fmtPaiseK(totalEarned)} sub="Released" icon={<CreditCard className="h-5 w-5" />} trend="up" />
        <MetricCard label="Pending Payout" value={fmtPaiseK(pendingPayout)} sub="Awaiting settlement" icon={<Clock className="h-5 w-5" />} trend="neutral" />
      </div>
      {inProcessing.length > 0 && (
        <div className="bg-info/5 border border-info/20 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-info flex items-center gap-2"><Package className="h-4 w-4" /> Active Processing</h3>
          <p className="text-sm text-muted-foreground mt-1">{inProcessing.length} order{inProcessing.length > 1 ? 's' : ''} in queue.</p>
        </div>
      )}
      <RecentOrdersList orders={myOrders} emptyMessage="No orders assigned to you yet." />
    </>
  );
};

// ─── LOGISTICS ────
const LogisticsDashboard = ({ orders, ledger, userId }: { orders: DbOrder[]; ledger: DbLedgerEntry[]; userId: string }) => {
  const myOrders = orders.filter(o => o.assigned_logistics_id === userId);
  const awaitingPickup = myOrders.filter(o => o.status === 'LOGISTICS_ASSIGNED');
  const inTransit = myOrders.filter(o => o.status === 'IN_TRANSIT');
  const delivered = myOrders.filter(o => ['DELIVERED', 'SETTLED'].includes(o.status));
  const myLedger = ledger.filter(e => e.actor_id === userId);
  const totalEarned = myLedger.filter(e => e.status === 'RELEASED').reduce((s, e) => s + e.net_paise, 0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Awaiting Pickup" value={awaitingPickup.length} sub="Ready to dispatch" icon={<Package className="h-5 w-5" />} trend={awaitingPickup.length > 0 ? 'up' : 'neutral'} />
        <MetricCard label="In Transit" value={inTransit.length} sub="On the road" icon={<Truck className="h-5 w-5" />} trend={inTransit.length > 0 ? 'up' : 'neutral'} />
        <MetricCard label="Delivered" value={delivered.length} sub="Completed" icon={<CheckCircle className="h-5 w-5" />} />
        <MetricCard label="Total Earned" value={fmtPaiseK(totalEarned)} sub="Released" icon={<CreditCard className="h-5 w-5" />} trend="up" />
      </div>
      {(awaitingPickup.length > 0 || inTransit.length > 0) && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-accent-foreground flex items-center gap-2"><Truck className="h-4 w-4" /> Active Shipments</h3>
          <p className="text-sm text-muted-foreground mt-1">{awaitingPickup.length} awaiting pickup, {inTransit.length} in transit.</p>
        </div>
      )}
      <RecentOrdersList orders={myOrders} emptyMessage="No shipments assigned to you yet." />
    </>
  );
};

// ─── RETAILER ─────
const RetailerDashboard = ({ orders, userId }: { orders: DbOrder[]; userId: string }) => {
  const myOrders = orders.filter(o => o.retailer_id === userId);
  const activeOrders = myOrders.filter(o => !['SETTLED', 'CANCELLED'].includes(o.status));
  const totalSpent = myOrders.reduce((s, o) => s + o.total_value_paise, 0);
  const deliveredCount = myOrders.filter(o => ['DELIVERED', 'SETTLED'].includes(o.status)).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="My Orders" value={myOrders.length} sub={`${activeOrders.length} active`} icon={<ShoppingCart className="h-5 w-5" />} trend="up" />
        <MetricCard label="Active" value={activeOrders.length} sub="In progress" icon={<Clock className="h-5 w-5" />} trend={activeOrders.length > 0 ? 'up' : 'neutral'} />
        <MetricCard label="Delivered" value={deliveredCount} sub="Received" icon={<CheckCircle className="h-5 w-5" />} />
        <MetricCard label="Total Spent" value={fmtPaiseK(totalSpent)} sub="All time" icon={<TrendingUp className="h-5 w-5" />} />
      </div>
      <RecentOrdersList orders={myOrders} emptyMessage="You haven't placed any orders yet." />
    </>
  );
};

// ─── Shared ────
const RecentOrdersList = ({ orders, emptyMessage }: { orders: DbOrder[]; emptyMessage?: string }) => {
  if (orders.length === 0) {
    return <div className="bg-card rounded-lg border border-border p-8 text-center shadow-card"><p className="text-muted-foreground">{emptyMessage || 'No orders to display.'}</p></div>;
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-card">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-display">Recent Orders</h2>
        <Link to="/orders" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="divide-y divide-border">
        {orders.slice(0, 5).map(order => (
          <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-medium">{order.id.slice(0, 8)}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {order.product_name} · {order.quantity} {order.product_name?.includes('Oil') ? 'L' : 'kg'} · {order.retailer_name}
              </div>
            </div>
            <div className="hidden md:block w-48"><OrderPipeline currentStatus={order.status} /></div>
            <div className="text-right">
              <div className="font-medium">{fmtPaise(order.total_value_paise)}</div>
              <div className="text-xs text-muted-foreground">{(order.commission_bps / 100).toFixed(0)}% commission</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
