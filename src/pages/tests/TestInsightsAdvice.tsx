import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { getInsights, postAdvice, postChat } from "@/lib/recai";

export default function TestInsights() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState("");
  // Advice
  const [adviceBody, setAdviceBody] = useState("{\n  \"topic\": \"budget_optimization\",\n  \"timeframe\": \"monthly\",\n  \"focus_areas\": [\"food\", \"transportation\"]\n}");
  // Chat
  const [message, setMessage] = useState("How can I reduce my monthly expenses?");
  const [context, setContext] = useState("budget_planning");
  // Insights
  const [insightType, setInsightType] = useState("spending_forecast");
  const [timeframe, setTimeframe] = useState("next_month");
  useEffect(() => { document.title = "Insights & Advice | API Tests"; }, []);

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    try { setResult(await fn()); } catch (e: any) { setResult({ error: e.message }); } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold">API Test: Insights, Advice & Chat</h1>
          <ApiTokenDialog />
        </div>
      </header>
      <section className="container py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>POST /v1/instances/{"{id}"}/advice</CardTitle>
            <CardDescription>Generate Advice (JSON body)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>JSON Body</Label>
              <Textarea rows={6} value={adviceBody} onChange={(e) => setAdviceBody(e.target.value)} />
            </div>
            <Button onClick={() => run(() => postAdvice(instanceId, JSON.parse(adviceBody)))} disabled={loading || !instanceId}>Send</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>POST /v1/instances/{"{id}"}/chat</CardTitle>
            <CardDescription>Conversational Chat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Message</Label>
              <Input value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Context (optional)</Label>
              <Input value={context} onChange={(e) => setContext(e.target.value)} />
            </div>
            <Button onClick={() => run(() => postChat(instanceId, { message, context: context || undefined }))} disabled={loading || !instanceId || !message}>Send</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GET /v1/instances/{"{id}"}/insights</CardTitle>
            <CardDescription>Predictive Insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>insight_type</Label>
                <Input value={insightType} onChange={(e) => setInsightType(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>timeframe</Label>
                <Input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => run(() => getInsights(instanceId, { insight_type: insightType, timeframe }))} disabled={loading || !instanceId}>Fetch</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Latest API response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-3 bg-muted/30 overflow-auto">
              <pre className="text-xs whitespace-pre-wrap">{result ? JSON.stringify(result, null, 2) : "No result yet"}</pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
