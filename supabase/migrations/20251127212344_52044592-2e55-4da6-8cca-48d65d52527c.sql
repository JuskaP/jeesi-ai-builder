-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to get admin statistics (security definer for admin-only access)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_agents BIGINT,
  agents_this_week BIGINT,
  agents_this_month BIGINT,
  active_users BIGINT,
  total_credits_used BIGINT,
  credits_used_this_week BIGINT,
  pro_subscribers BIGINT,
  expert_subscribers BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM auth.users)::BIGINT as total_users,
    (SELECT COUNT(*) FROM public.agents)::BIGINT as total_agents,
    (SELECT COUNT(*) FROM public.agents WHERE created_at > NOW() - INTERVAL '7 days')::BIGINT as agents_this_week,
    (SELECT COUNT(*) FROM public.agents WHERE created_at > NOW() - INTERVAL '30 days')::BIGINT as agents_this_month,
    (SELECT COUNT(DISTINCT user_id) FROM public.credit_usage)::BIGINT as active_users,
    (SELECT COALESCE(SUM(credits_used), 0) FROM public.credit_usage)::BIGINT as total_credits_used,
    (SELECT COALESCE(SUM(credits_used), 0) FROM public.credit_usage WHERE created_at > NOW() - INTERVAL '7 days')::BIGINT as credits_used_this_week,
    (SELECT COUNT(*) FROM public.credit_balances WHERE plan_type = 'pro')::BIGINT as pro_subscribers,
    (SELECT COUNT(*) FROM public.credit_balances WHERE plan_type = 'expert')::BIGINT as expert_subscribers
  WHERE public.has_role(auth.uid(), 'admin');
$$;