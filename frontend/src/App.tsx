import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Hubs from "./pages/Hubs";
import Events from "./pages/Events";
import Marketplace from "./pages/Marketplace";
import Network from "./pages/Network";
import Requests from "./pages/Requests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/hubs" element={<Hubs />} />
                <Route path="/events" element={<Events />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/network" element={<Network />} />
                <Route path="/requests" element={<Requests />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
