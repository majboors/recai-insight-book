import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { listTransactions, upsertBudget, getBudgets } from "@/lib/recai";

export default function TestTransBudgets() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [amount, setAmount] = useState("500");
  const [startDate, setStartDate] = useState("");
  const [txnRange, setTxnRange] = useState({ start_date: "", end_date: "" });
  useEffect(() => { document.title = "Transactions & Budgets | API Tests"; }, []);

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    try { setResult(await fn()); } catch (e: any) { setResult({ error: e.message }); } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold">API Test: Transactions & Budgets</h1>
          <ApiTokenDialog />
        </div>
      </header>
      <section className="container py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GET /v1/instances/{"{id}"}/transactions</CardTitle>
            <CardDescription>List Transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="iid">Instance ID</Label>
              <Input id="iid" value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input type="date" value={txnRange.start_date} onChange={(e) => setTxnRange({ ...txnRange, start_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={txnRange.end_date} onChange={(e) => setTxnRange({ ...txnRange, end_date: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => run(() => listTransactions(instanceId, txnRange))} disabled={loading || !instanceId}>Fetch</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>POST /v1/instances/{"{id}"}/budgets</CardTitle>
            <CardDescription>Create / Update Budget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Category ID</Label>
              <Input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Period</Label>
              <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="daily | weekly | monthly" />
            </div>
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <Button onClick={() => run(() => upsertBudget(instanceId, { category_id: categoryId, amount: Number(amount), period, start_date: startDate || undefined }))} disabled={loading || !instanceId || !categoryId}>Send</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GET /v1/instances/{"{id}"}/budgets</CardTitle>
            <CardDescription>Get Budget Utilisation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Period</Label>
                <Input value={period} onChange={(e) => setPeriod(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => run(() => getBudgets(instanceId, { period, date: startDate }))} disabled={loading || !instanceId}>Fetch</Button>
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
