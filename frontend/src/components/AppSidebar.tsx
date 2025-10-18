import { NavLink } from "react-router-dom";
import { Home, Users, Calendar, ShoppingBag, UserCircle, AlertTriangle, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import currentUserData from "@/data/users.json";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Hubs", url: "/hubs", icon: Users },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Network", url: "/network", icon: UserCircle },
  { title: "Requests", url: "/requests", icon: AlertTriangle },
];

export function AppSidebar() {
  const currentUser = currentUserData[0];

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border bg-sidebar-background p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">CH</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-sidebar-foreground">CampusHub</h2>
            <p className="text-xs text-sidebar-muted">Student Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-sidebar-background p-4">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-10 w-10 rounded-full"
          />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
            <p className="truncate text-xs text-sidebar-muted">{currentUser.specialization}</p>
          </div>
          <button className="text-sidebar-muted hover:text-sidebar-foreground">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
