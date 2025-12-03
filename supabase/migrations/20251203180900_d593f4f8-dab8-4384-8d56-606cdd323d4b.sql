-- Add community sharing fields to agents table
ALTER TABLE public.agents 
ADD COLUMN is_shared_to_community boolean DEFAULT false,
ADD COLUMN community_category text,
ADD COLUMN community_likes integer DEFAULT 0,
ADD COLUMN shared_at timestamp with time zone;

-- Create RLS policy to allow anyone to view community-shared agents
CREATE POLICY "Anyone can view community shared agents"
ON public.agents
FOR SELECT
USING (is_shared_to_community = true);

-- Create a table to track likes on community agents
CREATE TABLE public.agent_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- Enable RLS on agent_likes
ALTER TABLE public.agent_likes ENABLE ROW LEVEL SECURITY;

-- Users can like community agents
CREATE POLICY "Users can like agents"
ON public.agent_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their likes
CREATE POLICY "Users can remove their likes"
ON public.agent_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
ON public.agent_likes
FOR SELECT
USING (true);