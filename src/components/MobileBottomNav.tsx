import { NavLink, useLocation } from "react-router-dom";
import { BookOpen, Camera, BarChart3, Bell } from "lucide-react";

export function MobileBottomNav() {
  const location = useLocation();

  const items = [
    { to: "/books", label: "Books", icon: BookOpen },
    { to: "/scanner", label: "Scan", icon: Camera, primary: true },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const navItems = [...items, { to: "/notifications", label: "Alerts", icon: Bell }];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="mx-auto max-w-screen-md">
        <div className="grid grid-cols-4 items-center">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isPrimary = !!item.primary;

            if (isPrimary) {
              return (
                <div key={item.to} className="flex items-center justify-center py-2">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex h-12 w-12 items-center justify-center rounded-full shadow-soft border border-border ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-accent/40 text-foreground hover:bg-accent"
                      }`
                    }
                    aria-label={item.label}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </NavLink>
                </div>
              );
            }

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
    </nav>
  );
}
