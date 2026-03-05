import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Wheat, Droplets } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  category: string;
  variety: string;
  description: string | null;
  unit: string;
  active: boolean | null;
  created_at: string | null;
}

const ProductsPage = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState('Rice');
  const [unit, setUnit] = useState('kg');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isAdmin = profile?.role === 'ADMIN';

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data as Product[]);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('products').insert({ variety, category, unit, description: description || null });
    if (error) {
      toast.error('Failed to create product', { description: error.message });
    } else {
      toast.success('Product created');
      setDialogOpen(false);
      setVariety(''); setDescription('');
      await fetchProducts();
    }
    setSubmitting(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from('products').update({ active: !active }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !active } : p));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display">Products</h1>
          <p className="text-muted-foreground mt-1">{products.length} products</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>New Product</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <Input placeholder="Variety name" value={variety} onChange={e => setVariety(e.target.value)} required />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rice">Rice</SelectItem>
                        <SelectItem value="Oil">Oil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Unit</label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="litre">litre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
                <Button type="submit" className="w-full" disabled={submitting || !variety}>{submitting ? 'Creating…' : 'Create Product'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Product</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Category</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Unit</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Description</th>
              {isAdmin && <th className="text-center text-xs font-medium text-muted-foreground p-4">Active</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {p.category === 'Rice' ? <Wheat className="h-4 w-4" /> : <Droplets className="h-4 w-4" />}
                    </div>
                    <span className="text-sm font-medium">{p.variety}</span>
                  </div>
                </td>
                <td className="p-4 text-sm">{p.category}</td>
                <td className="p-4 text-sm text-muted-foreground">{p.unit}</td>
                <td className="p-4 text-sm text-muted-foreground">{p.description || '—'}</td>
                {isAdmin && (
                  <td className="p-4 text-center">
                    <Switch checked={p.active ?? true} onCheckedChange={() => toggleActive(p.id, p.active ?? true)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="p-12 text-center text-muted-foreground">No products yet</div>}
      </div>
    </div>
  );
};

export default ProductsPage;
