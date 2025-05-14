import React from "react";

interface PageLockAnnouncementProps {
  locked: boolean;
  message?: string;
  currentUserEmail: string;
  currentUserRole?: string;
  bypassFor?: string[];
}

const PageLockAnnouncement: React.FC<PageLockAnnouncementProps> = ({
  locked,
  message,
  currentUserEmail,
  currentUserRole,
  bypassFor = ["Admin", "Staff", "Tester"],
}) => {
  const normalizedBypass = bypassFor.map((b) => b.toLowerCase());
  const email = currentUserEmail?.toLowerCase() || "";
  const role = currentUserRole?.toLowerCase() || "";

  const isBypassed =
    normalizedBypass.includes(email) || normalizedBypass.includes(role);

  console.log("🚨 DEBUG PageLock", {
    locked,
    currentUserEmail,
    currentUserRole,
    isBypassed,
    bypassFor,
  });

  if (!currentUserEmail) return null;
  if (!locked || isBypassed) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
      <div className="relative z-10 bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-xl text-center">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          🚧 Halaman Dikunci
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {message || "Halaman ini sedang tidak tersedia."}
        </p>
      </div>
    </div>
  );
};

export default PageLockAnnouncement;