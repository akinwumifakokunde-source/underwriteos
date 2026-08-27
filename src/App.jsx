import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import Sandbox from '@/pages/Sandbox';
import ApiReference from '@/pages/ApiReference';
import Architecture from '@/pages/Architecture';
import Docs from '@/pages/Docs';
import Playground from '@/pages/Playground';
import Onboarding from '@/pages/Onboarding';
import Underwrite from '@/pages/Underwrite';
import EvidenceGraph from '@/pages/EvidenceGraph';
import Monitoring from '@/pages/Monitoring';
import Dashboard from '@/pages/Dashboard';
import ApiKeys from '@/pages/ApiKeys';
import Providers from '@/pages/Providers';
import Usage from '@/pages/Usage';
import Members from '@/pages/Members';
import SettingsPage from '@/pages/Settings';
import Webhooks from '@/pages/Webhooks';
import Billing from '@/pages/Billing';
import ProtectedRoute from '@/components/ProtectedRoute';
import Pricing from '@/pages/Pricing';
import Security from '@/pages/Security';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Contact from '@/pages/Contact';
import Applications from '@/pages/Applications';
import ApplicationDetail from '@/pages/ApplicationDetail';
import ApplicationCreate from '@/pages/ApplicationCreate';
import Policies from '@/pages/Policies';
import Decisions from '@/pages/Decisions';
import RiskSignals from '@/pages/RiskSignals';
import Reports from '@/pages/Reports';
import WorkspaceHome from '@/pages/WorkspaceHome';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/security" element={<Security />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/workspace" element={<WorkspaceHome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/new" element={<ApplicationCreate />} />
        <Route path="/applications/:applicationId" element={<ApplicationDetail />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/data-sources" element={<Providers />} />
        <Route path="/risk-signals" element={<RiskSignals />} />
        <Route path="/decisions" element={<Decisions />} />
        <Route path="/evidence" element={<EvidenceGraph />} />
        <Route path="/evidence/:applicationId" element={<EvidenceGraph />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/underwrite" element={<Underwrite />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/api-reference" element={<ApiReference />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/webhooks" element={<Webhooks />} />
        <Route path="/members" element={<Members />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App