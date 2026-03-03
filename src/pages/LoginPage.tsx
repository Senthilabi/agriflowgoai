import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wheat, Droplets, Truck, ShoppingCart, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ROLES: { role: UserRole; label: string; icon: React.ReactNode }[] = [
  { role: 'ADMIN', label: 'Admin', icon: <Shield className="h-4 w-4" /> },
  { role: 'PRODUCER', label: 'Producer', icon: <Wheat className="h-4 w-4" /> },
  { role: 'PROCESSOR', label: 'Processor', icon: <Droplets className="h-4 w-4" /> },
  { role: 'LOGISTICS', label: 'Logistics', icon: <Truck className="h-4 w-4" /> },
  { role: 'RETAILER', label: 'Retailer', icon: <ShoppingCart className="h-4 w-4" /> },
];

const LoginPage = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('RETAILER');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, name, selectedRole);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Check your email for a confirmation link.');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) toast.error(error);
    }
    setSubmitting(false);
  };

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
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          <div className="lg:hidden mb-4">
            <h1 className="text-3xl font-display text-primary">AgriFlow</h1>
          </div>
          <h2 className="text-2xl font-display">{isSignUp ? 'Create Account' : 'Sign In'}</h2>

          {isSignUp && (
            <>
              <Input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Role</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRole(r.role)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        selectedRole === r.role
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {r.icon} {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
