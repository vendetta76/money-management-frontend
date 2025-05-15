import React from 'react';
import LangToggle from './LangToggle';

interface Props {
  displayName?: string | null;
}

const DashboardHeader: React.FC<Props> = ({ displayName }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-700">Dashboard</h1>
        <p className="text-sm text-gray-500">Selamat datang kembali, {displayName}</p>
      </div>
      <LangToggle />
    </div>
  );
};

export default DashboardHeader;
