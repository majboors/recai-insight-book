import { NavLink } from "react-router-dom";
import { Home, BookOpen, Camera, BarChart3, Bell, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export function MobileBottomNav() {
  const left = [
    { to: "/", label: "Home", icon: Home },
    { to: "/books", label: "Books", icon: BookOpen },
  ];
  const right = [
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/notifications", label: "Alerts", icon: Bell },
  ];
  const scan = { to: "/scanner", label: "Scan", icon: Camera };

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 pt-4 pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="relative mx-auto max-w-screen-md px-2">
        {/* Center floating Scanner dropdown */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-14 w-14 rounded-full shadow-soft border border-border bg-accent/40 text-foreground hover:bg-accent"
                size="icon"
                aria-label="Scanner options"
              >
                <Camera className="h-7 w-7" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/scanner" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Scan Receipt
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/templates" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Templates
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Left and Right groups with a gap for the center button */}
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-2 w-1/2">
            {left.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-2 text-xs ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="mt-0.5">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
          <div className="grid grid-cols-2 w-1/2">
            {right.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-2 text-xs ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="mt-0.5">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
