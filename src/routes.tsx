
import { RouteObject } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PrivateRoute from './components/PrivateRoute'

// Auth & Utility
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const VerifyEmailPending = lazy(() => import('./pages/VerifyEmailPending'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

// Core Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
import WalletPageWithPinVerify from './pages/WalletPage_WithPinVerify'
const IncomePage = lazy(() => import('./pages/IncomePage'))
const OutcomePage = lazy(() => import('./pages/OutcomePage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

// Profile
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'))

// Settings Modular
const SettingsProfile = lazy(() => import('./pages/settings/ProfilePage'))
const SecurityPage = lazy(() => import('./pages/settings/SecurityPage'))
const PreferencesPage = lazy(() => import('./pages/settings/PreferencesPage'))

const loading = <div className="p-6 text-sm text-gray-500">Loading...</div>

const routes: RouteObject[] = [
  { path: '/', element: <Suspense fallback={loading}><LandingPage /></Suspense> },
  { path: '/login', element: <Suspense fallback={loading}><LoginPage /></Suspense> },
  { path: '/register', element: <Suspense fallback={loading}><RegisterPage /></Suspense> },
  { path: '/forgot-password', element: <Suspense fallback={loading}><ForgotPasswordPage /></Suspense> },
  { path: '/verify-email-pending', element: <Suspense fallback={loading}><VerifyEmailPending /></Suspense> },
  { path: '/reset-password', element: <Suspense fallback={loading}><ResetPasswordPage /></Suspense> },

  {
    path: '/dashboard',
    element: <PrivateRoute><Suspense fallback={loading}><DashboardPage /></Suspense></PrivateRoute>,
  },
  {
    path: '/wallet',
    element: <PrivateRoute><WalletPageWithPinVerify /></PrivateRoute>,
  },
  {
    path: '/income',
    element: <PrivateRoute><Suspense fallback={loading}><IncomePage /></Suspense></PrivateRoute>,
  },
  {
    path: '/outcome',
    element: <PrivateRoute><Suspense fallback={loading}><OutcomePage /></Suspense></PrivateRoute>,
  },
  {
    path: '/history',
    element: <PrivateRoute><Suspense fallback={loading}><HistoryPage /></Suspense></PrivateRoute>,
  },
  {
    path: '/profile',
    element: <PrivateRoute><Suspense fallback={loading}><ProfilePage /></Suspense></PrivateRoute>,
  },
  {
    path: '/profile/edit',
    element: <PrivateRoute><Suspense fallback={loading}><EditProfilePage /></Suspense></PrivateRoute>,
  },
  {
    path: '/settings/profile',
    element: <PrivateRoute><Suspense fallback={loading}><SettingsProfile /></Suspense></PrivateRoute>,
  },
  {
    path: '/settings/security',
    element: <PrivateRoute><Suspense fallback={loading}><SecurityPage /></Suspense></PrivateRoute>,
  },
  {
    path: '/settings/preferences',
    element: <PrivateRoute><Suspense fallback={loading}><PreferencesPage /></Suspense></PrivateRoute>,
  },
  {
    path: '/admin',
    element: <PrivateRoute requiredRole="Admin"><Suspense fallback={loading}><AdminPage /></Suspense></PrivateRoute>,
  },
  {
    path: '/unauthorized',
    element: (
      <div className="p-6 text-center text-red-600 text-xl">
        🚫 Akses ditolak: kamu tidak memiliki izin untuk halaman ini.
      </div>
    ),
  },
  { path: '*', element: <Suspense fallback={loading}><LoginPage /></Suspense> },
]

export default routes
