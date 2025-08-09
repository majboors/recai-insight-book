import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCategory, exportCSV, getBudgets, getGraphs, getInsights, getReports, postAdvice, postChat, uploadReceipt, upsertBudget } from "@/lib/recai";
import { Download, Bell, ScanLine, Send } from "lucide-react";
import { toast } from "sonner";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

export default function BookDashboard() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "overview";

  useEffect(() => {
    document.title = `Book Dashboard | ${id}`;
  }, [id]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <aside>
          <AppSidebar />
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="border-b">
            <div className="container h-14 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Book Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <ReceiptScanner instanceId={id!} />
                <InsightsBell instanceId={id!} />
              </div>
            </div>
          </header>
          <main className="container py-6 space-y-6">
            {tab === "overview" && <OverviewTab instanceId={id!} />}
            {tab === "budgets" && <BudgetsTab instanceId={id!} />}
            {tab === "reports" && <ReportsTab instanceId={id!} />}
            {tab === "categories" && <CategoriesTab instanceId={id!} />}
            {tab === "receipts" && <ReceiptsTab instanceId={id!} />}
            {tab === "chat" && <ChatTab instanceId={id!} />}
          </main>
        </div>
      </div>
      <ChatWidget instanceId={id!} />
    </SidebarProvider>
  );
}

