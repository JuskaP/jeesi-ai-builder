import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedKeywords: string[];
  result?: {
    passed: boolean;
    response: string;
    responseTime: number;
    matchedKeywords: string[];
  };
}

interface TestSuiteProps {
  agentId: string;
}

export default function TestSuite({ agentId }: TestSuiteProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      name: 'Basic greeting',
      input: 'Hello!',
      expectedKeywords: ['hello', 'hi', 'help', 'assist']
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  
  // New test form
  const [newTestName, setNewTestName] = useState('');
  const [newTestInput, setNewTestInput] = useState('');
  const [newTestKeywords, setNewTestKeywords] = useState('');

  const addTestCase = () => {
    if (!newTestName.trim() || !newTestInput.trim()) {
      toast.error('Please fill in test name and input');
      return;
    }

    const keywords = newTestKeywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    const newTest: TestCase = {
      id: Date.now().toString(),
      name: newTestName.trim(),
      input: newTestInput.trim(),
      expectedKeywords: keywords
    };

    setTestCases(prev => [...prev, newTest]);
    setNewTestName('');
    setNewTestInput('');
    setNewTestKeywords('');
    toast.success('Test case added');
  };

  const removeTestCase = (id: string) => {
    setTestCases(prev => prev.filter(t => t.id !== id));
  };

  const runSingleTest = async (testCase: TestCase): Promise<TestCase> => {
    const startTime = Date.now();

    try {
      const response = await supabase.functions.invoke('agent-runtime', {
        body: {
          agentId,
          messages: [{ role: 'user', content: testCase.input }],
          stream: false
        }
      });

      const responseTime = Date.now() - startTime;

      if (response.error) {
        return {
          ...testCase,
          result: {
            passed: false,
            response: `Error: ${response.error.message}`,
            responseTime,
            matchedKeywords: []
          }
        };
      }

      const agentResponse = response.data?.response || response.data?.message || '';
      const responseLower = agentResponse.toLowerCase();
      
      const matchedKeywords = testCase.expectedKeywords.filter(keyword => 
        responseLower.includes(keyword.toLowerCase())
      );

      const passed = testCase.expectedKeywords.length === 0 || matchedKeywords.length > 0;

      return {
        ...testCase,
        result: {
          passed,
          response: agentResponse,
          responseTime,
          matchedKeywords
        }
      };
    } catch (error: any) {
      return {
        ...testCase,
        result: {
          passed: false,
          response: `Error: ${error.message}`,
          responseTime: Date.now() - startTime,
          matchedKeywords: []
        }
      };
    }
  };

  const runTest = async (testId: string) => {
    const testCase = testCases.find(t => t.id === testId);
    if (!testCase) return;

    setRunningTestId(testId);
    const result = await runSingleTest(testCase);
    setTestCases(prev => prev.map(t => t.id === testId ? result : t));
    setRunningTestId(null);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    const results: TestCase[] = [];
    for (const testCase of testCases) {
      setRunningTestId(testCase.id);
      const result = await runSingleTest(testCase);
      results.push(result);
      setTestCases(prev => prev.map(t => t.id === testCase.id ? result : t));
    }
    
    setRunningTestId(null);
    setIsRunning(false);

    const passed = results.filter(r => r.result?.passed).length;
    const total = results.length;
    
    if (passed === total) {
      toast.success(`All ${total} tests passed!`);
    } else {
      toast.warning(`${passed}/${total} tests passed`);
    }
  };

  const passedCount = testCases.filter(t => t.result?.passed).length;
  const failedCount = testCases.filter(t => t.result && !t.result.passed).length;
  const pendingCount = testCases.filter(t => !t.result).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Tests</span>
              <Badge variant="outline">{testCases.length}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Passed</span>
              <Badge variant="default" className="bg-green-500">{passedCount}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Failed</span>
              <Badge variant="destructive">{failedCount}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Badge variant="secondary">{pendingCount}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run All Button */}
      <div className="flex justify-end">
        <Button onClick={runAllTests} disabled={isRunning || testCases.length === 0}>
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {/* Test Cases */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {testCases.map((test) => (
            <Card key={test.id} className={test.result ? (test.result.passed ? 'border-green-500/50' : 'border-destructive/50') : ''}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {test.result ? (
                      test.result.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )
                    ) : runningTestId === test.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    <CardTitle className="text-sm">{test.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.result && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {test.result.responseTime}ms
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => runTest(test.id)}
                      disabled={isRunning}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestCase(test.id)}
                      disabled={isRunning}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-0 pb-3">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Input: </span>
                    <span className="font-mono bg-muted px-1 rounded">{test.input}</span>
                  </div>
                  {test.expectedKeywords.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground">Expected keywords: </span>
                      {test.expectedKeywords.map((kw, i) => (
                        <Badge 
                          key={i} 
                          variant={test.result?.matchedKeywords.includes(kw) ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {test.result && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                      <span className="text-muted-foreground">Response: </span>
                      <span className="line-clamp-3">{test.result.response}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Add New Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Add Test Case
          </CardTitle>
          <CardDescription>Create a new automated test for your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testName">Test Name</Label>
              <Input
                id="testName"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                placeholder="e.g., Product inquiry test"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Expected Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={newTestKeywords}
                onChange={(e) => setNewTestKeywords(e.target.value)}
                placeholder="e.g., price, product, available"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="testInput">Test Input (message to send)</Label>
            <Textarea
              id="testInput"
              value={newTestInput}
              onChange={(e) => setNewTestInput(e.target.value)}
              placeholder="e.g., What products do you offer?"
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={addTestCase} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Test Case
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
