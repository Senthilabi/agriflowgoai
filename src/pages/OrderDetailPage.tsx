import { useParams, Link } from 'react-router-dom';
import { MOCK_ORDERS, MOCK_STATE_LOGS, MOCK_LEDGER } from '@/data/mock-data';
import StatusBadge from '@/components/StatusBadge';
import OrderPipeline from '@/components/OrderPipeline';
import { STATE_TRANSITIONS, STATUS_LABELS, OrderStatus } from '@/types/domain';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, User, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PIPELINE_STEPS: OrderStatus[] = [
  'ORDER_CREATED', 'PRODUCER_ASSIGNED', 'RAW_CONFIRMED', 'PROCESSOR_ASSIGNED',
  'PROCESSING_STARTED', 'PROCESSING_COMPLETED', 'LOGISTICS_ASSIGNED',
  'IN_TRANSIT', 'DELIVERED', 'SETTLED',
];

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const order = MOCK_ORDERS.find(o => o.id === id);
  const logs = MOCK_STATE_LOGS.filter(l => l.order_id === id);
  const ledger = MOCK_LEDGER.filter(l => l.order_id === id);

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="text-primary hover:underline text-sm mt-2 inline-block">Back to orders</Link>
      </div>
    );
  }

  const transitions = STATE_TRANSITIONS[order.status];
  const availableTransitions = transitions.filter(t => t.allowed_role === user?.role);

  const handleTransition = (nextStatus: OrderStatus) => {
    toast.success(`State transition: ${STATUS_LABELS[order.status]} → ${STATUS_LABELS[nextStatus]}`, {
      description: 'This is a demo. In production, this would update the database.',
    });
  };

  const currentStepIndex = PIPELINE_STEPS.indexOf(order.status);

  return (
    <div>
      {/* Back */}
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display">{order.id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground mt-1">{order.product_name} · {order.quantity} {order.product_name.includes('Oil') ? 'L' : 'kg'}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display">₹{order.total_value.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">{order.commission_percent}% commission (₹{(order.total_value * order.commission_percent / 100).toLocaleString()})</div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6 shadow-card">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Order Pipeline</h2>
        <div className="flex items-center gap-2">
          {PIPELINE_STEPS.map((step, i) => {
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step} className="flex-1 flex flex-col items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${isCompleted ? 'bg-success' : isCurrent ? 'bg-accent ring-4 ring-accent/20' : 'bg-muted'}`} />
                <span className={`text-[9px] text-center leading-tight ${isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {STATUS_LABELS[step].replace(' ', '\n')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      {availableTransitions.length > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Action Required</p>
            <p className="text-xs text-muted-foreground">You can advance this order to the next stage</p>
          </div>
          <div className="flex gap-2">
            {availableTransitions.map(t => (
              <Button key={t.next} onClick={() => handleTransition(t.next)}>
                {STATUS_LABELS[t.next]}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actors */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card">
          <h2 className="text-lg font-display mb-4">Supply Chain Actors</h2>
          <div className="space-y-4">
            {[
              { label: 'Retailer', name: order.retailer_name },
              { label: 'Producer', name: order.assigned_producer_name },
              { label: 'Processor', name: order.assigned_processor_name },
              { label: 'Logistics', name: order.assigned_logistics_name },
            ].map(actor => (
              <div key={actor.label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{actor.label}</div>
                  <div className="text-sm font-medium">{actor.name || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card">
          <h2 className="text-lg font-display mb-4">Audit Trail</h2>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="w-px flex-1 bg-border mt-1" />
                  </div>
                  <div className="pb-3">
                    <div className="text-sm font-medium">{STATUS_LABELS[log.new_state]}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.changed_by_name} · {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No audit logs available for this order in demo.</p>
          )}
        </div>

        {/* Ledger */}
        {ledger.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6 shadow-card lg:col-span-2">
            <h2 className="text-lg font-display mb-4">Ledger Entries</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Actor</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Role</th>
                  <th className="text-right text-xs font-medium text-muted-foreground pb-3">Gross</th>
                  <th className="text-right text-xs font-medium text-muted-foreground pb-3">Commission</th>
                  <th className="text-right text-xs font-medium text-muted-foreground pb-3">Net</th>
                  <th className="text-right text-xs font-medium text-muted-foreground pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledger.map(entry => (
                  <tr key={entry.id}>
                    <td className="py-3 text-sm">{entry.actor_name}</td>
                    <td className="py-3 text-sm text-muted-foreground">{entry.role}</td>
                    <td className="py-3 text-sm text-right">₹{entry.gross_amount.toLocaleString()}</td>
                    <td className="py-3 text-sm text-right text-destructive">-₹{entry.commission_deducted.toLocaleString()}</td>
                    <td className="py-3 text-sm text-right font-medium">₹{entry.net_amount.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.status === 'RELEASED' ? 'bg-success/10 text-success' :
                        entry.status === 'ELIGIBLE' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
