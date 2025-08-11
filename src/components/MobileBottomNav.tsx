import { NavLink } from "react-router-dom";
import { Home, BookOpen, Camera, BarChart3, Bell } from "lucide-react";

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
        {/* Center floating Scan button */}
        <NavLink
          to={scan.to}
          className={({ isActive }) =>
            `absolute -top-7 left-1/2 -translate-x-1/2 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-soft border border-border ${
              isActive ? "bg-primary text-primary-foreground" : "bg-accent/40 text-foreground hover:bg-accent"
            }`
          }
          aria-label={scan.label}
        >
          <scan.icon className="h-7 w-7" aria-hidden="true" />
        </NavLink>

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
