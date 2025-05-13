import { useEffect, useState } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import AdminLayout from "@/layouts/AdminLayout";
import UserToolbar from "@/pages/admin/AdminUsers/UserToolbar";
import UsersList from "@/pages/admin/AdminUsers/UsersList";
import PaginationBar from "@/pages/admin/AdminUsers/PaginationBar";
import toast, { Toaster } from "react-hot-toast";

const BASE_URL = "https://money-management-backend-f6dg.onrender.com";
const ITEMS_PER_PAGE = 10;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const token = await getIdToken(user);
      const res = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = await getIdToken(auth.currentUser);
      const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
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
        toast.success("Role updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (!confirm(`Yakin hapus ${selected.length} user?`)) return;
    setUsers((prev) => prev.filter((u) => !selected.includes(u.id)));
    setSelected([]);
    toast.success(`${selected.length} user dihapus`);
  };

  const filteredUsers = users
    .filter((user) =>
      (user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())) &&
      (!roleFilter || user.role === roleFilter)
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "nameDesc") return b.name.localeCompare(a.name);
      if (sortBy === "email") return a.email.localeCompare(b.email);
      if (sortBy === "activity") return (b.activity || 0) - (a.activity || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="p-4 bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">👤 User Management</h1>

        <UserToolbar
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
        />

        {selected.length > 0 && (
          <div className="mb-4">
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Delete Selected ({selected.length})
            </button>
          </div>
        )}

        <UsersList
          users={pagedUsers}
          selected={selected}
          toggleSelect={toggleSelect}
          onEdit={(user) => alert("Edit: " + user.name)}
          onDelete={(user) => {
            if (confirm("Yakin hapus user ini?")) {
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
              toast.success("User dihapus");
            }
          }}
        />

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        />
      </div>
    </AdminLayout>
  );
}