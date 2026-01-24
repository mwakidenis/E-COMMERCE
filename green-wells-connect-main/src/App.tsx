import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import ErrorBoundary from "@/components/ErrorBoundary";

// Eager load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";

// Lazy load other pages for better code splitting
const Order = lazy(() => import("./pages/Order"));
const Tracking = lazy(() => import("./pages/Tracking"));
const SafetyHub = lazy(() => import("./pages/SafetyHub"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DriverApp = lazy(() => import("./pages/DriverApp"));
const WarehouseManagement = lazy(() => import("./pages/WarehouseManagement"));
const YouthEnergyHub = lazy(() => import("./pages/YouthEnergyHub"));
const RewardsMarketplace = lazy(() => import("./pages/RewardsMarketplace"));
const TeamChallenges = lazy(() => import("./pages/TeamChallenges"));
const SupportHub = lazy(() => import("./pages/SupportHub"));
const FeedbackDashboard = lazy(() => import("./pages/FeedbackDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FloatingChatAssistant = lazy(() => import("./components/FloatingChatAssistant"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />
              <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
              <Route path="/safety" element={<ProtectedRoute><SafetyHub /></ProtectedRoute>} />
              <Route path="/driver" element={<ProtectedRoute><DriverApp /></ProtectedRoute>} />
              <Route path="/warehouse" element={<ProtectedRoute><WarehouseManagement /></ProtectedRoute>} />
              <Route path="/youth-hub" element={<ProtectedRoute><YouthEnergyHub /></ProtectedRoute>} />
              <Route path="/rewards" element={<ProtectedRoute><RewardsMarketplace /></ProtectedRoute>} />
              <Route path="/teams" element={<ProtectedRoute><TeamChallenges /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><SupportHub /></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute><FeedbackDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingChatAssistant />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
