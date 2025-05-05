// money-management-frontend

// (Tetap sama: Router, Context, Navbar, Login, Register, AdminPanel, Dashboard + Tambah, Hapus, Edit, Summary, Profile Edit, Ganti Password)

// Tambahan: Profile.jsx dengan upload avatar dan Dark Mode global

// pages/Profile.jsx
import { useAuth, api } from '../App';
import { useState } from 'react';

function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatar) formData.append('avatar', avatar);

      const res = await api.put('/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      login({ ...user, name: res.data.name, email: res.data.email, avatar: res.data.avatar });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile!');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', { password }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPassword('');
      alert('Password changed successfully!');
    } catch (error) {
      alert('Failed to change password!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {user?.avatar && (
        <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full mx-auto mb-4" />
      )}

      <form onSubmit={handleUpdateProfile} className="border p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files[0])}
          className="border p-2 rounded w-full mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Profile</button>
      </form>

      <form onSubmit={handleChangePassword} className="border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Change Password</button>
      </form>
    </div>
  );
}

export default Profile;

// Update App.jsx tetap:
import Profile from './pages/Profile';

<Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />

// Tambahan: Dark Mode
// Update tailwind.config.js (opsional) untuk mode dark
// Tambahkan class "dark" di <html> atau toggle dark mode via button di Navbar.jsx nanti
