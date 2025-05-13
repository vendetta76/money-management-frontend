interface UserToolbarProps {
    search: string;
    setSearch: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
  }
  
  export default function UserToolbar({ search, setSearch, sortBy, setSortBy }: UserToolbarProps) {
    return (
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search user..."
          className="rounded p-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 transition-colors duration-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
  
        <select
          className="rounded p-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 transition-colors duration-300"
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
  