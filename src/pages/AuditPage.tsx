import { useOrderStore } from '@/contexts/OrderStore';
import { STATUS_LABELS } from '@/types/domain';
import { Link } from 'react-router-dom';

const AuditPage = () => {
  const { stateLogs } = useOrderStore();

  return (
    <div>
      <h1 className="text-3xl font-display mb-1">Audit Log</h1>
      <p className="text-muted-foreground mb-8">Immutable record of all state transitions</p>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Timestamp</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Order</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Previous State</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">New State</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Changed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...stateLogs].reverse().map(log => (
              <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4 text-sm text-muted-foreground font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-4">
                  <Link to={`/orders/${log.order_id}`} className="font-mono text-sm text-primary hover:underline">{log.order_id}</Link>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {log.previous_state ? STATUS_LABELS[log.previous_state] : '—'}
                </td>
                <td className="p-4 text-sm font-medium">{STATUS_LABELS[log.new_state]}</td>
                <td className="p-4 text-sm">{log.changed_by_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditPage;
