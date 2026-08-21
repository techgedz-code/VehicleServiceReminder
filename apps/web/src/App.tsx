import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PublicRoute } from '@/components/auth/public-route';
import { LandingPage } from '@/pages/marketing/landing-page';
import { LoginPage } from '@/pages/auth/login-page';
import { SignupPage } from '@/pages/auth/signup-page';
import { VerifyEmailPage } from '@/pages/auth/verify-email-page';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { CustomersPage } from '@/pages/dashboard/customers-page';
import { ServicesPage } from '@/pages/dashboard/services-page';
import { DuePage } from '@/pages/dashboard/due-page';
import { AnalyticsPage } from '@/pages/dashboard/analytics-page';
import { CreditsPage } from '@/pages/dashboard/credits-page';
import { SettingsPage } from '@/pages/dashboard/settings-page';
import { ServiceViewPage } from '@/pages/public/service-view-page';
import { OfflinePage } from '@/pages/public/offline-page';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <Routes>
          {/* Public Marketing Pages */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Pages */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicRoute>
                <VerifyEmailPage />
              </PublicRoute>
            }
          />
          
          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Outlet />
                </DashboardLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="due" element={<DuePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="credits" element={<CreditsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Public PWA Pages */}
          <Route path="/service/:qrToken" element={<ServiceViewPage />} />
          <Route path="/offline" element={<OfflinePage />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import { Outlet } from 'react-router-dom';

export default App;