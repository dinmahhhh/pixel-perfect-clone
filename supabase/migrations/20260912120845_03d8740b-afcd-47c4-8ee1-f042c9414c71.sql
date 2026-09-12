-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- roles
CREATE TYPE public.business_role AS ENUM ('owner', 'admin', 'viewer');

CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;

CREATE TABLE public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.business_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_members TO authenticated;
GRANT ALL ON public.business_members TO service_role;

-- security definer helpers (avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.is_business_member(_business_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.business_members WHERE business_id = _business_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.has_business_role(_business_id UUID, _user_id UUID, _roles public.business_role[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = _business_id AND user_id = _user_id AND role = ANY(_roles)
  );
$$;

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "businesses_select_members" ON public.businesses FOR SELECT TO authenticated
  USING (public.is_business_member(id, auth.uid()));
CREATE POLICY "businesses_insert_owner" ON public.businesses FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "businesses_update_admins" ON public.businesses FOR UPDATE TO authenticated
  USING (public.has_business_role(id, auth.uid(), ARRAY['owner','admin']::public.business_role[]))
  WITH CHECK (public.has_business_role(id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));
CREATE POLICY "businesses_delete_owner" ON public.businesses FOR DELETE TO authenticated
  USING (public.has_business_role(id, auth.uid(), ARRAY['owner']::public.business_role[]));

ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_select_same_business" ON public.business_members FOR SELECT TO authenticated
  USING (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "members_insert_self_or_admin" ON public.business_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[])
  );
CREATE POLICY "members_update_admin" ON public.business_members FOR UPDATE TO authenticated
  USING (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]))
  WITH CHECK (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));
CREATE POLICY "members_delete_admin" ON public.business_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[])
  );

-- owner membership is created automatically
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (business_id, user_id) DO NOTHING;
  INSERT INTO public.subscriptions (business_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (business_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- datasets
CREATE TABLE public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT,
  row_count INTEGER NOT NULL DEFAULT 0,
  imported_row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  column_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_report JSONB NOT NULL DEFAULT '{}'::jsonb,
  has_cost_data BOOLEAN NOT NULL DEFAULT false,
  period_start DATE,
  period_end DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_datasets_business ON public.datasets(business_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.datasets TO authenticated;
GRANT ALL ON public.datasets TO service_role;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "datasets_select_members" ON public.datasets FOR SELECT TO authenticated
  USING (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "datasets_insert_admins" ON public.datasets FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));
CREATE POLICY "datasets_update_admins" ON public.datasets FOR UPDATE TO authenticated
  USING (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]))
  WITH CHECK (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));
CREATE POLICY "datasets_delete_admins" ON public.datasets FOR DELETE TO authenticated
  USING (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));

-- transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  occurred_on DATE,
  product TEXT,
  category TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  selling_price NUMERIC,
  cost_price NUMERIC,
  revenue NUMERIC,
  profit NUMERIC,
  customer TEXT,
  location TEXT,
  payment_method TEXT,
  row_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_transactions_dataset ON public.transactions(dataset_id);
CREATE INDEX idx_transactions_business_date ON public.transactions(business_id, occurred_on);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select_members" ON public.transactions FOR SELECT TO authenticated
  USING (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "transactions_insert_admins" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));
CREATE POLICY "transactions_update_admins" ON public.transactions FOR UPDATE TO authenticated
  USING (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]))
  WITH CHECK (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));
CREATE POLICY "transactions_delete_admins" ON public.transactions FOR DELETE TO authenticated
  USING (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));

-- metrics cache
CREATE TABLE public.metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  period TEXT,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, dataset_id, metric_key, period)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metrics_cache TO authenticated;
GRANT ALL ON public.metrics_cache TO service_role;
ALTER TABLE public.metrics_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metrics_select_members" ON public.metrics_cache FOR SELECT TO authenticated
  USING (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "metrics_write_admins" ON public.metrics_cache FOR ALL TO authenticated
  USING (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]))
  WITH CHECK (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));

-- insights
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'observation',
  title TEXT NOT NULL,
  body TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insights TO authenticated;
GRANT ALL ON public.insights TO service_role;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insights_select_members" ON public.insights FOR SELECT TO authenticated
  USING (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "insights_write_admins" ON public.insights FOR ALL TO authenticated
  USING (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]))
  WITH CHECK (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));

-- reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_by UUID,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'monthly',
  period_start DATE,
  period_end DATE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_select_members" ON public.reports FOR SELECT TO authenticated
  USING (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "reports_write_admins" ON public.reports FOR ALL TO authenticated
  USING (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]))
  WITH CHECK (public.has_business_role(business_id, auth.uid(), ARRAY['owner','admin']::public.business_role[]));

-- subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_select_members" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.is_business_member(business_id, auth.uid()));

CREATE TRIGGER on_business_created
AFTER INSERT ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.handle_new_business();

-- keep only one current dataset per business
CREATE OR REPLACE FUNCTION public.enforce_single_current_dataset()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_current THEN
    UPDATE public.datasets
    SET is_current = false
    WHERE business_id = NEW.business_id AND id <> NEW.id AND is_current;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER datasets_single_current
AFTER INSERT OR UPDATE OF is_current ON public.datasets
FOR EACH ROW WHEN (NEW.is_current) EXECUTE FUNCTION public.enforce_single_current_dataset();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER businesses_touch BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER subscriptions_touch BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();