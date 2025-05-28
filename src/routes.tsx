// src/routes.tsx - FINAL VERSION WITH ADMIN ROUTES
import React from 'react'
import { RouteObject, Navigate } from 'react-router-dom'
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

// Core Pages
import DashboardPage from './pages/Dashboard/DashboardPage'
import WalletPage from './pages/Wallet/WalletPage'
import IncomePage from './pages/Income/IncomePage'
import OutcomePage from './pages/Outcome/OutcomePage'
import TransferPage from './pages/Transfer/TransferPage'
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

// 404 Page
import NotFoundPage from './pages/NotFoundPage'

// 🛡️ ADMIN COMPONENTS
import AdminProtectedRoute from '@/components/Admin/AdminProtectedRoute'
import AdminLayoutShell from '@/layouts/Admin/AdminLayoutShell'
import AdminDashboard from './pages/admin/DashboardPage'
import UserManagement from './pages/admin/UsersManagementPage'
import WalletManagement from './pages/admin/WalletsManagementPage'
import TransactionManagement from './pages/admin/TransactionsManagementPage'
import GlobalSettings from './pages/admin/SettingsPage'
import AuditLogs from './pages/admin/AuditLogsPage'

const routes: RouteObject[] = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-email-pending', element: <VerifyEmailPending /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // PIN reset flow
  { path: '/forgot-pin', element: <ForgotPinPage /> },

  // USER ROUTES (Your existing routes)
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

  // 🛡️ ADMIN ROUTES SECTION
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminLayoutShell />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { 
        path: 'dashboard', 
        element: (
          <PageTransition>
            <AdminDashboard />
          </PageTransition>
        )
      },
      { 
        path: 'users', 
        element: (
          <PageTransition>
            <UserManagement />
          </PageTransition>
        )
      },
      { 
        path: 'wallets', 
        element: (
          <PageTransition>
            <WalletManagement />
          </PageTransition>
        )
      },
      { 
        path: 'transactions', 
        element: (
          <PageTransition>
            <TransactionManagement />
          </PageTransition>
        )
      },
      { 
        path: 'settings', 
        element: (
          <PageTransition>
            <GlobalSettings />
          </PageTransition>
        )
      },
      { 
        path: 'settings/general', 
        element: (
          <PageTransition>
            <GlobalSettings />
          </PageTransition>
        )
      },
      { 
        path: 'settings/security', 
        element: (
          <PageTransition>
            <GlobalSettings />
          </PageTransition>
        )
      },
      { 
        path: 'settings/notifications', 
        element: (
          <PageTransition>
            <GlobalSettings />
          </PageTransition>
        )
      },
      { 
        path: 'audit-logs', 
        element: (
          <PageTransition>
            <AuditLogs />
          </PageTransition>
        )
      },
      { 
        path: 'reports/overview', 
        element: (
          <PageTransition>
            <AdminDashboard />
          </PageTransition>
        )
      },
      { 
        path: 'reports/analytics', 
        element: (
          <PageTransition>
            <AdminDashboard />
          </PageTransition>
        )
      },
      { 
        path: 'reports/charts', 
        element: (
          <PageTransition>
            <AdminDashboard />
          </PageTransition>
        )
      },
      { 
        path: 'reports/trends', 
        element: (
          <PageTransition>
            <AdminDashboard />
          </PageTransition>
        )
      },
      { 
        path: 'system/backup', 
        element: (
          <PageTransition>
            <GlobalSettings />
          </PageTransition>
        )
      },
      { 
        path: 'system/maintenance', 
        element: (
          <PageTransition>
            <GlobalSettings />
          </PageTransition>
        )
      },
      { 
        path: 'profile', 
        element: (
          <PageTransition>
            <GlobalSettings />
          </PageTransition>
        )
      },
      { 
        path: 'security', 
        element: (
          <PageTransition>
            <GlobalSettings />
          </PageTransition>
        )
      },
      { 
        path: 'notifications', 
        element: (
          <PageTransition>
            <AuditLogs />
          </PageTransition>
        )
      },
    ]
  },

  // Catch-all route for 404
  { path: '*', element: <NotFoundPage /> },
]

export default routes