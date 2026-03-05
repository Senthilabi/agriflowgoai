
-- S2.1: create_order RPC for retailers
CREATE OR REPLACE FUNCTION public.create_order(
  p_product_id UUID,
  p_quantity NUMERIC,
  p_total_value_paise BIGINT,
  p_commission_bps INTEGER DEFAULT 800
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_product_name TEXT;
  v_order_id UUID;
BEGIN
  SELECT role, name INTO v_role, v_name FROM public.profiles WHERE id = auth.uid();
  IF v_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;
  IF v_role <> 'RETAILER' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only retailers can create orders');
  END IF;

  SELECT variety INTO v_product_name FROM public.products WHERE id = p_product_id AND active = true;
  IF v_product_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found or inactive');
  END IF;

  INSERT INTO public.orders (product_id, product_name, quantity, retailer_id, retailer_name, total_value_paise, commission_bps, status)
  VALUES (p_product_id, v_product_name, p_quantity, auth.uid(), v_name, p_total_value_paise, p_commission_bps, 'ORDER_CREATED')
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_state_logs (order_id, previous_state, new_state, changed_by_user_id, changed_by_name)
  VALUES (v_order_id, NULL, 'ORDER_CREATED', auth.uid(), v_name);

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
END;
$$;

-- S2.2: assign_actor RPC for admin
CREATE OR REPLACE FUNCTION public.assign_actor(
  p_order_id UUID,
  p_actor_id UUID,
  p_actor_role TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_actor_name TEXT;
  v_actor_actual_role TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can assign actors');
  END IF;

  SELECT name, role INTO v_actor_name, v_actor_actual_role FROM public.profiles WHERE id = p_actor_id;
  IF v_actor_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Actor not found');
  END IF;
  IF v_actor_actual_role <> p_actor_role THEN
    RETURN jsonb_build_object('success', false, 'error', format('Actor role mismatch: expected %s got %s', p_actor_role, v_actor_actual_role));
  END IF;

  IF p_actor_role = 'PRODUCER' THEN
    UPDATE public.orders SET assigned_producer_id = p_actor_id, assigned_producer_name = v_actor_name WHERE id = p_order_id;
  ELSIF p_actor_role = 'PROCESSOR' THEN
    UPDATE public.orders SET assigned_processor_id = p_actor_id, assigned_processor_name = v_actor_name WHERE id = p_order_id;
  ELSIF p_actor_role = 'LOGISTICS' THEN
    UPDATE public.orders SET assigned_logistics_id = p_actor_id, assigned_logistics_name = v_actor_name WHERE id = p_order_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid actor role for assignment');
  END IF;

  RETURN jsonb_build_object('success', true, 'actor_name', v_actor_name);
END;
$$;

-- S2.5: get_actors_by_role RPC to bypass profiles RLS
CREATE OR REPLACE FUNCTION public.get_actors_by_role(p_role TEXT)
RETURNS TABLE(id UUID, name TEXT, email TEXT, phone TEXT, kyc_status BOOLEAN, subscription_status BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id, p.name, p.email, p.phone, p.kyc_status, p.subscription_status
  FROM public.profiles p
  WHERE p.role = p_role;
$$;
