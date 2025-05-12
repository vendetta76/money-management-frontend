import { useEffect, useState } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  useEffect(() => {
    const fetchUsers = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const token = await getIdToken(user);
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = await getIdToken(auth.currentUser);
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error("Gagal update role:", err);
    }
  };

  const filteredUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "activity") return (b.activity || 0) - (a.activity || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">👤 User Management</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search user..."
          className="rounded p-2 text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="rounded p-2 text-black"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt">Sort by: Created At</option>
          <option value="name">Sort by: Name</option>
          <option value="activity">Sort by: Activity</option>
        </select>
      </div>

      <table className="w-full text-sm bg-gray-800 rounded overflow-hidden">
        <thead className="bg-gray-700 text-left">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Email Verified</th>
            <th className="p-2">Role</th>
            <th className="p-2">Created At</th>
            <th className="p-2">Last Login</th>
            <th className="p-2">Activity</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, i) => (
            <tr key={i} className="border-t border-gray-700">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.emailVerified ? "✅" : "❌"}</td>
              <td className="p-2">
                <select
                  value={user.role || "User"}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="text-black rounded px-2 py-1"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </td>
              <td className="p-2">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
              <td className="p-2">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}</td>
              <td className="p-2">{user.activity ?? "-"}</td>
              <td className="p-2 flex gap-2">
                <button className="bg-blue-600 px-2 py-1 rounded text-xs" onClick={() => alert("Edit user: " + user.name)}>Edit</button>
                <button className="bg-red-600 px-2 py-1 rounded text-xs" onClick={() => confirm("Are you sure to delete " + user.name + "?")}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
