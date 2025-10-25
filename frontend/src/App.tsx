import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const LandingPage = lazy(() => import("./pages/LandingPage"));
import { OnboardingPage } from "./pages/auth/onboarding/OnboardingPage";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { AppLayout } from "./components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
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

export default App;
