import React from 'react'
import { RouteObject } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import PageTransition from './components/PageTransition'

// Auth & Utility
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyEmailPending from './pages/VerifyEmailPending'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LandingPage from './pages/LandingPage'

// PIN Reset Pages
import ForgotPinPage from './pages/ForgotPinPage'
import ResetPinPage from './pages/ResetPinPage'

// Core Pages
import DashboardPage from './pages/Dashboard/DashboardPage'
import WalletPage from './pages/Wallet/WalletPage'
import IncomePage from './pages/Income/IncomePage'
import OutcomePage from './pages/Outcome/OutcomePage'
import TransferPage from './pages/TransferPage'
import HistoryPage from './pages/History/HistoryPage'

// Virtual Wallet
import VirtualWalletPage from './pages/VirtualWalletPage'

// Profile
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'

// Settings Modular
import SettingsProfile from './pages/settings/ProfilePage'
import SecurityPage from './pages/settings/SecurityPage'
import PreferencesPage from './pages/settings/PreferencesPage'

// About MeowIQ Pages ✨
import AboutPage from './pages/about/AboutPage'
import PrivacyPolicyPage from './pages/about/PrivacyPolicyPage'
import TermsAndConditionsPage from './pages/about/TermsAndConditionsPage'

// Upgrade Page ✨
import UpgradePage from './pages/upgrade/UpgradePage'

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminTransactions from "./pages/admin/AdminTransactions"
import AdminReports from "./pages/admin/AdminReports"
import AdminSettings from "./pages/admin/AdminSettings"

// 404 Page
import NotFoundPage from './pages/NotFoundPage'

const routes: RouteObject[] = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-email-pending', element: <VerifyEmailPending /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // PIN reset flow
  { path: '/forgot-pin', element: <ForgotPinPage /> },
  { path: '/reset-pin', element: <ResetPinPage /> },

  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <PageTransition>
          <DashboardPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/wallet',
    element: (
      <PrivateRoute>
        <PageTransition>
          <WalletPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/income',
    element: (
      <PrivateRoute>
        <PageTransition>
          <IncomePage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/outcome',
    element: (
      <PrivateRoute>
        <PageTransition>
          <OutcomePage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/history',
    element: (
      <PrivateRoute>
        <PageTransition>
          <HistoryPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/transfer',
    element: (
      <PrivateRoute>
        <PageTransition>
          <TransferPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/virtual-wallet',
    element: (
      <PrivateRoute>
        <PageTransition>
          <VirtualWalletPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },

  // Profile
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <PageTransition>
          <ProfilePage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/profile/edit',
    element: (
      <PrivateRoute>
        <PageTransition>
          <EditProfilePage />
        </PageTransition>
      </PrivateRoute>
    ),
  },

  // Settings
  {
    path: '/settings/profile',
    element: (
      <PrivateRoute>
        <PageTransition>
          <SettingsProfile />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/settings/security',
    element: (
      <PrivateRoute>
        <PageTransition>
          <SecurityPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/settings/preferences',
    element: (
      <PrivateRoute>
        <PageTransition>
          <PreferencesPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },

  // About MeowIQ
  {
    path: '/about',
    element: (
      <PrivateRoute>
        <PageTransition>
          <AboutPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/about/privacy-policy',
    element: (
      <PrivateRoute>
        <PageTransition>
          <PrivacyPolicyPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/about/terms-and-conditions',
    element: (
      <PrivateRoute>
        <PageTransition>
          <TermsAndConditionsPage />
        </PageTransition>
      </PrivateRoute>
    ),
  },

  // Upgrade
  {
    path: '/upgrade',
    element: (
      <PrivateRoute>
        <PageTransition>
          <UpgradePage />
        </PageTransition>
      </PrivateRoute>
    ),
  },

  // Admin Routes
  {
    path: '/admin',
    element: (
      <PrivateRoute requiredRole="Admin">
        <PageTransition>
          <AdminDashboard />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <PrivateRoute requiredRole="Admin">
        <PageTransition>
          <AdminUsers />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/transactions',
    element: (
      <PrivateRoute requiredRole="Admin">
        <PageTransition>
          <AdminTransactions />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/reports',
    element: (
      <PrivateRoute requiredRole="Admin">
        <PageTransition>
          <AdminReports />
        </PageTransition>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <PrivateRoute requiredRole="Admin">
        <PageTransition>
          <AdminSettings />
        </PageTransition>
      </PrivateRoute>
    ),
  },

  // Catch-all route for 404
  { path: '*', element: <NotFoundPage /> },
]

export default routes