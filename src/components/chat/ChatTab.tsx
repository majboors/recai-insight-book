import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { postChat } from "@/lib/recai";
import { toast } from "sonner";

export function ChatTab({ instanceId }: { instanceId: string }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const m = useMutation({
    mutationFn: (message: string) => postChat(instanceId, { message, context: "budget_planning" }),
    onSuccess: (r: any) => setHistory((h) => [...h, { role: "assistant", content: r.response || JSON.stringify(r) }]),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-72 overflow-auto space-y-2">
          {history.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span className="inline-block px-3 py-2 rounded bg-secondary">{m.content}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ask about your budget..." />
          <Button
            onClick={() => {
              if (!msg) return;
              setHistory((h) => [...h, { role: "user", content: msg }]);
              m.mutate(msg);
              setMsg("");
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
