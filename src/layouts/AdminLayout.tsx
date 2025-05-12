import Sidebar from "@/components/admin/AdminSidebar";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 min-h-screen">
      <Sidebar />
      <main className="md:col-span-5 p-6 bg-black text-white">
        {children}
      </main>
    </div>
  );
}
