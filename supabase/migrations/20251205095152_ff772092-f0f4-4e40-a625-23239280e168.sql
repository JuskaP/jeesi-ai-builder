-- Fix Critical Security Issue: Remove overly permissive anonymous access policies

-- 1. Drop the dangerous "Anyone can create" policies on conversations
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;

-- 2. Drop the dangerous "Anyone can create" policies on messages  
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;

-- 3. Update the existing INSERT policy for conversations to require authentication
-- First drop the existing policy that might allow null user_id
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;

-- Create a stricter policy that requires authentication
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- 4. Update the INSERT policy for messages to require authentication
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON public.messages;

-- Create a stricter policy: only authenticated users can insert messages into conversations they can access
CREATE POLICY "Authenticated users can insert messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_id = auth.uid() OR c.user_id IS NULL)
  )
);

-- 5. Fix scheduled_runs overly permissive system policies
DROP POLICY IF EXISTS "System can insert runs" ON public.scheduled_runs;
DROP POLICY IF EXISTS "System can update runs" ON public.scheduled_runs;