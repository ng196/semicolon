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
import { ClubsPage, ClubPage } from "./pages/hubs/clubs";
// Auth pages (lazy loaded)
import { lazy, Suspense } from "react";
import { AuthProvider } from "./pages/auth/contexts/AuthContext";
import { AuthGuard, GuestGuard } from "./pages/auth/components/AuthGuard";

const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
import { OnboardingPage } from "./pages/auth/onboarding/OnboardingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - accessible only when NOT logged in */}
            <Route
              path="/auth/login"
              element={
                <GuestGuard>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                    <Login />
                  </Suspense>
                </GuestGuard>
              }
            />
            <Route
              path="/auth/signup"
              element={
                <GuestGuard>
                  <OnboardingPage />
                </GuestGuard>
              }
            />
            <Route
              path="/auth/forgot-password"
              element={
                <GuestGuard>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                    <ForgotPassword />
                  </Suspense>
                </GuestGuard>
              }
            />
            <Route
              path="/auth/onboarding"
              element={
                <GuestGuard>
                  <OnboardingPage />
                </GuestGuard>
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <Dashboard />
                      </div>
                    </div>
                  </SidebarProvider>
                </AuthGuard>
              }
            />
            <Route
              path="/hubs"
              element={
                <AuthGuard>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <Hubs />
                      </div>
                    </div>
                  </SidebarProvider>
                </AuthGuard>
              }
            />
            <Route
              path="/events"
              element={
                <AuthGuard>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <Events />
                      </div>
                    </div>
                  </SidebarProvider>
                </AuthGuard>
              }
            />
            <Route
              path="/marketplace"
              element={
                <AuthGuard>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <Marketplace />
                      </div>
                    </div>
                  </SidebarProvider>
                </AuthGuard>
              }
            />
            <Route
              path="/network"
              element={
                <AuthGuard>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <Network />
                      </div>
                    </div>
                  </SidebarProvider>
                </AuthGuard>
              }
            />
            <Route
              path="/requests"
              element={
                <AuthGuard>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <Requests />
                      </div>
                    </div>
                  </SidebarProvider>
                </AuthGuard>
              }
            />
            <Route
              path="/clubs"
              element={
                <AuthGuard>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <ClubsPage />
                      </div>
                    </div>
                  </SidebarProvider>
                </AuthGuard>
              }
            />
            <Route
              path="/clubs/:id"
              element={
                <AuthGuard>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <ClubPage />
                      </div>
                    </div>
                  </SidebarProvider>
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
