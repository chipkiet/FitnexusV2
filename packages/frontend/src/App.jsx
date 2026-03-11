// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth.context.jsx";
import { ThemeProvider } from "./context/theme.context.jsx";

// Auth & Landing
import Register from "./pages/authentication/Register.jsx";
import Login from "./pages/authentication/Login.jsx";
import GoogleOtp from "./pages/authentication/GoogleOtp.jsx";
import ForgotPassword from "./pages/authentication/ForgotPassword.jsx";
import VerifyCode from "./pages/authentication/VerifyCode.jsx";
import ResetPassword from "./pages/authentication/ResetPassword.jsx";
import Landing from "./pages/landing/Landing.jsx";
import Logout from "./pages/authentication/Logout.jsx";
import NotFoundRedirect from "./pages/system/NotFoundRedirect.jsx";

// Modern V2 Pages (Unified High-End UI)
import ModernShell from "./pages/v2/ModernShell.jsx";
import DashboardPage from "./pages/v2/DashboardPage.jsx";
import AITrainerPage from "./pages/v2/AITrainerPage.jsx";
import TrainingPage from "./pages/v2/TrainingPage.jsx";
import ExerciseDetailPage from "./pages/v2/ExerciseDetailPage.jsx";
import PlansPage from "./pages/v2/PlansPage.jsx";
import NutritionPage from "./pages/v2/NutritionPage.jsx";
import ProfilePage from "./pages/v2/ProfilePage.jsx";

// Pricing & Payment
import Pricing from "./pages/pricing/Pricing.jsx";
import PaymentSuccess from "./pages/payment/PaymentSuccess.jsx";
import PaymentCancel from "./pages/payment/PaymentCancel.jsx";

// Admin
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminOverview from "./pages/admin/Overview.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return user ? (
    <ModernShell>{children}</ModernShell>
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  const isAdmin = user && (user.role === "ADMIN" || user.isSuperAdmin === true);
  return isAdmin ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/login/otp" element={<GoogleOtp />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Landing />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />

            {/* Main Application Routes (Private) */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/ai-trainer" element={<PrivateRoute><AITrainerPage /></PrivateRoute>} />
            <Route path="/exercises" element={<PrivateRoute><TrainingPage /></PrivateRoute>} />
            <Route path="/exercises/:id" element={<PrivateRoute><ExerciseDetailPage /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute><PlansPage /></PrivateRoute>} />
            <Route path="/nutrition" element={<PrivateRoute><NutritionPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

            {/* Default Redirects */}
            <Route path="/premium/dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/premium/ai-trainer" element={<Navigate to="/ai-trainer" replace />} />
            <Route path="/premium/exercises" element={<Navigate to="/exercises" replace />} />
            <Route path="/premium/plans" element={<Navigate to="/plans" replace />} />
            <Route path="/premium/nutrition" element={<Navigate to="/nutrition" replace />} />
            <Route path="/premium/profile" element={<Navigate to="/profile" replace />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminOverview />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFoundRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
