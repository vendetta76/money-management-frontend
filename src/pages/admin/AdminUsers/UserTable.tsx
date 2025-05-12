interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt?: string;
    lastLogin?: string;
    activity?: string | number;
  }
  
  interface UserTableProps {
    users: User[];
    handleRoleChange: (userId: string, newRole: string) => void;
  }
  
  export default function UserTable({ users, handleRoleChange }: UserTableProps) {
    return (
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
          {users.map((user) => (
            <tr key={user.id} className="border-t border-gray-700">
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
                <button
                  className="bg-blue-600 px-2 py-1 rounded text-xs"
                  onClick={() => alert("Edit user: " + user.name)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 px-2 py-1 rounded text-xs"
                  onClick={() => confirm("Are you sure to delete " + user.name + "?")}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }