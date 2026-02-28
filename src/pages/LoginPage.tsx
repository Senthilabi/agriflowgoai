import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Wheat, Droplets, Truck, ShoppingCart, Shield } from 'lucide-react';

const ROLES: { role: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  { role: 'ADMIN', label: 'Admin', description: 'System orchestrator & settlement authority', icon: <Shield className="h-5 w-5" /> },
  { role: 'PRODUCER', label: 'Producer', description: 'Farmer / raw material supplier', icon: <Wheat className="h-5 w-5" /> },
  { role: 'PROCESSOR', label: 'Processor', description: 'Rice mill / oil press operator', icon: <Droplets className="h-5 w-5" /> },
  { role: 'LOGISTICS', label: 'Logistics', description: 'Transport & delivery partner', icon: <Truck className="h-5 w-5" /> },
  { role: 'RETAILER', label: 'Retailer', description: 'End retail buyer placing orders', icon: <ShoppingCart className="h-5 w-5" /> },
];

const LoginPage = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen flex">
      {/* Left - Hero */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <h1 className="text-5xl font-display mb-6 leading-tight">AgriFlow</h1>
          <p className="text-lg opacity-90 font-body leading-relaxed">
            Premium supply chain orchestration for rice &amp; cold-pressed oil. 
            Chennai Cluster Pilot.
          </p>
          <div className="mt-10 flex gap-6 text-sm opacity-70">
            <div>
              <div className="text-2xl font-display">6</div>
              <div>Active Orders</div>
            </div>
            <div>
              <div className="text-2xl font-display">8</div>
              <div>Partners</div>
            </div>
            <div>
              <div className="text-2xl font-display">₹3.7L</div>
              <div>GMV Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <h1 className="text-3xl font-display text-primary">AgriFlow</h1>
          </div>
          <h2 className="text-2xl font-display mb-1">Sign in</h2>
          <p className="text-muted-foreground mb-8">Select your role to access the platform</p>

          <div className="space-y-3">
            {ROLES.map(({ role, label, description, icon }) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all duration-200 ${
                  selectedRole === role
                    ? 'border-primary bg-primary/5 shadow-card'
                    : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                }`}
              >
                <div className={`p-2 rounded-md ${selectedRole === role ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {icon}
                </div>
                <div>
                  <div className="font-medium text-foreground">{label}</div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                </div>
              </button>
            ))}
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={!selectedRole}
            onClick={() => selectedRole && login(selectedRole)}
          >
            Continue as {selectedRole || '...'}
          </Button>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Demo mode — no credentials required
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
