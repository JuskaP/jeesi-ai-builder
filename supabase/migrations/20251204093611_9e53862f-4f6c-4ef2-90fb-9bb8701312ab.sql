-- Enable REPLICA IDENTITY FULL for real-time updates
ALTER TABLE public.credit_balances REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_balances;