import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { health } from "@/lib/recai";

export default function TestHealth() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { document.title = "Health Check | API Tests"; }, []);

  const onTest = async () => {
    setLoading(true);
    try {
      const res = await health();
      setResult(res);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold">API Test: Health</h1>
          <ApiTokenDialog />
        </div>
      </header>
      <section className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>GET /v1/health</CardTitle>
            <CardDescription>Service liveness check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={onTest} disabled={loading}>{loading ? "Testing..." : "Run Test"}</Button>
            <div className="rounded-md border p-3 bg-muted/30 overflow-auto">
              <pre className="text-xs whitespace-pre-wrap">{result ? JSON.stringify(result, null, 2) : "No result yet"}</pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
