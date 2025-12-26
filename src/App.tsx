import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Auth Pages
import LoginPage from "@/pages/auth/Login";
import SignupPage from "@/pages/auth/Signup";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword";

// Dashboard Layout & Pages
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardPage from "@/pages/Dashboard";
import RoomsPage from "@/pages/Rooms";
import RatesPage from "@/pages/Rates";
import AvailabilityPage from "@/pages/Availability";
import BookingsPage from "@/pages/Bookings";
import GuestsPage from "@/pages/Guests";
import PaymentsPage from "@/pages/Payments";
import ReportsPage from "@/pages/Reports";
import SettingsPage from "@/pages/Settings";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rates" element={<RatesPage />} />
              <Route path="/availability" element={<AvailabilityPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/guests" element={<GuestsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
