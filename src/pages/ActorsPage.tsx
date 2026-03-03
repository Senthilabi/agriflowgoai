import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Shield, CheckCircle2, XCircle } from 'lucide-react';
import type { Profile } from '@/contexts/AuthContext';

const ActorsPage = () => {
  const [actors, setActors] = useState<Profile[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setActors(data as Profile[]);
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-display mb-1">Actors</h1>
      <p className="text-muted-foreground mb-8">{actors.length} registered supply chain partners</p>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Name</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Role</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Email</th>
              <th className="text-center text-xs font-medium text-muted-foreground p-4">KYC</th>
              <th className="text-center text-xs font-medium text-muted-foreground p-4">Subscription</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {actors.map(u => (
              <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {u.role === 'ADMIN' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <span className="text-sm font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{u.role}</span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                <td className="p-4 text-center">
                  {u.kyc_status ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <XCircle className="h-4 w-4 text-destructive mx-auto" />}
                </td>
                <td className="p-4 text-center">
                  {u.subscription_status ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <XCircle className="h-4 w-4 text-destructive mx-auto" />}
                </td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActorsPage;
