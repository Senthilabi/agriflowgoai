import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrderStore } from '@/contexts/OrderStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  variety: string;
  category: string;
  unit: string;
}

const CreateOrderDialog = () => {
  const { refreshOrders } = useOrderStore();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [commissionBps, setCommissionBps] = useState(800);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from('products').select('id, variety, category, unit').eq('active', true)
        .then(({ data }) => { if (data) setProducts(data); });
    }
  }, [open]);

  const selectedProduct = products.find(p => p.id === productId);
  const qty = parseFloat(quantity) || 0;
  const ppu = parseFloat(pricePerUnit) || 0;
  const totalPaise = Math.round(qty * ppu * 100);
  const commissionPaise = Math.round(totalPaise * commissionBps / 10000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || qty <= 0 || ppu <= 0) return;
    setSubmitting(true);

    const { data, error } = await supabase.rpc('create_order', {
      p_product_id: productId,
      p_quantity: qty,
      p_total_value_paise: totalPaise,
      p_commission_bps: commissionBps,
    });

    if (error) {
      toast.error('Failed to create order', { description: error.message });
    } else {
      const result = data as { success: boolean; error?: string; order_id?: string };
      if (result.success) {
        toast.success('Order created', { description: `Order ${(result.order_id as string).slice(0, 8)} placed.` });
        await refreshOrders();
        setOpen(false);
        setProductId(''); setQuantity(''); setPricePerUnit('');
      } else {
        toast.error('Order failed', { description: result.error });
      }
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> New Order</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Product</label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.variety} ({p.category})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Quantity {selectedProduct ? `(${selectedProduct.unit})` : ''}
              </label>
              <Input type="number" min="1" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Price per unit (₹)</label>
              <Input type="number" min="0.01" step="0.01" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} required />
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Value</span>
              <span className="font-medium">₹{(totalPaise / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commission ({(commissionBps / 100).toFixed(0)}%)</span>
              <span className="text-destructive">-₹{(commissionPaise / 100).toLocaleString()}</span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting || !productId || qty <= 0 || ppu <= 0}>
            {submitting ? 'Creating…' : 'Place Order'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;
