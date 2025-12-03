import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Clock, Zap } from 'lucide-react';

interface HealthMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgResponseTime: number;
  creditsUsed: number;
  lastWeekCalls: number;
  commonErrors: { error: string; count: number }[];
}

interface AgentHealthDashboardProps {
  agentId: string;
}

export default function AgentHealthDashboard({ agentId }: AgentHealthDashboardProps) {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthMetrics();
  }, [agentId]);

  const fetchHealthMetrics = async () => {
    try {
      // Fetch credit usage for this agent
      const { data: usageData, error: usageError } = await supabase
        .from('credit_usage')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (usageError) throw usageError;

      // Calculate metrics
      const totalCalls = usageData?.length || 0;
      const creditsUsed = usageData?.reduce((sum, u) => sum + (u.credits_used || 0), 0) || 0;
      
      // Analyze metadata for errors and response times
      let successfulCalls = 0;
      let failedCalls = 0;
      let totalResponseTime = 0;
      const errorCounts: Record<string, number> = {};

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      let lastWeekCalls = 0;

      usageData?.forEach((usage) => {
        const meta = usage.metadata as Record<string, any> | null;
        
        if (new Date(usage.created_at || '') > oneWeekAgo) {
          lastWeekCalls++;
        }

        if (meta?.success === false || meta?.error) {
          failedCalls++;
          const errorMsg = meta?.error || 'Unknown error';
          errorCounts[errorMsg] = (errorCounts[errorMsg] || 0) + 1;
        } else {
          successfulCalls++;
        }

        if (meta?.response_time) {
          totalResponseTime += meta.response_time;
        }
      });

      const commonErrors = Object.entries(errorCounts)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setMetrics({
        totalCalls,
        successfulCalls,
        failedCalls,
        avgResponseTime: totalCalls > 0 ? totalResponseTime / totalCalls : 0,
        creditsUsed,
        lastWeekCalls,
        commonErrors
      });
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading health metrics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Unable to load health metrics
      </div>
    );
  }

  const successRate = metrics.totalCalls > 0 
    ? Math.round((metrics.successfulCalls / metrics.totalCalls) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total API Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCalls}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.lastWeekCalls} in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Credits Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.creditsUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total credits consumed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgResponseTime > 0 ? `${Math.round(metrics.avgResponseTime)}ms` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average execution time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {successRate >= 90 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : successRate >= 70 ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Success Rate
          </CardTitle>
          <CardDescription>
            {metrics.successfulCalls} successful / {metrics.failedCalls} failed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Success Rate</span>
              <span className="font-medium">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Common Errors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Common Errors
          </CardTitle>
          <CardDescription>Most frequent errors in agent execution</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.commonErrors.length > 0 ? (
            <div className="space-y-3">
              {metrics.commonErrors.map((err, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                  <span className="text-sm text-foreground truncate flex-1 mr-4">
                    {err.error}
                  </span>
                  <Badge variant="destructive">{err.count}x</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No errors recorded! Your agent is running smoothly.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
