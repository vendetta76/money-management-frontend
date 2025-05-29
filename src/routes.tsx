// src/routes.tsx - RESTORED ORIGINAL STRUCTURE + REPORT ROUTE + ARTICLE MANAGEMENT
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
import ReportPage from './pages/settings/ReportPage'

// About MeowIQ Pages ✨
import AboutPage from './pages/about/AboutPage'
import PrivacyPolicyPage from './pages/about/PrivacyPolicyPage'
import TermsAndConditionsPage from './pages/about/TermsAndConditionsPage'

// Upgrade Page ✨
import UpgradePage from './pages/upgrade/UpgradePage'

// 404 Page
import NotFoundPage from './pages/NotFoundPage'

// 🛡️ ADMIN COMPONENTS - Original
import AdminProtectedRoute from '@/components/Admin/AdminProtectedRoute'
import AdminLayoutShell from '@/layouts/Admin/AdminLayoutShell'
import AdminDashboard from '@/pages/admin/DashboardPage'
import UserManagement from '@/pages/admin/UsersManagementPage'
import WalletManagement from '@/pages/admin/WalletsManagementPage'
import TransactionManagement from '@/pages/admin/TransactionsManagementPage'
import GlobalSettings from '@/pages/admin/SettingsPage'
import AuditLogs from '@/pages/admin/AuditLogsPage'

// 🚀 NEW ADMIN FEATURES
import CommunicationSystem from './pages/admin/CommunicationSystem'
import SystemManagement from './pages/admin/SystemManagement'
import SecurityManagement from './pages/admin/SecurityManagement'
import PostsManagementPage from './pages/admin/PostsManagementPage'

const routes: RouteObject[] = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-email-pending', element: <VerifyEmailPending /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // PIN reset flow
  { path: '/forgot-pin', element: <ForgotPinPage /> },

  // USER ROUTES (Your original working routes)
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
  // 🆕 Added Report route - MATCHING YOUR EXACT PATTERN
  {
    path: '/settings/report',
    element: (
      <PrivateRoute>
        <PageTransition>
          <ReportPage />
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

  // 🛡️ COMPLETE ADMIN ROUTES SECTION
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminLayoutShell />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      
      // CORE ADMIN PAGES
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

      // 📝 POSTS MANAGEMENT
      { 
        path: 'articles', 
        element: (
          <PageTransition>
            <PostsManagementPage />
          </PageTransition>
        )
      },
      { 
        path: 'posts', 
        element: (
          <PageTransition>
            <PostsManagementPage />
          </PageTransition>
        )
      },
      { 
        path: 'blog', 
        element: (
          <PageTransition>
            <PostsManagementPage />
          </PageTransition>
        )
      },

      // 📨 COMMUNICATION SYSTEM
      { 
        path: 'communications', 
        element: (
          <PageTransition>
            <CommunicationSystem />
          </PageTransition>
        )
      },
      { 
        path: 'notifications', 
        element: (
          <PageTransition>
            <CommunicationSystem />
          </PageTransition>
        )
      },

      // 🛠️ SYSTEM MANAGEMENT
      { 
        path: 'system', 
        element: (
          <PageTransition>
            <SystemManagement />
          </PageTransition>
        )
      },
      { 
        path: 'system/health', 
        element: (
          <PageTransition>
            <SystemManagement />
          </PageTransition>
        )
      },
      { 
        path: 'system/performance', 
        element: (
          <PageTransition>
            <SystemManagement />
          </PageTransition>
        )
      },
      { 
        path: 'system/backup', 
        element: (
          <PageTransition>
            <SystemManagement />
          </PageTransition>
        )
      },
      { 
        path: 'system/maintenance', 
        element: (
          <PageTransition>
            <SystemManagement />
          </PageTransition>
        )
      },

      // 🔐 ENHANCED SECURITY
      { 
        path: 'security', 
        element: (
          <PageTransition>
            <SecurityManagement />
          </PageTransition>
        )
      },
      { 
        path: 'security/alerts', 
        element: (
          <PageTransition>
            <SecurityManagement />
          </PageTransition>
        )
      },
      { 
        path: 'security/sessions', 
        element: (
          <PageTransition>
            <SecurityManagement />
          </PageTransition>
        )
      },
      { 
        path: 'security/whitelist', 
        element: (
          <PageTransition>
            <SecurityManagement />
          </PageTransition>
        )
      },
      { 
        path: 'security/bugs', 
        element: (
          <PageTransition>
            <SecurityManagement />
          </PageTransition>
        )
      },

      // ORIGINAL ADMIN ROUTES (Updated)
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
            <SecurityManagement />
          </PageTransition>
        )
      },
      { 
        path: 'settings/notifications', 
        element: (
          <PageTransition>
            <CommunicationSystem />
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

      // REPORTS ROUTES
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

      // PROFILE ROUTES
      { 
        path: 'profile', 
        element: (
          <PageTransition>
            <GlobalSettings />
          </PageTransition>
        )
      },
    ]
  },

  // Catch-all route for 404
  { path: '*', element: <NotFoundPage /> },
]

export default routes