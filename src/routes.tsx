
import { RouteObject } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import RoleRedirect from './pages/RoleRedirect'

// Auth & Utility
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyEmailPending from './pages/VerifyEmailPending'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LandingPage from './pages/LandingPage'

// Core Pages
import DashboardPage from './pages/DashboardPage'
import WalletPageWithPinVerify from './pages/WalletPage_WithPinVerify'
import IncomePage from './pages/IncomePage'
import OutcomePage from './pages/OutcomePage'
import HistoryPage from './pages/HistoryPage'
import AdminPage from './pages/AdminPage'

// Profile
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'

// Settings Modular
import SettingsProfile from './pages/settings/ProfilePage'
import SecurityPage from './pages/settings/SecurityPage'
import PreferencesPage from './pages/settings/PreferencesPage'

// Developer Utility
import CopyFirebaseIdToken from './pages/CopyFirebaseIdToken'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <PrivateRoute><RoleRedirect /></PrivateRoute>,
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-email-pending', element: <VerifyEmailPending /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  {
    path: '/dashboard',
    element: <PrivateRoute><DashboardPage /></PrivateRoute>,
  },
  {
    path: '/wallet',
    element: <PrivateRoute><WalletPageWithPinVerify /></PrivateRoute>,
  },
  {
    path: '/income',
    element: <PrivateRoute><IncomePage /></PrivateRoute>,
  },
  {
    path: '/outcome',
    element: <PrivateRoute><OutcomePage /></PrivateRoute>,
  },
  {
    path: '/history',
    element: <PrivateRoute><HistoryPage /></PrivateRoute>,
  },
  {
    path: '/profile',
    element: <PrivateRoute><ProfilePage /></PrivateRoute>,
  },
  {
    path: '/profile/edit',
    element: <PrivateRoute><EditProfilePage /></PrivateRoute>,
  },
  {
    path: '/settings/profile',
    element: <PrivateRoute><SettingsProfile /></PrivateRoute>,
  },
  {
    path: '/settings/security',
    element: <PrivateRoute><SecurityPage /></PrivateRoute>,
  },
  {
    path: '/settings/preferences',
    element: <PrivateRoute><PreferencesPage /></PrivateRoute>,
  },
  {
    path: '/admin',
    element: <PrivateRoute requiredRole="Admin"><AdminPage /></PrivateRoute>,
  },
  {
    path: '/dev/token',
    element: <PrivateRoute><CopyFirebaseIdToken /></PrivateRoute>,
  },
  {
    path: '/unauthorized',
    element: (
      <div className="p-6 text-center text-red-600 text-xl">
        🚫 Akses ditolak: kamu tidak memiliki izin untuk halaman ini.
      </div>
    ),
  },
  { path: '*', element: <LoginPage /> },
]

export default routes
