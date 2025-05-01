import { Routes, Route } from 'react-router-dom'; // ⬅️ Hapus BrowserRouter
import { Toaster } from 'react-hot-toast';

import CheckEmail from './pages/auth/CheckEmail';
import AutoLogin from './pages/auth/AutoLogin';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Verified from './pages/Verified';
import Transactions from './pages/transactions/Transactions';
import Profile from './pages/profile/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageTransactions from './pages/admin/ManageTransactions';
import AdminSettings from './pages/admin/Settings';

import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Pemasukan from './pages/Pemasukan';
import Pengeluaran from './pages/Pengeluaran';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verified" element={<Verified />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/auto-login" element={<AutoLogin />} />

        {/* Dashboard Summary - Home */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Home />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Pemasukan */}
        <Route path="/pemasukan" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Pemasukan />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Pengeluaran */}
        <Route path="/pengeluaran" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Pengeluaran />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Transaksi */}
        <Route path="/transactions" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Transactions />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/transactions" element={<ManageTransactions />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </>
  );
}

export default App;
