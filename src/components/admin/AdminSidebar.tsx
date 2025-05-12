export default function Sidebar() {
    return (
      <aside className="md:col-span-1 p-4 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Admin</h2>
        <ul className="space-y-3">
          <li>Dashboard</li>
          <li>Users</li>
          <li>Transactions</li>
          <li>Reports</li>
          <li>Settings</li>
        </ul>
      </aside>
    );
  }