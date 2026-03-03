
-- ===== 1. TABLES =====

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('Rice','Oil')),
  variety TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL CHECK (unit IN ('kg','litre')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('ADMIN','PRODUCER','PROCESSOR','LOGISTICS','RETAILER')),
  kyc_status BOOLEAN DEFAULT FALSE,
  subscription_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id),
  product_name TEXT,
  quantity NUMERIC NOT NULL,
  retailer_id UUID NOT NULL REFERENCES public.profiles(id),
  retailer_name TEXT,
  assigned_producer_id UUID REFERENCES public.profiles(id),
  assigned_producer_name TEXT,
  assigned_processor_id UUID REFERENCES public.profiles(id),
  assigned_processor_name TEXT,
  assigned_logistics_id UUID REFERENCES public.profiles(id),
  assigned_logistics_name TEXT,
  total_value_paise BIGINT NOT NULL DEFAULT 0,
  commission_bps INTEGER NOT NULL DEFAULT 800,
  status TEXT NOT NULL DEFAULT 'ORDER_CREATED'
    CHECK (status IN ('ORDER_CREATED','PRODUCER_ASSIGNED','RAW_CONFIRMED','PROCESSOR_ASSIGNED',
                      'PROCESSING_STARTED','PROCESSING_COMPLETED','LOGISTICS_ASSIGNED',
                      'IN_TRANSIT','DELIVERED','SETTLED','CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order state logs (append-only)
CREATE TABLE public.order_state_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  previous_state TEXT,
  new_state TEXT NOT NULL,
  changed_by_user_id UUID REFERENCES public.profiles(id),
  changed_by_name TEXT,
  payload JSONB DEFAULT '{}',
  client_action_id UUID UNIQUE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Ledger entries (append-only)
CREATE TABLE public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  actor_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('ADMIN','PRODUCER','PROCESSOR','LOGISTICS','RETAILER')),
  gross_paise BIGINT NOT NULL,
  commission_paise BIGINT NOT NULL,
  net_paise BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ELIGIBLE','RELEASED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 2. ENABLE RLS =====
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_state_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- ===== 3. SECURITY DEFINER HELPERS =====
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN') $$;

-- ===== 4. RLS POLICIES =====

-- Products
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (public.is_admin());

-- Profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin reads all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Orders
CREATE POLICY "Admin reads all orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Actors read assigned orders" ON public.orders FOR SELECT USING (
  auth.uid() = retailer_id OR auth.uid() = assigned_producer_id OR
  auth.uid() = assigned_processor_id OR auth.uid() = assigned_logistics_id
);
CREATE POLICY "Retailer can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = retailer_id);
CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- Order state logs
CREATE POLICY "Admin reads all logs" ON public.order_state_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Actors read own order logs" ON public.order_state_logs FOR SELECT USING (
  order_id IN (
    SELECT o.id FROM public.orders o
    WHERE auth.uid() IN (o.retailer_id, o.assigned_producer_id, o.assigned_processor_id, o.assigned_logistics_id)
  )
);
CREATE POLICY "Authenticated can insert logs" ON public.order_state_logs FOR INSERT WITH CHECK (auth.uid() = changed_by_user_id);

-- Ledger
CREATE POLICY "Admin reads all ledger" ON public.ledger_entries FOR SELECT USING (public.is_admin());
CREATE POLICY "Actors read own ledger" ON public.ledger_entries FOR SELECT USING (auth.uid() = actor_id);
CREATE POLICY "Admin can insert ledger" ON public.ledger_entries FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update ledger status" ON public.ledger_entries FOR UPDATE USING (public.is_admin());

-- ===== 5. TRIGGERS =====

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'RETAILER')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for orders
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===== 6. INDEXES =====
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_retailer ON public.orders(retailer_id);
CREATE INDEX idx_orders_producer ON public.orders(assigned_producer_id);
CREATE INDEX idx_orders_processor ON public.orders(assigned_processor_id);
CREATE INDEX idx_orders_logistics ON public.orders(assigned_logistics_id);
CREATE INDEX idx_state_logs_order ON public.order_state_logs(order_id);
CREATE INDEX idx_state_logs_timestamp ON public.order_state_logs(timestamp);
CREATE INDEX idx_ledger_order ON public.ledger_entries(order_id);
CREATE INDEX idx_ledger_actor ON public.ledger_entries(actor_id);
CREATE INDEX idx_ledger_status ON public.ledger_entries(status);

