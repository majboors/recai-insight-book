import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { getInstance, renameCategory, getReports, getBudgets, getBaseUrl, getToken } from "@/lib/recai";

export default function TestApiTroubleshoot() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Shared inputs
  const [instanceId, setInstanceId] = useState("");

  // Category rename inputs
  const [catId, setCatId] = useState("");
  const [newCatName, setNewCatName] = useState("");

  // Transactions inputs
  const [amount, setAmount] = useState("25.00");
  const [txnCatId, setTxnCatId] = useState("");
  const [merchant, setMerchant] = useState("Test Store");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Reports inputs
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-01-31");
  const [refresh, setRefresh] = useState(true);

  // Budgets inputs
  const [period, setPeriod] = useState("monthly");
  const [budgetDate, setBudgetDate] = useState("");

  useEffect(() => { document.title = "API Troubleshooting Test | Receipt Spending Analyzer"; }, []);

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    try { setResult(await fn()); } catch (e: any) { setResult({ error: e.message }); } finally { setLoading(false); }
  };

  const refreshCategories = () => run(async () => {
    if (!instanceId) throw new Error("Instance ID required");
    // cache-busting
    const inst: any = await fetch(`${getBaseUrl()}/v1/instances/${instanceId}?_t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(async (r) => {
      if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`);
      return r.json();
    });
    return {
      categories: inst?.categories || inst?.data?.categories || inst?.instance?.categories || inst?.details?.categories || []
    };
  });

  const doRenameCategory = () => run(async () => {
    if (!catId || !newCatName.trim()) throw new Error("Category ID and new name are required");
    await renameCategory(catId, newCatName.trim());
    return { message: "Category renamed" };
  });

  const addTransaction = () => run(async () => {
    if (!instanceId) throw new Error("Instance ID required");
    if (!txnCatId) throw new Error("Transaction category_id required");
    const body = {
      amount: Number(amount),
      category_id: txnCatId,
      merchant,
      date,
      type: "expense",
    };
    const res = await fetch(`${getBaseUrl()}/v1/instances/${instanceId}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return await res.json();
  });

  const fetchMonthlyReport = () => run(async () => {
    if (!instanceId) throw new Error("Instance ID required");
    return await getReports(instanceId, {
      report_type: "summary",
      start_date: startDate,
      end_date: endDate,
      ...(refresh ? { refresh: "true", _t: String(Date.now()) } : {}),
    });
  });

  const recalcBudgets = () => run(async () => {
    if (!instanceId) throw new Error("Instance ID required");
    return await getBudgets(instanceId, {
      period,
      ...(budgetDate ? { date: budgetDate } : {}),
      recalculate: "true",
    });
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold">API Test: Troubleshooting Flow</h1>
          <ApiTokenDialog />
        </div>
      </header>

      <section className="container py-8 space-y-6">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Refresh and rename categories with cache-busting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={refreshCategories} disabled={loading || !instanceId}>Refresh Categories</Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Category ID</Label>
                <Input value={catId} onChange={(e) => setCatId(e.target.value)} />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label>New Name</Label>
                <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              </div>
            </div>
            <Button onClick={doRenameCategory} disabled={loading || !catId || !newCatName.trim()}>Rename</Button>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Add Transaction</CardTitle>
            <CardDescription>POST /v1/instances/{"{id}"}/transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Category ID</Label>
                <Input value={txnCatId} onChange={(e) => setTxnCatId(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Merchant</Label>
                <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <Button onClick={addTransaction} disabled={loading || !instanceId || !txnCatId}>Add Transaction</Button>
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Report</CardTitle>
            <CardDescription>Force refresh reports to bypass caching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchMonthlyReport} disabled={loading || !instanceId}>Fetch Report</Button>
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={refresh} onChange={(e) => setRefresh(e.target.checked)} />
                Add refresh & cache-busting
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Budgets */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Recalculation</CardTitle>
            <CardDescription>GET /v1/instances/{"{id}"}/budgets with period & date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Period</Label>
                <Input placeholder="daily | weekly | monthly" value={period} onChange={(e) => setPeriod(e.target.value)} />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label>Date</Label>
                <Input type="date" value={budgetDate} onChange={(e) => setBudgetDate(e.target.value)} />
              </div>
            </div>
            <Button onClick={recalcBudgets} disabled={loading || !instanceId}>Recalculate</Button>
          </CardContent>
        </Card>

        {/* Result */}
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
