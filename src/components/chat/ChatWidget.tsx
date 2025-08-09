import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { X, MessageCircle } from "lucide-react";
import { ChatTab } from "./ChatTab";

interface ChatWidgetProps {
  instanceId?: string;
}

export function ChatWidget({ instanceId }: ChatWidgetProps) {
  // Per-session instance id stored locally
  const [storedInstanceId, setStoredInstanceId] = useState<string | null>(null);
  const [inputInstanceId, setInputInstanceId] = useState("");
  const [openDesktop, setOpenDesktop] = useState(false);

  useEffect(() => {
    const sid = sessionStorage.getItem("session_instance_id");
    if (sid) setStoredInstanceId(sid);
  }, []);

  const effectiveInstanceId = useMemo(() => instanceId || storedInstanceId || "", [instanceId, storedInstanceId]);

  const handleSetInstance = () => {
    const id = inputInstanceId.trim();
    if (!id) return;
    sessionStorage.setItem("session_instance_id", id);
    setStoredInstanceId(id);
    setInputInstanceId("");
  };

  const InstanceGate = () => (
    <div className="space-y-2">
      <Label>Instance ID</Label>
      <div className="flex gap-2">
        <Input value={inputInstanceId} onChange={(e) => setInputInstanceId(e.target.value)} placeholder="Enter instance id" />
        <Button onClick={handleSetInstance}>Set</Button>
      </div>
      <p className="text-xs text-muted-foreground">Tip: Open any book to auto-fill this.</p>
    </div>
  );

  // Mobile: bottom drawer
  return (
    <>
      {/* Mobile Drawer */}
      <div className="md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="fixed bottom-4 right-4 rounded-full h-12 w-12" size="icon">
              <MessageCircle className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="p-0">
            <DrawerHeader className="flex items-center justify-between px-4 py-3 border-b">
              <DrawerTitle>AI Assistant</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="p-4">
              {effectiveInstanceId ? (
                <ChatTab instanceId={effectiveInstanceId} />
              ) : (
                <InstanceGate />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Floating Panel */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        {openDesktop && (
          <div className="mb-2 w-80 rounded border bg-background shadow-lg">
            <div className="p-3 border-b font-medium flex items-center justify-between">
              <span>Quick Chat</span>
              <Button variant="ghost" size="icon" onClick={() => setOpenDesktop(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3">
              {effectiveInstanceId ? (
                <ChatTab instanceId={effectiveInstanceId} />
              ) : (
                <InstanceGate />
              )}
            </div>
          </div>
        )}
        <Button variant="secondary" onClick={() => setOpenDesktop((o) => !o)}>AI Chat</Button>
      </div>
    </>
  );
}
