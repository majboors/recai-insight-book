import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { addCategory, recaiRequest, renameCategory, removeCategory } from "@/lib/recai";

export default function TestCategories() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState("");
  const [categoriesCsv, setCategoriesCsv] = useState("Food, Transportation, Entertainment");
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<"income" | "expense">("expense");
  const [catId, setCatId] = useState("");
  useEffect(() => { document.title = "Categories | API Tests"; }, []);

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    try { setResult(await fn()); } catch (e: any) { setResult({ error: e.message }); } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold">API Test: Categories</h1>
          <ApiTokenDialog />
        </div>
      </header>
      <section className="container py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>POST /v1/instances/{"{id}"}/initialize</CardTitle>
            <CardDescription>Bulk initialise categories (CSV string)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="iid">Instance ID</Label>
              <Input id="iid" value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="csv">Categories (comma separated)</Label>
              <Textarea id="csv" value={categoriesCsv} onChange={(e) => setCategoriesCsv(e.target.value)} />
            </div>
            <Button onClick={() => run(() => recaiRequest("POST", `/v1/instances/${instanceId}/initialize`, { categories: categoriesCsv }))} disabled={loading || !instanceId}>Initialise</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>POST /v1/instances/{"{id}"}/categories</CardTitle>
            <CardDescription>Add single category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="iid2">Instance ID</Label>
              <Input id="iid2" value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cname">Name</Label>
              <Input id="cname" value={catName} onChange={(e) => setCatName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ctype">Type</Label>
              <Input id="ctype" value={catType} onChange={(e) => setCatType(e.target.value as any)} />
            </div>
            <Button onClick={() => run(() => addCategory(instanceId, { name: catName, type: catType }))} disabled={loading || !instanceId || !catName}>Add</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PUT /v1/categories/{"{cat_id}"}</CardTitle>
            <CardDescription>Rename category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="cid">Category ID</Label>
              <Input id="cid" value={catId} onChange={(e) => setCatId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newname">New Name</Label>
              <Input id="newname" value={catName} onChange={(e) => setCatName(e.target.value)} />
            </div>
            <Button onClick={() => run(() => renameCategory(catId, catName))} disabled={loading || !catId || !catName}>Rename</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DELETE /v1/categories/{"{cat_id}"}</CardTitle>
            <CardDescription>Delete category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="cid2">Category ID</Label>
              <Input id="cid2" value={catId} onChange={(e) => setCatId(e.target.value)} />
            </div>
            <Button variant="destructive" onClick={() => run(() => removeCategory(catId))} disabled={loading || !catId}>Delete</Button>
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
