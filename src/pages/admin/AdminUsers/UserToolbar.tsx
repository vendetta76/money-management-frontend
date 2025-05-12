// src/components/admin/UserToolbar.tsx
interface UserToolbarProps {
    search: string;
    setSearch: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
  }
  
  export default function UserToolbar({ search, setSearch, sortBy, setSortBy }: UserToolbarProps) {
    return (
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search user..."
          className="rounded p-2 text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
  
        <select
          className="rounded p-2 text-black"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt">Sort by: Created At</option>
          <option value="name">Sort by: Name</option>
          <option value="activity">Sort by: Activity</option>
        </select>
      </div>
    );
  }
  