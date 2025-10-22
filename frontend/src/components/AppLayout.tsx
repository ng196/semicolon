import { ReactNode } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <div className="hidden md:block">
                    <AppSidebar />
                </div>
                <div className="flex-1 pb-16 md:pb-0">
                    {children}
                </div>
            </div>
            <MobileNav />
        </SidebarProvider>
    );
}