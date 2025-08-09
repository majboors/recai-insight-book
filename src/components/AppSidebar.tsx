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
    <Sidebar className="w-60" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Book</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={`/books/${id}${item.url}`} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
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
