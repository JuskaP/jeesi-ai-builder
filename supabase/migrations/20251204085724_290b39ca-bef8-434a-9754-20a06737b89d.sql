-- Create agent_schedules table for storing scheduling configuration
CREATE TABLE public.agent_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  schedule_type TEXT NOT NULL DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'custom'
  cron_expression TEXT NOT NULL DEFAULT '0 9 * * *', -- Default: 9 AM daily
  timezone TEXT NOT NULL DEFAULT 'UTC',
  prompt_template TEXT NOT NULL DEFAULT 'Generate content',
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER NOT NULL DEFAULT 0,
  last_result JSONB DEFAULT '{}',
  output_action TEXT NOT NULL DEFAULT 'store', -- 'store', 'webhook', 'api_call'
  output_config JSONB DEFAULT '{}', -- Config for webhook/API call
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint (one schedule per agent)
ALTER TABLE public.agent_schedules ADD CONSTRAINT unique_agent_schedule UNIQUE (agent_id);

-- Enable RLS
ALTER TABLE public.agent_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own schedules" 
ON public.agent_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create schedules for their agents" 
ON public.agent_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM agents WHERE agents.id = agent_id AND agents.user_id = auth.uid()
));

CREATE POLICY "Users can update their own schedules" 
ON public.agent_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" 
ON public.agent_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create scheduled_runs table for logging scheduled executions
CREATE TABLE public.scheduled_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.agent_schedules(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  generated_content TEXT,
  output_result JSONB DEFAULT '{}',
  error_message TEXT,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_runs
CREATE POLICY "Users can view their own runs" 
ON public.scheduled_runs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert runs" 
ON public.scheduled_runs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update runs" 
ON public.scheduled_runs 
FOR UPDATE 
USING (true);

-- Create index for efficient schedule lookups
CREATE INDEX idx_agent_schedules_next_run ON public.agent_schedules(next_run_at) WHERE is_enabled = true;
CREATE INDEX idx_scheduled_runs_schedule ON public.scheduled_runs(schedule_id);

-- Function to calculate next run time from cron expression
CREATE OR REPLACE FUNCTION public.calculate_next_run(
  p_cron TEXT,
  p_timezone TEXT DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  v_now TIMESTAMP WITH TIME ZONE;
  v_parts TEXT[];
  v_minute INT;
  v_hour INT;
  v_day_of_week INT;
  v_next_run TIMESTAMP WITH TIME ZONE;
BEGIN
  v_now := NOW() AT TIME ZONE p_timezone;
  v_parts := string_to_array(p_cron, ' ');
  
  -- Parse cron: minute hour day month day_of_week
  v_minute := CASE WHEN v_parts[1] = '*' THEN 0 ELSE v_parts[1]::INT END;
  v_hour := CASE WHEN v_parts[2] = '*' THEN 0 ELSE v_parts[2]::INT END;
  
  -- Simple next run calculation (for basic cron patterns)
  v_next_run := date_trunc('hour', v_now) + 
    make_interval(hours := v_hour - EXTRACT(hour FROM v_now)::INT, mins := v_minute);
  
  -- If next run is in the past, add appropriate interval
  IF v_next_run <= v_now THEN
    -- Check if it's a daily pattern
    IF v_parts[3] = '*' AND v_parts[4] = '*' AND v_parts[5] = '*' THEN
      v_next_run := v_next_run + interval '1 day';
    -- Weekly pattern
    ELSIF v_parts[5] != '*' THEN
      v_day_of_week := v_parts[5]::INT;
      v_next_run := v_next_run + make_interval(days := 
        CASE 
          WHEN v_day_of_week >= EXTRACT(dow FROM v_now)::INT 
          THEN v_day_of_week - EXTRACT(dow FROM v_now)::INT 
          ELSE 7 - EXTRACT(dow FROM v_now)::INT + v_day_of_week 
        END);
      IF v_next_run <= v_now THEN
        v_next_run := v_next_run + interval '7 days';
      END IF;
    -- Hourly pattern
    ELSIF v_parts[1] != '*' AND v_parts[2] = '*' THEN
      v_next_run := v_next_run + interval '1 hour';
    ELSE
      v_next_run := v_next_run + interval '1 day';
    END IF;
  END IF;
  
  RETURN v_next_run AT TIME ZONE p_timezone;
END;
$$ LANGUAGE plpgsql STABLE;