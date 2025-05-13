interface UserToolbarProps {
    search: string;
    setSearch: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
  }
  
  export default function UserToolbar({ search, setSearch, sortBy, setSortBy }: UserToolbarProps) {
    return (
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search user..."
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full sm:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
  
        <select
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full sm:w-64"
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
  