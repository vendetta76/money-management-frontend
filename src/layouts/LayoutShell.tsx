import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../hooks/useThemeAdvanced";
import { useGesture } from "@use-gesture/react";

const LayoutShell = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const bind = useGesture({
    onDragEnd: ({ swipe: [x] }) => {
      if (x === 1 && window.innerWidth <= 768) {
        setSidebarOpen(true); // swipe right
      }
      if (x === -1 && window.innerWidth <= 768) {
        setSidebarOpen(false); // swipe left
      }
    },
  });

  return (
    <div
      {...bind()}
      className="flex relative min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-60" : "md:ml-64"}`}>
        <header className="md:hidden p-4 flex justify-between items-center shadow bg-white dark:bg-gray-800 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 dark:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-purple-700 dark:text-purple-300">MonIQ</h1>
          <div></div>
        </header>

        <main className="w-full px-4 md:px-6 xl:px-8 2xl:px-10 pt-4 text-gray-800 dark:text-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutShell;