import { ReactNode } from 'react';
import { TopNavigation } from "@/components/TopNavigation";
import { MobileNav } from "@/components/MobileNav";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <TopNavigation />
            <div className="flex-1 pb-16 md:pb-0">
                {children}
            </div>
            <MobileNav />
        </div>
    );
}