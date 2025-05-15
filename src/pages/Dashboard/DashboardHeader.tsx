// src/pages/Dashboard/DashboardHeader.tsx

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  displayName?: string | null;
}

const languageOptions = [
  { code: 'en', label: 'English (Default)' },
  { code: 'id', label: 'Indonesia' },
  { code: 'es', label: 'Spain' },
  { code: 'zh', label: 'Chinese' },
];

const DashboardHeader: React.FC<Props> = ({ displayName }) => {
  const { language, toggleLanguage, setLanguage } = useLanguage();

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-700">Dashboard</h1>
        <p className="text-sm text-gray-500">Selamat datang kembali, {displayName}</p>
      </div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none"
      >
        {languageOptions.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DashboardHeader;