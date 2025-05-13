import Sidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <Sidebar />
      <main className="md:col-span-5 p-6">
        {children}
      </main>
    </div>
  );
}
