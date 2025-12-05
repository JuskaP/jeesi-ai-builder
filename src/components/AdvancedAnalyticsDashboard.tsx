import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Bot, Zap, Clock, 
  Download, RefreshCw, Calendar, Activity, Lock
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface AdvancedAnalyticsDashboardProps {
  userId: string;
  hasAccess: boolean; // Business+ tier check
}

interface AnalyticsData {
  totalCalls: number;
  totalCreditsUsed: number;
  avgResponseTime: number;
  uniqueAgents: number;
  callsByDay: { date: string; calls: number; credits: number }[];
  callsByAgent: { name: string; calls: number; credits: number }[];
  callsByType: { type: string; count: number }[];
  errorRate: number;
  peakHour: number;
  trendsComparison: {
    callsChange: number;
    creditsChange: number;
    responseTimeChange: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdvancedAnalyticsDashboard({ userId, hasAccess }: AdvancedAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (hasAccess) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [userId, timeRange, hasAccess]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - days);

      // Fetch credit usage data
      const { data: usageData, error: usageError } = await supabase
        .from('credit_usage')
        .select('*, agents(name)')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (usageError) throw usageError;

      // Fetch previous period for comparison
      const { data: previousUsageData } = await supabase
        .from('credit_usage')
        .select('credits_used, metadata')
        .eq('user_id', userId)
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      // Process current period data
      const totalCalls = usageData?.length || 0;
      const totalCreditsUsed = usageData?.reduce((sum, u) => sum + (u.credits_used || 0), 0) || 0;
      
      // Calculate avg response time from metadata
      let totalResponseTime = 0;
      let responseTimeCount = 0;
      let errorCount = 0;
      const hourCounts: Record<number, number> = {};

      usageData?.forEach((usage) => {
        const meta = usage.metadata as Record<string, any> | null;
        if (meta?.response_time) {
          totalResponseTime += meta.response_time;
          responseTimeCount++;
        }
        if (meta?.success === false || meta?.error) {
          errorCount++;
        }
        const hour = new Date(usage.created_at || '').getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
      const errorRate = totalCalls > 0 ? (errorCount / totalCalls) * 100 : 0;
      
      // Find peak hour
      let peakHour = 0;
      let maxHourCalls = 0;
      Object.entries(hourCounts).forEach(([hour, count]) => {
        if (count > maxHourCalls) {
          maxHourCalls = count;
          peakHour = parseInt(hour);
        }
      });

      // Group by day
      const callsByDayMap: Record<string, { calls: number; credits: number }> = {};
      usageData?.forEach((usage) => {
        const date = new Date(usage.created_at || '').toISOString().split('T')[0];
        if (!callsByDayMap[date]) {
          callsByDayMap[date] = { calls: 0, credits: 0 };
        }
        callsByDayMap[date].calls++;
        callsByDayMap[date].credits += usage.credits_used || 0;
      });

      const callsByDay = Object.entries(callsByDayMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Group by agent
      const callsByAgentMap: Record<string, { calls: number; credits: number }> = {};
      usageData?.forEach((usage) => {
        const agentName = (usage.agents as any)?.name || 'Unknown Agent';
        if (!callsByAgentMap[agentName]) {
          callsByAgentMap[agentName] = { calls: 0, credits: 0 };
        }
        callsByAgentMap[agentName].calls++;
        callsByAgentMap[agentName].credits += usage.credits_used || 0;
      });

      const callsByAgent = Object.entries(callsByAgentMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.calls - a.calls)
        .slice(0, 5);

      // Group by operation type
      const callsByTypeMap: Record<string, number> = {};
      usageData?.forEach((usage) => {
        const type = usage.operation_type || 'unknown';
        callsByTypeMap[type] = (callsByTypeMap[type] || 0) + 1;
      });

      const callsByType = Object.entries(callsByTypeMap)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate unique agents
      const uniqueAgentIds = new Set(usageData?.map(u => u.agent_id).filter(Boolean));
      const uniqueAgents = uniqueAgentIds.size;

      // Calculate trends comparison
      const prevTotalCalls = previousUsageData?.length || 0;
      const prevTotalCredits = previousUsageData?.reduce((sum, u) => sum + (u.credits_used || 0), 0) || 0;
      let prevTotalResponseTime = 0;
      let prevResponseTimeCount = 0;
      previousUsageData?.forEach((usage) => {
        const meta = usage.metadata as Record<string, any> | null;
        if (meta?.response_time) {
          prevTotalResponseTime += meta.response_time;
          prevResponseTimeCount++;
        }
      });
      const prevAvgResponseTime = prevResponseTimeCount > 0 ? prevTotalResponseTime / prevResponseTimeCount : 0;

      const callsChange = prevTotalCalls > 0 ? ((totalCalls - prevTotalCalls) / prevTotalCalls) * 100 : 0;
      const creditsChange = prevTotalCredits > 0 ? ((totalCreditsUsed - prevTotalCredits) / prevTotalCredits) * 100 : 0;
      const responseTimeChange = prevAvgResponseTime > 0 ? ((avgResponseTime - prevAvgResponseTime) / prevAvgResponseTime) * 100 : 0;

      setAnalytics({
        totalCalls,
        totalCreditsUsed,
        avgResponseTime,
        uniqueAgents,
        callsByDay,
        callsByAgent,
        callsByType,
        errorRate,
        peakHour,
        trendsComparison: {
          callsChange,
          creditsChange,
          responseTimeChange
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = analytics.callsByDay.map(d => 
      `${d.date},${d.calls},${d.credits}`
    ).join('\n');
    
    const blob = new Blob([`Date,Calls,Credits\n${csvData}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}.csv`;
    a.click();
  };

  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Advanced Analytics</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Unlock detailed analytics with charts, trends, and export capabilities. 
              Upgrade to Business tier or higher to access this feature.
            </p>
            <Badge variant="secondary">Business+ Required</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            Unable to load analytics data
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTrend = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">Detailed insights into your agent performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Total API Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCalls.toLocaleString()}</div>
            {formatTrend(analytics.trendsComparison.callsChange)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Credits Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCreditsUsed.toLocaleString()}</div>
            {formatTrend(analytics.trendsComparison.creditsChange)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgResponseTime > 0 ? `${Math.round(analytics.avgResponseTime)}ms` : 'N/A'}
            </div>
            {analytics.avgResponseTime > 0 && formatTrend(-analytics.trendsComparison.responseTimeChange)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-green-500" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueAgents}</div>
            <p className="text-xs text-muted-foreground">
              Peak hour: {analytics.peakHour}:00
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Over Time</CardTitle>
            <CardDescription>API calls and credits used per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.callsByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    name="API Calls"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="credits" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                    name="Credits Used"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Calls by Agent */}
        <Card>
          <CardHeader>
            <CardTitle>Top Agents</CardTitle>
            <CardDescription>Most active agents by API calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.callsByAgent} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="calls" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Calls" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Type</CardTitle>
            <CardDescription>Distribution of operation types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.callsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="type"
                    label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {analytics.callsByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>System health and reliability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-medium">{(100 - analytics.errorRate).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${100 - analytics.errorRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span className="font-medium text-destructive">{analytics.errorRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-destructive rounded-full"
                  style={{ width: `${analytics.errorRate}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Peak Usage Hour</p>
                  <p className="font-medium">{analytics.peakHour}:00 - {analytics.peakHour + 1}:00</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Credits/Call</p>
                  <p className="font-medium">
                    {analytics.totalCalls > 0 
                      ? (analytics.totalCreditsUsed / analytics.totalCalls).toFixed(2)
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Daily Avg Calls</p>
                  <p className="font-medium">
                    {analytics.callsByDay.length > 0
                      ? Math.round(analytics.totalCalls / analytics.callsByDay.length)
                      : 0
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Active Agents</p>
                  <p className="font-medium">{analytics.uniqueAgents}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}