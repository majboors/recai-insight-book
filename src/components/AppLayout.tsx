import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, MessageCircle, Settings, Book, Camera, BarChart3, Home, Menu, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ChatWidget } from "@/components/chat/ChatWidget";
interface AppLayoutProps {
  children: React.ReactNode;
}
export function AppLayout({
  children
}: AppLayoutProps) {
  const location = useLocation();
  
  const { user, signOut } = useAuth();
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
                
                {/* Settings Link for Mobile */}
                <Link to="/settings" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${location.pathname === '/settings' ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <Settings className="h-5 w-5" aria-hidden="true" />
                  <span>Settings</span>
                </Link>

                {/* Logout for Mobile */}
                <button onClick={() => signOut()} className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-destructive hover:bg-destructive/10">
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  <span>Logout</span>
                </button>
                </nav>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-medium heading-zen">ReceiptWala</h1>
              <div className="hidden sm:block">
                <Select value={currentBook} onValueChange={setCurrentBook}>
                  <SelectTrigger className="w-48 btn-minimal">
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
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex" aria-label="View notifications">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                3
                <span className="sr-only">unread notifications</span>
              </Badge>
            </Button>
            

            {/* User Menu with Settings Link */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/50">
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-muted-foreground">User Account</p>
                </div>
              </div>
              
              <Link to="/settings">
                <Button variant="ghost" size="icon" aria-label="Settings" className="hidden sm:inline-flex">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                aria-label="Sign out"
                className="hidden sm:inline-flex hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
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
          
          {/* Settings Link */}
          <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === '/settings' ? "bg-primary text-primary-foreground shadow-soft transform scale-[1.02]" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:transform hover:scale-[1.01]"}`}>
            <Settings className="h-5 w-5" aria-hidden="true" />
            <span className="font-medium">Settings</span>
          </Link>
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