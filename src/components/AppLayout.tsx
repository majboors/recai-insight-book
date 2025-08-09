import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, MessageCircle, Settings, Book, Camera, BarChart3, Home, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getToken, setToken, getBaseUrl, setBaseUrl } from "@/lib/recai";
import { useToast } from "@/hooks/use-toast";
import { ChatWidget } from "@/components/chat/ChatWidget";
interface AppLayoutProps {
  children: React.ReactNode;
}
export function AppLayout({
  children
}: AppLayoutProps) {
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [currentBook, setCurrentBook] = useState("personal-expenses");
  const navigation = [{
    name: "Dashboard",
    href: "/",
    icon: Home
  }, {
    name: "Books",
    href: "/books",
    icon: Book
  }, {
    name: "Scanner",
    href: "/scanner",
    icon: Camera
  }, {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3
  }, {
    name: "Chat",
    href: "/chat",
    icon: MessageCircle
  }, {
    name: "Notifications",
    href: "/notifications",
    icon: Bell
  }];
  const handleSaveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const token = formData.get("token") as string;
    const baseUrl = formData.get("baseUrl") as string;
    if (token) setToken(token);
    if (baseUrl) setBaseUrl(baseUrl);
    toast({
      title: "Settings saved",
      description: "API configuration updated successfully."
    });
  };
  return <div className="min-h-screen bg-gradient-soft">
      {/* Skip link for accessibility */}
      

      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-zen flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <nav className="p-4 space-y-2" role="navigation" aria-label="Mobile navigation">
                  {navigation.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return <Link key={item.name} to={item.href} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`} aria-current={isActive ? 'page' : undefined}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span>{item.name}</span>
                      </Link>;
                })}
                </nav>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-medium heading-zen">ReceiptWala</h1>
              <Select value={currentBook} onValueChange={setCurrentBook}>
                <SelectTrigger className="w-40 sm:w-48 btn-minimal">
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal-expenses">Personal</SelectItem>
                  <SelectItem value="business-travel">Business</SelectItem>
                  <SelectItem value="home-renovation">Home</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" aria-label="View notifications">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                3
                <span className="sr-only">unread notifications</span>
              </Badge>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="card-zen">
                <DialogHeader>
                  <DialogTitle className="heading-zen">API Configuration</DialogTitle>
                  <DialogDescription className="text-zen">Configure your RecAI API settings</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl" className="text-sm font-medium">API Base URL</Label>
                    <Input id="baseUrl" name="baseUrl" defaultValue={getBaseUrl()} className="focus:ring-2 focus:ring-primary" aria-describedby="baseUrl-desc" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="token" className="text-sm font-medium">Bearer Token</Label>
                    <Input id="token" name="token" defaultValue={getToken()} placeholder="test-user-123" className="focus:ring-2 focus:ring-primary" aria-describedby="token-desc" />
                    <p id="token-desc" className="text-xs text-muted-foreground">Your API authentication token</p>
                  </div>
                  <Button type="submit" className="btn-zen w-full">Save Settings</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border/50 bg-card/50 backdrop-blur-sm h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2" role="navigation" aria-label="Main navigation">
            {navigation.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return <Link key={item.name} to={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-primary text-primary-foreground shadow-soft transform scale-[1.02]" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:transform hover:scale-[1.01]"}`} aria-current={isActive ? 'page' : undefined}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">{item.name}</span>
                </Link>;
          })}
          </nav>
        </aside>

        {/* Main Content */}
        <main id="main-content" className="flex-1 min-h-[calc(100vh-4rem)]" role="main">
          <div className="container-zen py-6 space-zen">
            {children}
          </div>
        </main>
      </div>

      {/* Global Chat Widget */}
      <ChatWidget />
    </div>;
}