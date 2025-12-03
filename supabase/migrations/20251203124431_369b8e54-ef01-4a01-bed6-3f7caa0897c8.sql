-- Create user consent preferences table
CREATE TABLE public.user_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metadata_collection BOOLEAN NOT NULL DEFAULT false,
  usage_analytics BOOLEAN NOT NULL DEFAULT false,
  prompt_analysis BOOLEAN NOT NULL DEFAULT false,
  error_tracking BOOLEAN NOT NULL DEFAULT false,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  consented_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create platform analytics table for aggregated insights
CREATE TABLE public.platform_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'prompt', 'response', 'error', 'session_start', 'session_end'
  prompt_text TEXT, -- stored only if user consented
  response_preview TEXT, -- first 200 chars of response
  response_time_ms INTEGER,
  tokens_used INTEGER,
  error_type TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create common issues tracking table
CREATE TABLE public.agent_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL, -- 'prompt_failure', 'timeout', 'hallucination', 'off_topic', 'user_reported'
  issue_description TEXT,
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  sample_prompts JSONB DEFAULT '[]'::jsonb,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_issues ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_consent
CREATE POLICY "Users can view their own consent" ON public.user_consent
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent" ON public.user_consent
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent" ON public.user_consent
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for platform_analytics (users can see their own, admins can see all)
CREATE POLICY "Users can view their own analytics" ON public.platform_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON public.platform_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for agent_issues (agent owners can see issues)
CREATE POLICY "Agent owners can view issues" ON public.agent_issues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_issues.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert issues" ON public.agent_issues
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Agent owners can update issues" ON public.agent_issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_issues.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_user_consent_updated_at
  BEFORE UPDATE ON public.user_consent
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_agent_issues_updated_at
  BEFORE UPDATE ON public.agent_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();