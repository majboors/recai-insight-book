import { BarChart3, Layers, PieChart, ReceiptText, Settings2, Sparkles, Wallet } from "lucide-react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "", icon: PieChart },
  { title: "Budgets", url: "?tab=budgets", icon: Wallet },
  { title: "Reports", url: "?tab=reports", icon: BarChart3 },
  { title: "Categories", url: "?tab=categories", icon: Layers },
  { title: "Receipts", url: "?tab=receipts", icon: ReceiptText },
  { title: "AI Chat", url: "?tab=chat", icon: Sparkles },
];

export function AppSidebar() {
  const params = useParams();
  const id = params.id!;
  const location = useLocation();
  const currentPath = location.pathname + location.search;

  const isActive = (path: string) => currentPath.endsWith(path);
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar 
      className="border-r border-border/50 bg-sidebar/80 backdrop-blur-sm" 
      collapsible="icon"
    >
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-2 mb-4">
            Book Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="group">
                    <NavLink 
                      to={`/books/${id}${item.url}`} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-soft" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
