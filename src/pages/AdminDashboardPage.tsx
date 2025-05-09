import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  uid: string;
  email: string;
  role: string;
  isSuspended?: boolean;
}

interface Log {
  uid: string;
  action: string;
  meta?: any;
  timestamp: string;
}

const AdminDashboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role?.toLowerCase() !== 'admin') navigate('/403');
  }, [role, navigate]);

  useEffect(() => {
    if (role?.toLowerCase() === 'admin') {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('https://money-management-backend-f6dg.onrender.com/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
      console.log("📦 Users fetched:", res.data);
    } catch (err: any) {
      console.error('❌ Gagal load user:', err);
      setError('Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('❌ Gagal load log:', err);
      setError('Gagal memuat log aktivitas.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSuspend = async (uid: string) => {
    try {
      await axios.patch(`/api/admin/suspend/${uid}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err: any) {
      console.error('❌ Gagal suspend user:', err);
      alert('Gagal suspend user.');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const res = await axios.post('/api/admin/reset-password', { email }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Reset link:\n${res.data.resetLink}`);
    } catch (err: any) {
      console.error('❌ Gagal reset password:', err);
      alert('Gagal mengirim reset password.');
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-4 space-x-4">
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>User Management</button>
        <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 ${activeTab === 'logs' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Activity Logs</button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : activeTab === 'users' ? (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) ? users.map((user) => {
              console.log("📦 Render user row:", user);
              return (
                <tr key={user.uid} className="text-center border-t">
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">{user.isSuspended ? 'Suspended' : 'Active'}</td>
                  <td className="p-2 space-x-2">
                    <button
                      className="bg-yellow-500 px-3 py-1 text-white rounded"
                      onClick={() => toggleSuspend(user.uid)}
                    >
                      {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button
                      className="bg-blue-500 px-3 py-1 text-white rounded"
                      onClick={() => resetPassword(user.email)}
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              );
            }) : null}
          </tbody>
        </table>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Activity Logs</h2>
          <ul className="space-y-2">
            {Array.isArray(logs) ? logs.map((log, idx) => (
              <li key={idx} className="border p-2">
                <div><b>UID:</b> {log.uid}</div>
                <div><b>Action:</b> {log.action}</div>
                <div><b>Time:</b> {new Date(log.timestamp).toLocaleString()}</div>
                {log.meta && (
                  <div><b>Meta:</b> {JSON.stringify(log.meta)}</div>
                )}
              </li>
            )) : null}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
