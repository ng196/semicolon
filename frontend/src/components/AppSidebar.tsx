import { NavLink } from "react-router-dom";
import { Home, Users, Calendar, ShoppingBag, UserCircle, AlertTriangle, Settings, LogOut } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/pages/auth/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Hubs", url: "/hubs", icon: Users },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Network", url: "/network", icon: UserCircle },
  { title: "Requests", url: "/requests", icon: AlertTriangle },
];

export function AppSidebar() {
  const { user, logout } = useAuth();

  // Fallback avatar if user doesn't have one
  const userAvatar = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`;

  const handleLogout = () => {
    // Clear all localStorage
    localStorage.clear();
    // Redirect to root
    window.location.href = '/';
  };

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
                        `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
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
        <div className="space-y-2">
          {/* Logout Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be logged out and redirected to the home page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={userAvatar}
              alt={user?.name || 'User'}
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-sidebar-muted">{user?.specialization || user?.email}</p>
            </div>
            <button className="text-sidebar-muted hover:text-sidebar-foreground">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
