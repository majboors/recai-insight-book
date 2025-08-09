import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { exportCSV, getGraphs, getReports } from "@/lib/recai";

export default function TestReports() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("summary");
  const [chartType, setChartType] = useState("expense_breakdown");
  useEffect(() => { document.title = "Reports, Graphs & Export | API Tests"; }, []);

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    try { setResult(await fn()); } catch (e: any) { setResult({ error: e.message }); } finally { setLoading(false); }
  };

  const onExport = async () => {
    setLoading(true);
    try {
      const blob = await exportCSV(instanceId, { start_date: startDate, end_date: endDate });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${instanceId || "instance"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setResult({ message: "CSV exported (download started)" });
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
          <h1 className="text-2xl font-semibold">API Test: Reports, Graphs & Export</h1>
          <ApiTokenDialog />
        </div>
      </header>
      <section className="container py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GET /v1/instances/{"{id}"}/reports</CardTitle>
            <CardDescription>Numeric Reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Report Type</Label>
                <Input value={reportType} onChange={(e) => setReportType(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => run(() => getReports(instanceId, { report_type: reportType, start_date: startDate, end_date: endDate }))} disabled={loading || !instanceId}>Fetch</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GET /v1/instances/{"{id}"}/graphs</CardTitle>
            <CardDescription>Chart Generator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Chart Type</Label>
                <Input value={chartType} onChange={(e) => setChartType(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => run(() => getGraphs(instanceId, { chart_type: chartType, start_date: startDate, end_date: endDate, format: "json" }))} disabled={loading || !instanceId}>Fetch</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GET /v1/instances/{"{id}"}/export?format=csv</CardTitle>
            <CardDescription>CSV Export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
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
            <Button onClick={onExport} disabled={loading || !instanceId}>Export CSV</Button>
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
