import { Pencil, Trash2 } from "lucide-react";

interface User {
  id: string;
  fullName?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status?: string;
}

interface UserCardRowProps {
  user: User;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserCardRow({ user, isSelected, onToggleSelect, onEdit, onDelete }: UserCardRowProps) {
  const initials = (user.fullName || user.name || "").substring(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(user.id)}
          className="form-checkbox w-4 h-4 text-blue-500 rounded"
        />

        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white font-bold text-sm ring-2 ring-blue-400">
            {initials}
          </div>
        )}
        <div className="text-sm">
          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            {user.fullName || user.name || "-"}
            {user.status && (
              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                user.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}>
                {user.status}
              </span>
            )}
          </p>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(user)}
          className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-300 transition"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(user)}
          className="p-2 rounded-full bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-600 dark:text-red-300 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}