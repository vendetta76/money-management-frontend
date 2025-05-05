import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}
