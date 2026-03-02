import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { OrderStoreProvider } from "@/contexts/OrderStore";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import LedgerPage from "@/pages/LedgerPage";
import ActorsPage from "@/pages/ActorsPage";
import AuditPage from "@/pages/AuditPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

const AuthRedirect = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <OrderStoreProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<AuthRedirect />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<ProtectedRoutes />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/ledger" element={<LedgerPage />} />
                <Route path="/actors" element={<ActorsPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="/products" element={<div className="animate-fade-in"><h1 className="text-3xl font-display">Products</h1><p className="text-muted-foreground mt-1">Coming soon</p></div>} />
                <Route path="/settings" element={<div className="animate-fade-in"><h1 className="text-3xl font-display">Settings</h1><p className="text-muted-foreground mt-1">Coming soon</p></div>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OrderStoreProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
