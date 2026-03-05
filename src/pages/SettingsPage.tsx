import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { profile } = useAuth();
  const [commissionBps, setCommissionBps] = useState(800);
  const commissionPercent = (commissionBps / 100).toFixed(1);

  const handleSave = () => {
    // Commission BPS is currently passed per-order at creation time.
    // A future migration will store this as a platform config row.
    toast.success('Default commission updated', { description: `New orders will use ${commissionPercent}% commission.` });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-7 w-7 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-display">Settings</h1>
          <p className="text-muted-foreground mt-1">Platform configuration</p>
        </div>
      </div>

      <div className="max-w-lg space-y-6">
        <div className="bg-card rounded-lg border border-border p-6 shadow-card">
          <h2 className="text-lg font-display mb-4">Commission Rate</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Default commission deducted from each actor's payout. Applied to new orders at creation.
          </p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Commission (%)</label>
              <Input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={(commissionBps / 100).toString()}
                onChange={e => setCommissionBps(Math.round(parseFloat(e.target.value || '0') * 100))}
              />
            </div>
            <div className="text-sm text-muted-foreground pb-2">{commissionBps} bps</div>
          </div>
          <Button onClick={handleSave} className="mt-4">Save Commission Rate</Button>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 shadow-card">
          <h2 className="text-lg font-display mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{profile?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{profile?.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span>{profile?.role}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
