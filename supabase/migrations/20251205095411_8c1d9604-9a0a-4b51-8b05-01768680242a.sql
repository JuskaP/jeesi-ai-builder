-- Strengthen RLS policies with explicit auth.uid() IS NOT NULL checks

-- 1. Fix profiles table - add explicit authentication check
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 2. Fix api_keys table - add explicit authentication check
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;
CREATE POLICY "Users can view their own API keys"
ON public.api_keys
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 3. Fix credit_balances table - add explicit authentication check  
DROP POLICY IF EXISTS "Users can view their own credit balance" ON public.credit_balances;
CREATE POLICY "Users can view their own credit balance"
ON public.credit_balances
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 4. Fix platform_analytics table - add explicit authentication check
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.platform_analytics;
CREATE POLICY "Users can view their own analytics"
ON public.platform_analytics
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 5. Fix conversations policy to require user_id assignment
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 6. Fix messages policy similarly
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;
CREATE POLICY "Authenticated users can insert messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND c.user_id = auth.uid()
  )
);