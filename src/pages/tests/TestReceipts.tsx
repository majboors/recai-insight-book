import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { getReceipt, patchReceipt, uploadReceipt } from "@/lib/recai";

export default function TestReceipts() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState("");
  const [receiptId, setReceiptId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [patchBody, setPatchBody] = useState("{\n  \"total\": 25.99\n}");
  useEffect(() => { document.title = "Receipts | API Tests"; }, []);

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    try { setResult(await fn()); } catch (e: any) { setResult({ error: e.message }); } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold">API Test: Receipts</h1>
          <ApiTokenDialog />
        </div>
      </header>
      <section className="container py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>POST /v1/receipts</CardTitle>
            <CardDescription>Upload & Parse Receipt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="iid">Instance ID</Label>
              <Input id="iid" value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Receipt Image</Label>
              <Input id="file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={() => run(() => uploadReceipt(file as File, instanceId))} disabled={loading || !instanceId || !file}>Upload</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GET /v1/receipts/{"{receipt_id}"}</CardTitle>
            <CardDescription>Retrieve Parsed Receipt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="rid">Receipt ID</Label>
              <Input id="rid" value={receiptId} onChange={(e) => setReceiptId(e.target.value)} />
            </div>
            <Button onClick={() => run(() => getReceipt(receiptId))} disabled={loading || !receiptId}>Fetch</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PATCH /v1/receipts/{"{receipt_id}"}</CardTitle>
            <CardDescription>Correct Parsed Receipt (JSON body)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="rid2">Receipt ID</Label>
              <Input id="rid2" value={receiptId} onChange={(e) => setReceiptId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">JSON Body</Label>
              <Textarea id="body" rows={6} value={patchBody} onChange={(e) => setPatchBody(e.target.value)} />
            </div>
            <Button onClick={() => run(() => patchReceipt(receiptId, JSON.parse(patchBody)))} disabled={loading || !receiptId}>Patch</Button>
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
