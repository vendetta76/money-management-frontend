import UserCardRow from "./UserCardRow";

interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  avatarUrl?: string;
}

interface UsersListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersList({ users, onEdit, onDelete }: UsersListProps) {
  return (
    <div className="bg-gray-900 rounded-md shadow divide-y divide-gray-800 overflow-hidden">
      {users.length === 0 ? (
        <div className="p-6 text-center text-gray-400">No users found.</div>
      ) : (
        users.map((user) => (
          <UserCardRow key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} />
        ))
      )}
    </div>
  );
}
