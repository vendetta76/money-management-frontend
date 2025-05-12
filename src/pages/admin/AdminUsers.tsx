import { useEffect, useState } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import AdminLayout from "@/layouts/AdminLayout";
import UserToolbar from "@/pages/admin/AdminUsers/UserToolbar";
import UsersList from "@/pages/admin/AdminUsers/UsersList";
import PaginationBar from "@/components/ui/PaginationBar";

const BASE_URL = "https://money-management-backend-f6dg.onrender.com";
const ITEMS_PER_PAGE = 10;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
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

  const handleRoleChange = async (userId: string, newRole: string) => {
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
      }
    } catch (err) {
      console.error("❌ Gagal update role:", err);
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

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <AdminLayout>
      <div className="p-4 text-black dark:text-white">
        <h1 className="text-2xl font-bold mb-4">👤 User Management</h1>
        <UserToolbar
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <UsersList users={pagedUsers} onEdit={(user) => alert("Edit: " + user.name)} onDelete={(user) => alert("Delete: " + user.name)} />
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
