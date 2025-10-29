import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "@/features/dashboard";
import { Hubs, ClubsPage, ClubPage } from "@/features/hubs";
import { Events } from "@/features/events";
import { Marketplace } from "@/features/marketplace";
import { Network } from "@/features/network";
import { Requests } from "@/features/requests";
import NotFound from "./NotFound";
// Auth pages (lazy loaded)
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import { AuthGuard, GuestGuard } from "@/features/auth/components/AuthGuard";

const Login = lazy(() => import("@/features/auth/pages/Login"));
const ForgotPassword = lazy(() => import("@/features/auth/pages/ForgotPassword"));
const LandingPage = lazy(() => import("@/features/landing/pages/LandingPage"));
import { OnboardingPage } from "@/features/auth/pages/OnboardingPage";
import { PWAInstallPrompt } from "@/shared/components/indicators/PWAInstallPrompt";
import { OfflineIndicator } from "@/shared/components/indicators/OfflineIndicator";
import { AppLayout } from "./layout/AppLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <OfflineIndicator />
          <BrowserRouter>
            <Routes>
              {/* Landing Page - accessible only when NOT logged in */}
              <Route
                path="/"
                element={
                  <GuestGuard>
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black">Loading...</div>}>
                      <LandingPage />
                    </Suspense>
                  </GuestGuard>
                }
              />

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
                path="/dashboard"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </AuthGuard>
                }
              />
              <Route
                path="/hubs"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Hubs />
                    </AppLayout>
                  </AuthGuard>
                }
              />
              <Route
                path="/events"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Events />
                    </AppLayout>
                  </AuthGuard>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Marketplace />
                    </AppLayout>
                  </AuthGuard>
                }
              />
              <Route
                path="/network"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Network />
                    </AppLayout>
                  </AuthGuard>
                }
              />
              <Route
                path="/requests"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Requests />
                    </AppLayout>
                  </AuthGuard>
                }
              />
              <Route
                path="/clubs"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <ClubsPage />
                    </AppLayout>
                  </AuthGuard>
                }
              />
              <Route
                path="/clubs/:id"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <ClubPage />
                    </AppLayout>
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
};

export default App;
