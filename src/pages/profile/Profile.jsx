import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <p className="p-4">Memuat profil...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-600">Profil Pengguna</h1>
      <div className="space-y-4">
        <div>
          <span className="block text-sm text-gray-600">Email</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-600">ID</span>
          <span className="font-mono text-xs">{user.id}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-600">Role</span>
          <span className="font-semibold capitalize">{user.role || "user"}</span>
        </div>
      </div>
    </div>
  );
}
