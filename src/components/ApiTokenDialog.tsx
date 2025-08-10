import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRecaiAuth } from "@/hooks/useRecaiAuth";
import { API_BASE_DEFAULT, health } from "@/lib/recai";

export default function ApiTokenDialog() {
  const { toast } = useToast();
  const { token, baseUrl, setToken, setBaseUrl } = useRecaiAuth();
  const [open, setOpen] = useState(false);
  const [t, setT] = useState(token || "");
  const [b, setB] = useState(baseUrl || API_BASE_DEFAULT);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setLoading(true);
    try {
      setToken(t.trim());
      setBaseUrl(b.trim() || API_BASE_DEFAULT);
      await health();
      toast({ title: "Connected", description: "API connection looks healthy." });
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Connection failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">{token ? "API Connected" : "Connect API"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect to RecAI API</DialogTitle>
          <DialogDescription>Paste your Bearer token. It will be stored securely in your account.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="base">API Base URL</Label>
            <Input id="base" value={b} onChange={(e) => setB(e.target.value)} placeholder={API_BASE_DEFAULT} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="token">Bearer Token</Label>
            <Input id="token" value={t} onChange={(e) => setT(e.target.value)} placeholder="YOUR_TOKEN" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave} disabled={loading}>{loading ? "Checking..." : "Save & Test"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
