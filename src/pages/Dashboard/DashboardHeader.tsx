import React from 'react';
import LangToggle from './LangToggle';

interface Props {
  displayName?: string | null;
}

const DashboardHeader: React.FC<Props> = ({ displayName }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Selamat datang kembali, {displayName}
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <LangToggle />
      </div>
    </div>
  );
};

export default DashboardHeader;