-- ===== 7. TRANSITION RPC =====
CREATE OR REPLACE FUNCTION public.transition_order(
  p_order_id UUID, p_next_status TEXT, p_client_action_id UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_role TEXT; v_user_name TEXT; v_allowed BOOLEAN := FALSE;
BEGIN
  SELECT role, name INTO v_role, v_user_name FROM public.profiles WHERE id = auth.uid();
  IF v_role IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'User profile not found'); END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF v_order IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Order not found'); END IF;

  v_allowed := CASE
    WHEN v_order.status = 'ORDER_CREATED'        AND p_next_status = 'PRODUCER_ASSIGNED'    AND v_role = 'ADMIN'      THEN TRUE
    WHEN v_order.status = 'PRODUCER_ASSIGNED'     AND p_next_status = 'RAW_CONFIRMED'        AND v_role = 'PRODUCER'   THEN TRUE
    WHEN v_order.status = 'RAW_CONFIRMED'         AND p_next_status = 'PROCESSOR_ASSIGNED'   AND v_role = 'ADMIN'      THEN TRUE
    WHEN v_order.status = 'PROCESSOR_ASSIGNED'    AND p_next_status = 'PROCESSING_STARTED'   AND v_role = 'PROCESSOR'  THEN TRUE
    WHEN v_order.status = 'PROCESSING_STARTED'    AND p_next_status = 'PROCESSING_COMPLETED' AND v_role = 'PROCESSOR'  THEN TRUE
    WHEN v_order.status = 'PROCESSING_COMPLETED'  AND p_next_status = 'LOGISTICS_ASSIGNED'   AND v_role = 'ADMIN'      THEN TRUE
    WHEN v_order.status = 'LOGISTICS_ASSIGNED'    AND p_next_status = 'IN_TRANSIT'           AND v_role = 'LOGISTICS'  THEN TRUE
    WHEN v_order.status = 'IN_TRANSIT'            AND p_next_status = 'DELIVERED'            AND v_role = 'LOGISTICS'  THEN TRUE
    WHEN v_order.status = 'DELIVERED'             AND p_next_status = 'SETTLED'              AND v_role = 'ADMIN'      THEN TRUE
    ELSE FALSE
  END;

  IF NOT v_allowed THEN
    RETURN jsonb_build_object('success', false, 'error',
      format('Role %s cannot transition from %s to %s', v_role, v_order.status, p_next_status));
  END IF;

  UPDATE public.orders SET status = p_next_status WHERE id = p_order_id;

  INSERT INTO public.order_state_logs (order_id, previous_state, new_state, changed_by_user_id, changed_by_name, client_action_id)
  VALUES (p_order_id, v_order.status, p_next_status, auth.uid(), v_user_name, p_client_action_id);

  IF p_next_status = 'DELIVERED' THEN
    UPDATE public.ledger_entries SET status = 'ELIGIBLE' WHERE order_id = p_order_id AND status = 'PENDING';
  END IF;
  IF p_next_status = 'SETTLED' THEN
    UPDATE public.ledger_entries SET status = 'RELEASED' WHERE order_id = p_order_id AND status = 'ELIGIBLE';
  END IF;

  RETURN jsonb_build_object('success', true, 'previous_status', v_order.status, 'new_status', p_next_status);
END;
$$;

-- ===== 8. SEED PRODUCTS =====
INSERT INTO public.products (category, variety, description, unit) VALUES
  ('Rice', 'Ponni Raw Rice', 'Premium quality Ponni rice from Tamil Nadu', 'kg'),
  ('Rice', 'Sona Masoori', 'Lightweight everyday rice', 'kg'),
  ('Oil', 'Cold-Pressed Groundnut Oil', 'Traditional chekku oil', 'litre'),
  ('Oil', 'Cold-Pressed Sesame Oil', 'Nallennai - gingelly oil', 'litre');
