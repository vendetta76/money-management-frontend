import Sidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 min-h-screen">
      <Sidebar />
      <main className="md:col-span-5 p-6 bg-white text-black dark:bg-black dark:text-white">
        {children}
      </main>
    </div>
  );
}