function OverviewTab({ instanceId }: { instanceId: string }) {
  const graphsQ = useQuery<any>({
    queryKey: ["graphs", instanceId],
    queryFn: () => getGraphs(instanceId, { chart_type: "expense_breakdown", format: "json" }),
  });
  const graphs: any = graphsQ.data as any;
  const reportsQ = useQuery<any>({
    queryKey: ["reports", instanceId],
    queryFn: () => getReports(instanceId, { report_type: "summary", start_date: "2024-01-01", end_date: "2024-01-31" }),
  });
  const reports: any = reportsQ.data as any;

  const colors: string[] = graphs?.data?.datasets?.[0]?.backgroundColor || [];
  const chartData = useMemo(() => {
    const labels = graphs?.data?.labels || [];
    const vals = graphs?.data?.datasets?.[0]?.data || [];
    return labels.map((l: string, i: number) => ({ name: l, value: vals[i] }));
  }, [graphs]);

  const hasData = chartData.length > 0 && !graphs?.error;
  const hasError = reports?.[0]?.error || graphs?.error;

  if (hasError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Book</CardTitle>
            <CardDescription>Get started by setting up your categories and uploading receipts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>No data found for this workspace yet. Here's how to get started:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Go to the <strong>Categories</strong> tab to set up expense categories</li>
                <li>Use the <strong>scan icon</strong> in the header to upload receipts</li>
                <li>Set up budgets in the <strong>Budgets</strong> tab</li>
                <li>Start tracking your expenses!</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.hash = "#categories"} variant="default">
                Set Up Categories
              </Button>
              <Button onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()} variant="outline">
                Upload First Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RTooltip />
                <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={110}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length] || "hsl(var(--primary))"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p>No expense data yet</p>
                <p className="text-sm">Upload receipts to see your spending breakdown</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between"><span>Total Income</span><span>{reports?.summary?.total_income ?? "-"}</span></div>
          <Separator />
          <div className="flex justify-between"><span>Total Expenses</span><span>{reports?.summary?.total_expenses ?? "-"}</span></div>
          <Separator />
          <div className="flex justify-between"><span>Net Balance</span><span>{reports?.summary?.net_balance ?? "-"}</span></div>
          <div className="pt-4">
            <ExportCSVButton instanceId={instanceId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BudgetsTab({ instanceId }: { instanceId: string }) {
  const [period, setPeriod] = useState("monthly");
  const budgetsQ = useQuery<any>({ queryKey: ["budgets", instanceId, period], queryFn: () => getBudgets(instanceId, { period, date: "2024-01-01" }) });
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (payload: { category_id: string; amount: number; period: string; start_date?: string }) => upsertBudget(instanceId, payload),
    onSuccess: () => {
      toast.success("Budget saved");
      qc.invalidateQueries({ queryKey: ["budgets", instanceId, period] });
      budgetsQ.refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  let cat = ""; let amt = 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label>Period</Label>
        <select className="border rounded px-2 py-1 bg-background" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <Button onClick={() => m.mutate({ category_id: cat, amount: amt, period })} disabled={m.isPending}>Quick add (set fields below)</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {budgetsQ.data?.budgets?.map((b: any) => (
          <Card key={b.id}>
            <CardHeader><CardTitle className="text-base">{b.category?.name ?? b.category_name}</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Budget</span><span>{b.budget_amount ?? b.amount}</span></div>
              <div className="flex justify-between"><span>Spent</span><span>{b.spent_amount ?? b.current_spent}</span></div>
              <div className="flex justify-between"><span>Remaining</span><span>{b.remaining}</span></div>
              <div className="flex justify-between"><span>Status</span><span>{b.status}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Add / Update Budget</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          <div className="grid gap-1"><Label>Category ID</Label><Input onChange={(e) => (cat = e.target.value)} placeholder="cat_123" /></div>
          <div className="grid gap-1"><Label>Amount</Label><Input type="number" onChange={(e) => (amt = Number(e.target.value))} placeholder="500" /></div>
          <div className="flex items-end"><Button onClick={() => m.mutate({ category_id: cat, amount: amt, period })}>Save</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsTab({ instanceId }: { instanceId: string }) {
  const repQ = useQuery<any>({ queryKey: ["report-summary", instanceId], queryFn: () => getReports(instanceId, { report_type: "summary", start_date: "2024-01-01", end_date: "2024-01-31" }) });
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>By Category</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {repQ.data?.by_category?.map((c: any) => (
            <div key={c.category} className="flex justify-between text-sm">
              <span>{c.category}</span>
              <span>{c.amount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesTab({ instanceId }: { instanceId: string }) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (payload: { name: string; type: "income" | "expense"; color?: string }) => addCategory(instanceId, payload),
    onSuccess: () => { toast.success("Category added"); qc.invalidateQueries({ queryKey: ["budgets", instanceId] }); },
    onError: (e: any) => toast.error(e.message),
  });
  let cname = ""; let ctype: "income" | "expense" = "expense"; let ccolor = "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Category</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-4 gap-3">
          <div className="grid gap-1"><Label>Name</Label><Input onChange={(e) => (cname = e.target.value)} /></div>
          <div className="grid gap-1"><Label>Type</Label>
            <select className="border rounded px-2 py-1 bg-background" onChange={(e) => (ctype = e.target.value as any)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="grid gap-1"><Label>Color (hex)</Label><Input onChange={(e) => (ccolor = e.target.value)} placeholder="#FF6B6B" /></div>
          <div className="flex items-end"><Button onClick={() => m.mutate({ name: cname, type: ctype, color: ccolor || undefined })}>Add</Button></div>
        </CardContent>
      </Card>
      <AIHints instanceId={instanceId} />
    </div>
  );
}

function ReceiptsTab({ instanceId }: { instanceId: string }) {
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>Use the scan button in the header to upload a receipt and parse it.</p>
    </div>
  );
}

function ChatTab({ instanceId }: { instanceId: string }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const m = useMutation({
    mutationFn: (message: string) => postChat(instanceId, { message, context: "budget_planning" }),
    onSuccess: (r: any) => setHistory((h) => [...h, { role: "assistant", content: r.response || JSON.stringify(r) }]),
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Card>
      <CardHeader><CardTitle>AI Chat</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-72 overflow-auto space-y-2">
          {history.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}><span className="inline-block px-3 py-2 rounded bg-secondary">{m.content}</span></div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ask about your budget..." />
          <Button onClick={() => { if (!msg) return; setHistory((h) => [...h, { role: "user", content: msg }]); m.mutate(msg); setMsg(""); }}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatWidget({ instanceId }: { instanceId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6">
      {open && (
        <div className="mb-2 w-80 rounded border bg-background shadow-lg">
          <div className="p-3 border-b font-medium">Quick Chat</div>
          <div className="p-3"><ChatTab instanceId={instanceId} /></div>
        </div>
      )}
      <Button variant="secondary" onClick={() => setOpen((o) => !o)}>AI Chat</Button>
    </div>
  );
}

function InsightsBell({ instanceId }: { instanceId: string }) {
  const { data, refetch } = useQuery({ queryKey: ["insights", instanceId], queryFn: () => getInsights(instanceId, { insight_type: "spending_forecast", timeframe: "next_month" }) });
  const gen = useMutation({ mutationFn: () => postAdvice(instanceId, { topic: "budget_optimization", timeframe: "monthly" }), onSuccess: () => { toast.success("Advice generated"); refetch(); }, onError: (e: any) => toast.error(e.message) });
  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => gen.mutate()}><Bell className="h-4 w-4" /></Button>
      {/* Simple tooltip */}
      <div className="absolute right-0 mt-2 w-72 bg-background border rounded shadow hidden md:block">
        <div className="p-3 text-sm">
          <div className="font-medium mb-1">Insights</div>
          <div className="text-muted-foreground">{data ? "Forecast ready. Click bell to refresh advice." : "No insights yet."}</div>
        </div>
      </div>
    </div>
  );
}

function ReceiptScanner({ instanceId }: { instanceId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const m = useMutation({
    mutationFn: (file: File) => uploadReceipt(file, instanceId),
    onSuccess: (r: any) => toast.success(`Receipt parsed: ${r?.parsed_data?.merchant ?? r?.id}`),
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) m.mutate(f);
      }} />
      <Button variant="secondary" onClick={() => inputRef.current?.click()}><ScanLine className="h-4 w-4" /></Button>
    </div>
  );
}

function ExportCSVButton({ instanceId }: { instanceId: string }) {
  const [downloading, setDownloading] = useState(false);
  const onDownload = async () => {
    try {
      setDownloading(true);
      const blob = await exportCSV(instanceId, { start_date: "2024-01-01", end_date: "2024-01-31" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${instanceId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDownloading(false);
    }
  };
  return (
    <Button variant="secondary" onClick={onDownload} disabled={downloading}>
      <Download className="h-4 w-4 mr-2" /> {downloading ? "Preparing..." : "Export CSV"}
    </Button>
  );
}

function AIHints({ instanceId }: { instanceId: string }) {
  const m = useMutation({
    mutationFn: () => postChat(instanceId, { message: "Suggest 3 new useful budgeting categories for my spending.", context: "category_suggestions" }),
    onSuccess: (r: any) => toast.success("Suggestions ready. Check AI Chat tab."),
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Card>
      <CardHeader><CardTitle>AI Category Suggestions</CardTitle></CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Ask AI for category ideas based on your data.</p>
        <Button onClick={() => m.mutate()}>Get Suggestions</Button>
      </CardContent>
    </Card>
  );
}
