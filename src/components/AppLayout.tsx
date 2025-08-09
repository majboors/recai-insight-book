import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageCircle, Settings, Book, Camera, BarChart3, Home, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getToken, setToken, getBaseUrl, setBaseUrl } from "@/lib/recai";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { toast } = useToast();
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [currentBook, setCurrentBook] = useState("personal-expenses");
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Books", href: "/books", icon: Book },
    { name: "Scanner", href: "/scanner", icon: Camera },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];

  const handleSaveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const token = formData.get("token") as string;
    const baseUrl = formData.get("baseUrl") as string;
    
    if (token) setToken(token);
    if (baseUrl) setBaseUrl(baseUrl);
    
    toast({
      title: "Settings saved",
      description: "API configuration updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">AI Receipt Analyzer</h1>
            <Select value={currentBook} onValueChange={setCurrentBook}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select book" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal-expenses">Personal Expenses</SelectItem>
                <SelectItem value="business-travel">Business Travel</SelectItem>
                <SelectItem value="home-renovation">Home Renovation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">3</Badge>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>API Configuration</DialogTitle>
                  <DialogDescription>Configure your API settings</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <Label htmlFor="baseUrl">API Base URL</Label>
                    <Input id="baseUrl" name="baseUrl" defaultValue={getBaseUrl()} />
                  </div>
                  <div>
                    <Label htmlFor="token">Bearer Token</Label>
                    <Input id="token" name="token" defaultValue={getToken()} />
                  </div>
                  <Button type="submit">Save Settings</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Floating Chat Widget */}
      {showChatWidget && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-card border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">AI Assistant</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowChatWidget(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 text-sm text-muted-foreground">
            Chat interface coming soon...
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      {!showChatWidget && (
        <Button
          onClick={() => setShowChatWidget(true)}
          className="fixed bottom-4 right-4 rounded-full h-12 w-12"
          size="icon"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}