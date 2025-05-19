import React from "react";
import { Search } from "lucide-react";

interface WalletSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const WalletSearchBar: React.FC<WalletSearchBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Cari dompet berdasarkan nama atau mata uang..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                 transition-colors duration-200"
      />
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400 dark:text-gray-500" />
      </div>
      {searchTerm && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 
                   dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default WalletSearchBar;