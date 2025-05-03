import Sidebar from "../components/Sidebar"

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

export default LayoutWithSidebar
