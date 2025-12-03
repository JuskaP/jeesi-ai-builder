-- Add INSERT policy for credit_balances so users can have their balance created
CREATE POLICY "Users can insert their own credit balance"
ON public.credit_balances
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Also add a policy to allow service role to manage all credit balances (for webhook processing)
-- This is implicitly allowed by service role key, but good to be explicit