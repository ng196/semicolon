import { NavLink } from "react-router-dom";
import { Home, Users, Calendar, ShoppingBag, UserCircle, AlertTriangle } from "lucide-react";

const navItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Hubs", url: "/hubs", icon: Users },
    { title: "Events", url: "/events", icon: Calendar },
    { title: "Market", url: "/marketplace", icon: ShoppingBag },
    { title: "Network", url: "/network", icon: UserCircle },
    { title: "Requests", url: "/requests", icon: AlertTriangle },
];

export function MobileNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
            <div className="flex items-center justify-around py-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.title}
                        to={item.url}
                        end={item.url === "/"}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] leading-none">{item.title}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}