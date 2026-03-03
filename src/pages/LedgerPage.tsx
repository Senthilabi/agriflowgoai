import { useOrderStore } from '@/contexts/OrderStore';
import { CreditCard } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import { Link } from 'react-router-dom';

const LedgerPage = () => {
  const { ledger } = useOrderStore();

  const totalGross = ledger.reduce((s, e) => s + e.gross_paise, 0);
  const totalCommission = ledger.reduce((s, e) => s + e.commission_paise, 0);
  const totalNet = ledger.reduce((s, e) => s + e.net_paise, 0);
  const released = ledger.filter(e => e.status === 'RELEASED');
  const pending = ledger.filter(e => e.status === 'PENDING');

  return (
    <div>
      <h1 className="text-3xl font-display mb-1">Ledger</h1>
      <p className="text-muted-foreground mb-8">Immutable financial records across all orders</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Total Gross" value={`₹${(totalGross / 100000).toFixed(1)}K`} icon={<CreditCard className="h-5 w-5" />} />
        <MetricCard label="Commission Collected" value={`₹${(totalCommission / 100000).toFixed(1)}K`} sub={totalGross > 0 ? `${(totalCommission / totalGross * 100).toFixed(1)}% avg` : '—'} />
        <MetricCard label="Net Payable" value={`₹${(totalNet / 100000).toFixed(1)}K`} sub={`${released.length} released, ${pending.length} pending`} />
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Order</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Actor</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Role</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">Gross</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">Commission</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">Net</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ledger.map(entry => (
              <tr key={entry.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <Link to={`/orders/${entry.order_id}`} className="font-mono text-sm text-primary hover:underline">{entry.order_id.slice(0, 8)}</Link>
                </td>
                <td className="p-4 text-sm">{entry.actor_name}</td>
                <td className="p-4 text-sm text-muted-foreground">{entry.role}</td>
                <td className="p-4 text-sm text-right">₹{(entry.gross_paise / 100).toLocaleString()}</td>
                <td className="p-4 text-sm text-right text-destructive">-₹{(entry.commission_paise / 100).toLocaleString()}</td>
                <td className="p-4 text-sm text-right font-medium">₹{(entry.net_paise / 100).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    entry.status === 'RELEASED' ? 'bg-success/10 text-success' :
                    entry.status === 'ELIGIBLE' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>{entry.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerPage;
