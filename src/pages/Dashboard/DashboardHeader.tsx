import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  displayName?: string | null;
}

const DashboardHeader: React.FC<Props> = ({ displayName }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-700">Dashboard</h1>
        <p className="text-sm text-gray-500">Selamat datang kembali, {displayName}</p>
      </div>
      <button
        onClick={toggleLanguage}
        className="text-sm text-gray-500 underline hover:text-purple-700"
      >
        🌐 {language === 'id' ? 'Indonesia' : 'English'}
      </button>
    </div>
  );
};

export default DashboardHeader;