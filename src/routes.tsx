import { RouteObject } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import LandingPage from './pages/LandingPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyEmailPending from './pages/VerifyEmailPending'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import IncomePage from './pages/IncomePage'
import OutcomePage from './pages/OutcomePage'
import HistoryPage from './pages/HistoryPage' // (kalau belum ada, tinggal buat)
import PrivateRoute from './components/PrivateRoute'
import WalletPage from './pages/WalletPage'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/verify-email-pending',
    element: <VerifyEmailPending />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <DashboardPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/wallet',
    element: (
      <PrivateRoute>
        <WalletPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/income',
    element: (
      <PrivateRoute>
        <IncomePage />
      </PrivateRoute>
    ),
  },
  {
    path: '/outcome',
    element: (
      <PrivateRoute>
        <OutcomePage />
      </PrivateRoute>
    ),
  },
  {
    path: '/history',
    element: (
      <PrivateRoute>
        <HistoryPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <ProfilePage />
      </PrivateRoute>
    ),
  },
  {
    path: '/profile/edit',
    element: (
      <PrivateRoute>
        <EditProfilePage />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute requiredRole="Admin">
        <AdminPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <div className="p-6 text-center text-red-600 text-xl">
        🚫 Akses ditolak: kamu tidak memiliki izin untuk halaman ini.
      </div>
    ),
  },
  {
    path: '*',
    element: <LoginPage />,
  },
]

export default routes
