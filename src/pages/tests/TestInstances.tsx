import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { createInstance, deleteInstance, getInstance, listInstances, updateInstance } from "@/lib/recai";

export default function TestInstances() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instanceId, setInstanceId] = useState("");
  useEffect(() => { document.title = "Instances | API Tests"; }, []);

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    try { setResult(await fn()); } catch (e: any) { setResult({ error: e.message }); } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold">API Test: Instances</h1>
          <ApiTokenDialog />
        </div>
      </header>
      <section className="container py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>POST /v1/instances</CardTitle>
            <CardDescription>Create Workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button onClick={() => run(() => createInstance({ name, description: description || undefined }))} disabled={loading}>
              {loading ? "Working..." : "Create"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GET /v1/instances</CardTitle>
            <CardDescription>List Workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => run(() => listInstances())} disabled={loading}>{loading ? "Working..." : "List"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GET /v1/instances/{"{id}"}</CardTitle>
            <CardDescription>Get Workspace Details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="iid">Instance ID</Label>
              <Input id="iid" value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <Button onClick={() => run(() => getInstance(instanceId))} disabled={loading || !instanceId}>Fetch</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PUT /v1/instances/{"{id}"}</CardTitle>
            <CardDescription>Rename / Update</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="iid2">Instance ID</Label>
              <Input id="iid2" value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name2">New Name</Label>
              <Input id="name2" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button onClick={() => run(() => updateInstance(instanceId, { name }))} disabled={loading || !instanceId}>Update</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DELETE /v1/instances/{"{id}"}</CardTitle>
            <CardDescription>Delete Workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="iid3">Instance ID</Label>
              <Input id="iid3" value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
            <Button variant="destructive" onClick={() => run(() => deleteInstance(instanceId))} disabled={loading || !instanceId}>Delete</Button>
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
