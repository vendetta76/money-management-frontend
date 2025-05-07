import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebaseClient';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Cek email Anda untuk reset password.');
    } catch (error: any) {
      alert('Gagal kirim email: ' + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Lupa Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Masukkan email kamu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full mb-4 border rounded px-4 py-2"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
        >
          Kirim Email Reset
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
