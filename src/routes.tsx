
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

// About MoniQ Pages ✅
import AboutPage from './pages/about/AboutPage'
import PrivacyPolicyPage from './pages/about/PrivacyPolicyPage'
import TermsAndConditionsPage from './pages/about/TermsAndConditionsPage'

// Upgrade Page ✅
import UpgradePage from './pages/upgrade/UpgradePage'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-email-pending', element: <VerifyEmailPending /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  {
    path: '/dashboard',
    element: <PrivateRoute><PageTransition><DashboardPage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/wallet',
    element: <PrivateRoute><PageTransition><WalletPageWithPinVerify /></PageTransition></PrivateRoute>,
  },
  {
    path: '/income',
    element: <PrivateRoute><PageTransition><IncomePage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/outcome',
    element: <PrivateRoute><PageTransition><OutcomePage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/history',
    element: <PrivateRoute><PageTransition><HistoryPage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/profile',
    element: <PrivateRoute><PageTransition><ProfilePage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/profile/edit',
    element: <PrivateRoute><PageTransition><EditProfilePage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/settings/profile',
    element: <PrivateRoute><PageTransition><SettingsProfile /></PageTransition></PrivateRoute>,
  },
  {
    path: '/settings/security',
    element: <PrivateRoute><PageTransition><SecurityPage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/settings/preferences',
    element: <PrivateRoute><PageTransition><PreferencesPage /></PageTransition></PrivateRoute>,
  },

  // ✅ About MoniQ Routes
  {
    path: '/about',
    element: <PrivateRoute><PageTransition><AboutPage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/about/privacy-policy',
    element: <PrivateRoute><PageTransition><PrivacyPolicyPage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/about/terms-and-conditions',
    element: <PrivateRoute><PageTransition><TermsAndConditionsPage /></PageTransition></PrivateRoute>,
  },

  // ✅ Upgrade Page
  {
    path: '/upgrade',
    element: <PrivateRoute><PageTransition><UpgradePage /></PageTransition></PrivateRoute>,
  },

  {
    path: '/admin',
    element: <PrivateRoute requiredRole="Admin"><PageTransition><AdminPage /></PageTransition></PrivateRoute>,
  },
  {
    path: '/dev/token',
    element: <PrivateRoute><PageTransition><CopyFirebaseIdToken /></PageTransition></PrivateRoute>,
  },
  {
    path: '/unauthorized',
    element: (
      <div className="p-6 text-center text-red-600 text-xl">
        🚫 Akses ditolak: kamu tidak memiliki izin untuk halaman ini.
      </div>
    ),
  },
  { path: '*', element: <LandingPage /> },
]

export default routes
