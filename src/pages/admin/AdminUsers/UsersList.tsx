import UserCardRow from "./UserCardRow";

interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  status?: string;
}

interface UsersListProps {
  users: User[];
  selected: string[];
  toggleSelect: (id: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersList({ users, selected, toggleSelect, onEdit, onDelete }: UsersListProps) {
  return (
    <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {users.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">No users found.</div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <UserCardRow
              key={user.id}
              user={user}
              isSelected={selected.includes(user.id)}
              onToggleSelect={toggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
