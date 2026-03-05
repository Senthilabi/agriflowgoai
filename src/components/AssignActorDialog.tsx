import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrderStore } from '@/contexts/OrderStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface Actor { id: string; name: string; email: string | null; }

interface AssignActorDialogProps {
  orderId: string;
  actorRole: 'PRODUCER' | 'PROCESSOR' | 'LOGISTICS';
  currentActorName?: string | null;
}

const ROLE_LABELS = { PRODUCER: 'Producer', PROCESSOR: 'Processor', LOGISTICS: 'Logistics Partner' };

const AssignActorDialog = ({ orderId, actorRole, currentActorName }: AssignActorDialogProps) => {
  const { refreshOrders } = useOrderStore();
  const [open, setOpen] = useState(false);
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActorId, setSelectedActorId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.rpc('get_actors_by_role', { p_role: actorRole })
        .then(({ data }) => { if (data) setActors(data as Actor[]); });
    }
  }, [open, actorRole]);

  const handleAssign = async () => {
    if (!selectedActorId) return;
    setSubmitting(true);

    const { data, error } = await supabase.rpc('assign_actor', {
      p_order_id: orderId,
      p_actor_id: selectedActorId,
      p_actor_role: actorRole,
    });

    if (error) {
      toast.error('Assignment failed', { description: error.message });
    } else {
      const result = data as { success: boolean; error?: string; actor_name?: string };
      if (result.success) {
        toast.success(`${ROLE_LABELS[actorRole]} assigned`, { description: result.actor_name });
        await refreshOrders();
        setOpen(false);
      } else {
        toast.error('Assignment failed', { description: result.error });
      }
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          {currentActorName ? 'Reassign' : `Assign ${ROLE_LABELS[actorRole]}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign {ROLE_LABELS[actorRole]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Select value={selectedActorId} onValueChange={setSelectedActorId}>
            <SelectTrigger><SelectValue placeholder={`Select ${ROLE_LABELS[actorRole].toLowerCase()}`} /></SelectTrigger>
            <SelectContent>
              {actors.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}{a.email ? ` (${a.email})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={handleAssign} disabled={submitting || !selectedActorId}>
            {submitting ? 'Assigning…' : 'Confirm Assignment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignActorDialog;
