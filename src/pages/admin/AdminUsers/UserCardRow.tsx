// src/components/admin/AdminUsers/UserCardRow.tsx
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
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700 hover:bg-gray-800 transition">
      <div className="flex items-center gap-4">
        <img
          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-medium text-white">{user.fullName || user.name}</div>
          <div className="text-sm text-gray-400">{user.email}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          className="text-blue-400 hover:text-blue-600"
          onClick={() => onEdit(user)}
        >
          <Pencil size={18} />
        </button>
        <button
          className="text-red-400 hover:text-red-600"
          onClick={() => onDelete(user)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
