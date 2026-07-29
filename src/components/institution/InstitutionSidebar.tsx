import { FilePlus, FileText, ShieldCheck, BarChart3, Building2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
  { title: "Overview", url: "/institution", icon: Building2 },
  { title: "Issue Certificate", url: "/institution/issue", icon: FilePlus },
  { title: "Issued Certificates", url: "/institution/certificates", icon: FileText },
  { title: "Verification Logs", url: "/institution/logs", icon: ShieldCheck },
  { title: "Analytics", url: "/institution/analytics", icon: BarChart3 },
];

export function InstitutionSidebar() {
  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="pt-6 px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">
            Institution Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/institution"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      activeClassName="bg-primary/8 text-primary"
                    >
                      <item.icon className="w-4 h-4" />
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
