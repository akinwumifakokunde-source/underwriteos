import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Route pages are code-split (lazy-loaded) for a faster initial load.
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Home = lazy(() => import("@/pages/Home"));
const ApiReference = lazy(() => import("@/pages/ApiReference"));
const Architecture = lazy(() => import("@/pages/Architecture"));
const Playground = lazy(() => import("@/pages/Playground"));
const EvidenceGraph = lazy(() => import("@/pages/EvidenceGraph"));
const Monitoring = lazy(() => import("@/pages/Monitoring"));
const Collections = lazy(() => import("@/pages/Collections"));
const ApiKeys = lazy(() => import("@/pages/ApiKeys"));
const Providers = lazy(() => import("@/pages/Providers"));
const Usage = lazy(() => import("@/pages/Usage"));
const Members = lazy(() => import("@/pages/Members"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const Webhooks = lazy(() => import("@/pages/Webhooks"));
const Billing = lazy(() => import("@/pages/Billing"));
const Security = lazy(() => import("@/pages/Security"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Contact = lazy(() => import("@/pages/Contact"));
const Applications = lazy(() => import("@/pages/Applications"));
const ApplicationDetail = lazy(() => import("@/pages/ApplicationDetail"));
const ApplicationCreate = lazy(() => import("@/pages/ApplicationCreate"));
const BatchUnderwrite = lazy(() => import("@/pages/BatchUnderwrite"));
const Policies = lazy(() => import("@/pages/Policies"));
const Decisions = lazy(() => import("@/pages/Decisions"));
const RiskSignals = lazy(() => import("@/pages/RiskSignals"));
const Reports = lazy(() => import("@/pages/Reports"));
const WorkspaceHome = lazy(() => import("@/pages/WorkspaceHome"));
const Forms = lazy(() => import("@/pages/Forms"));
const FormEditor = lazy(() => import("@/pages/FormEditor"));
const Apply = lazy(() => import("@/pages/Apply"));
const BorrowerApply = lazy(() => import("@/pages/BorrowerApply"));
const FormSubmissions = lazy(() => import("@/pages/FormSubmissions"));
const LinkedInAds = lazy(() => import("@/pages/LinkedInAds"));
const About = lazy(() => import("@/pages/About"));
const Features = lazy(() => import("@/pages/Features"));
const FeatureDetail = lazy(() => import("@/pages/FeatureDetail"));
const Insights = lazy(() => import("@/pages/Insights"));
const InsightDetail = lazy(() => import("@/pages/InsightDetail"));
const OAuthConsent = lazy(() => import("@/pages/OAuthConsent"));
const Connect = lazy(() => import("@/pages/Connect"));
const BookDemo = lazy(() => import("@/pages/BookDemo"));
// Add page imports here

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

// Code-split routes with a cross-fade/slide page transition (framer-motion).
// popLayout keeps the exiting page in place (absolute) so the new page fades in
// over it without a blank flash.
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Home />} />
            <Route path="/security" element={<Security />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/features/:slug" element={<FeatureDetail />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<InsightDetail />} />
            <Route path="/apply/:slug" element={<Apply />} />
            <Route path="/start/borrower" element={<BorrowerApply />} />
            <Route path="/start/borrower/:slug" element={<BorrowerApply />} />
            <Route path="/oauth/consent" element={<OAuthConsent />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/demo" element={<BookDemo />} />
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route path="/workspace" element={<WorkspaceHome />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/applications/new" element={<ApplicationCreate />} />
              <Route path="/batch" element={<BatchUnderwrite />} />
              <Route path="/applications/:applicationId" element={<ApplicationDetail />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/forms/new" element={<FormEditor />} />
              <Route path="/forms/:formId/edit" element={<FormEditor />} />
              <Route path="/forms/:formId/submissions" element={<FormSubmissions />} />
              <Route path="/linkedin-ads" element={<LinkedInAds />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/data-sources" element={<Providers />} />
              <Route path="/risk-signals" element={<RiskSignals />} />
              <Route path="/decisions" element={<Decisions />} />
              <Route path="/evidence" element={<EvidenceGraph />} />
              <Route path="/evidence/:applicationId" element={<EvidenceGraph />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/api-reference" element={<ApiReference />} />
              <Route path="/api-keys" element={<ApiKeys />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/usage" element={<Usage />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/pricing" element={<Navigate to="/demo" replace />} />
              <Route path="/webhooks" element={<Webhooks />} />
              <Route path="/members" element={<Members />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/architecture" element={<Architecture />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

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
    <div className="pt-safe relative">
      <AnimatedRoutes />
    </div>
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