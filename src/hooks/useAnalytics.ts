import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

interface ConsentStatus {
  metadata_collection: boolean;
  usage_analytics: boolean;
  prompt_analysis: boolean;
  error_tracking: boolean;
}

interface AnalyticsEvent {
  event_type: 'prompt' | 'response' | 'error' | 'session_start' | 'session_end';
  agent_id?: string;
  prompt_text?: string;
  response_preview?: string;
  response_time_ms?: number;
  tokens_used?: number;
  error_type?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
}

export function useAnalytics() {
  const { user } = useAuth();
  const [consent, setConsent] = useState<ConsentStatus | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConsent();
    }
  }, [user]);

  const fetchConsent = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_consent')
      .select('metadata_collection, usage_analytics, prompt_analysis, error_tracking')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setConsent(data);
    }
    setLoaded(true);
  };

  const trackEvent = useCallback(
    async (event: AnalyticsEvent) => {
      if (!user || !consent) return;

      // Check if we have consent for this type of event
      const canTrackPrompt = consent.prompt_analysis && event.prompt_text;
      const canTrackUsage = consent.usage_analytics;
      const canTrackError = consent.error_tracking && event.error_type;

      // Don't track if no relevant consent
      if (event.event_type === 'prompt' && !canTrackPrompt) return;
      if (event.event_type === 'error' && !canTrackError) return;
      if (!canTrackUsage && event.event_type !== 'error') return;

      const insertData = {
        user_id: user.id,
        event_type: event.event_type,
        agent_id: event.agent_id || null,
        response_time_ms: event.response_time_ms || null,
        tokens_used: event.tokens_used || null,
        metadata: (event.metadata || {}) as Json,
        prompt_text: canTrackPrompt ? event.prompt_text : null,
        response_preview: consent.usage_analytics && event.response_preview 
          ? event.response_preview.substring(0, 200) 
          : null,
        error_type: canTrackError ? event.error_type : null,
        error_message: canTrackError ? event.error_message : null,
      };

      await supabase.from('platform_analytics').insert(insertData);
    },
    [user, consent]
  );

  const trackAgentIssue = useCallback(
    async (
      agentId: string,
      issueType: string,
      description: string,
      samplePrompt?: string
    ) => {
      if (!consent?.error_tracking) return;

      // Check if this issue already exists
      const { data: existing } = await supabase
        .from('agent_issues')
        .select('id, occurrence_count, sample_prompts')
        .eq('agent_id', agentId)
        .eq('issue_type', issueType)
        .eq('resolved', false)
        .single();

      if (existing) {
        // Update existing issue
        const samples = (existing.sample_prompts as string[]) || [];
        if (samplePrompt && samples.length < 5) {
          samples.push(samplePrompt);
        }

        await supabase
          .from('agent_issues')
          .update({
            occurrence_count: existing.occurrence_count + 1,
            sample_prompts: samples,
          })
          .eq('id', existing.id);
      } else {
        // Create new issue
        await supabase.from('agent_issues').insert({
          agent_id: agentId,
          issue_type: issueType,
          issue_description: description,
          sample_prompts: samplePrompt ? [samplePrompt] : [],
        });
      }
    },
    [consent]
  );

  return {
    consent,
    loaded,
    trackEvent,
    trackAgentIssue,
    hasConsent: (type: keyof ConsentStatus) => consent?.[type] ?? false,
  };
}
