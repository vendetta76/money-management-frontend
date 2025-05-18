import React from "react";

interface WalletSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const WalletSearchBar: React.FC<WalletSearchBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Cari dompet..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
      />
    </div>
  );
};

export default WalletSearchBar;