// src/routes.tsx
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
import DashboardPage from './pages/DashboardPage'
import WalletPage from './pages/WalletPage'
import IncomePage from './pages/IncomePage'
import OutcomePage from './pages/OutcomePage'
import TransferPage from './pages/TransferPage'
import HistoryPage from './pages/HistoryPage'

// Profile
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'

// Settings Modular
import SettingsProfile from './pages/settings/ProfilePage'
import SecurityPage from './pages/settings/SecurityPage'
import PreferencesPage from './pages/settings/PreferencesPage'

// About MoniQ Pages ✨
import AboutPage from './pages/about/AboutPage'
import PrivacyPolicyPage from './pages/about/PrivacyPolicyPage'
import TermsAndConditionsPage from './pages/about/TermsAndConditionsPage'

// Upgrade Page ✨
import UpgradePage from './pages/upgrade/UpgradePage'

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

  // About MoniQ
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
]

export default routes
