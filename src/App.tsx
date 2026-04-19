import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import RequireAuth from "@/components/RequireAuth";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import AuthGatePage from "@/pages/AuthGatePage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminPage from "@/pages/AdminPage";
import AdminAccountsPage from "@/pages/AdminAccountsPage";
import PricingPage from "@/pages/PricingPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import RefundPage from "@/pages/RefundPage";
import NotFound from "./pages/NotFound.tsx";
import SpecialPricingPage from "@/pages/SpecialPricingPage";
import SaudiOfferPage from "@/pages/SaudiOfferPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import SubArabGatePage from "@/pages/SubArabGatePage";
import SubArabPlansPage from "@/pages/SubArabPlansPage";
import SubArabSuccessPage from "@/pages/SubArabSuccessPage";
import SubArabAdminPage from "@/pages/SubArabAdminPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth gate for offers */}
            <Route path="/barid" element={<AuthGatePage />} />

            {/* Protected standalone pages - no navbar */}
            <Route path="/offers" element={<RequireAuth><SpecialPricingPage /></RequireAuth>} />
            <Route path="/saudionffer" element={<RequireAuth><SaudiOfferPage /></RequireAuth>} />
            <Route path="/subscription" element={<RequireAuth><SubscriptionPage /></RequireAuth>} />

            {/* SubArab — ArabStream IPTV standalone flow */}
            <Route path="/subarab" element={<SubArabGatePage />} />
            <Route path="/subarab/plans" element={<SubArabPlansPage />} />
            <Route path="/subarab/success" element={<SubArabSuccessPage />} />
            <Route path="/subarab/admin" element={<SubArabAdminPage />} />

            {/* Admin accounts management - standalone */}
            <Route path="/admin/accounts" element={<AdminAccountsPage />} />

            {/* Main site with navbar */}
            <Route element={<><Navbar /><Outlet /></>}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/terms-and-conditions" element={<TermsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPage />} />
              <Route path="/refund-policy" element={<RefundPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
