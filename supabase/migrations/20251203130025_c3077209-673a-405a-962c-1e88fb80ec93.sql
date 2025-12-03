-- Create agent_functions table for custom function configurations
CREATE TABLE public.agent_functions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  function_type TEXT NOT NULL, -- 'api_call', 'data_transform', 'conditional', 'webhook'
  trigger_keywords TEXT[] DEFAULT '{}', -- keywords that trigger this function
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- function-specific configuration
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  execution_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_functions ENABLE ROW LEVEL SECURITY;

-- RLS policies - only agent owners can manage functions
CREATE POLICY "Users can view functions of their agents" ON public.agent_functions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_functions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create functions for their agents" ON public.agent_functions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_functions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update functions of their agents" ON public.agent_functions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_functions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete functions of their agents" ON public.agent_functions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_functions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_agent_functions_updated_at
  BEFORE UPDATE ON public.agent_functions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();