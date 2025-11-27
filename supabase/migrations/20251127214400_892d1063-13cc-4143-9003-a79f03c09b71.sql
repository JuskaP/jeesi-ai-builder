-- Add is_heavy field to agents table
ALTER TABLE public.agents 
ADD COLUMN is_heavy BOOLEAN DEFAULT FALSE;

-- Add railway_url field to store Railway backend URL
ALTER TABLE public.agents
ADD COLUMN railway_url TEXT;

-- Create function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update credit balance
  UPDATE public.credit_balances
  SET 
    credits_remaining = credits_remaining - p_credits,
    credits_used_this_month = credits_used_this_month + p_credits,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- If no record exists, this is a no-op (should not happen in production)
  IF NOT FOUND THEN
    RAISE NOTICE 'No credit balance found for user %', p_user_id;
  END IF;
END;
$$;

-- Add comment
COMMENT ON COLUMN public.agents.is_heavy IS 'If true, agent execution is routed to Railway backend instead of edge functions';
COMMENT ON COLUMN public.agents.railway_url IS 'Railway backend URL for heavy agent execution (optional, defaults to env variable)';
