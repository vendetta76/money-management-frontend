import { Pencil, Trash2 } from "lucide-react";

interface User {
  id: string;
  fullName?: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface UserCardRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserCardRow({ user, onEdit, onDelete }: UserCardRowProps) {
  const initials = (user.fullName || user.name || "").substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
      <div className="flex items-center gap-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-800 font-bold text-sm">
            {initials}
          </div>
        )}
        <div>
          <div className="font-medium text-black dark:text-white">
            {user.fullName || user.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
        </div>
      </div>

      <div className="flex gap-3 mt-2 sm:mt-0">
        <button
          className="text-blue-500 hover:text-blue-700"
          onClick={() => onEdit(user)}
        >
          <Pencil size={18} />
        </button>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => onDelete(user)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
