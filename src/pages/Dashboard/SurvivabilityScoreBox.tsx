// src/pages/Dashboard/SurvivabilityScoreBox.tsx

import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface Wallet {
  id: string;
  name: string;
  balance: number;
  isSaving?: boolean;
}

interface Props {
  income: number;
  outcome: number;
  wallets: Wallet[];
}

const getSurvivabilityStatus = (income: number, outcome: number, wallets: Wallet[]) => {
  const savings = wallets.reduce((acc, w) => acc + (w.isSaving ? w.balance || 0 : 0), 0);
  const total = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const ratio = outcome > 0 ? income / outcome : income > 0 ? 2 : 0;
  const savingsRatio = total > 0 ? savings / total : 0;

  let scoreIncome = ratio >= 1.5 ? 100 : ratio >= 1 ? 70 : ratio >= 0.8 ? 40 : 10;
  let scoreSavings = savingsRatio >= 0.3 ? 100 : savingsRatio >= 0.2 ? 70 : savingsRatio >= 0.1 ? 40 : 10;
  const totalScore = (scoreIncome + scoreSavings) / 2;

  let status = '🔴';
  if (totalScore >= 80) status = '✅';
  else if (totalScore >= 50) status = '⚠️';

  return {
    icon: status,
    label: status === '✅' ? 'Aman' : status === '⚠️' ? 'Waspada' : 'Bahaya',
    details: {
      income: { score: scoreIncome, ratio: ratio.toFixed(2) },
      savings: { score: scoreSavings, ratio: savingsRatio.toFixed(2) },
      total: totalScore.toFixed(1)
    }
  };
};

const SurvivabilityScoreBox: React.FC<Props> = ({ income, outcome, wallets }) => {
  const prevStatus = useRef<string | null>(null);
  const survivability = getSurvivabilityStatus(income, outcome, wallets);

  useEffect(() => {
    if (!prevStatus.current) {
      prevStatus.current = survivability.icon;
    } else if (prevStatus.current !== survivability.icon) {
      toast(`Status survivability berubah dari ${prevStatus.current} ke ${survivability.icon}`);
      prevStatus.current = survivability.icon;
    }
  }, [survivability.icon]);

  return (
    <div className="bg-white p-4 rounded-xl shadow text-sm text-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-gray-500">Health Score</h4>
        <div className="relative group cursor-pointer">
          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <div className="absolute z-10 hidden group-hover:block bg-white border text-xs rounded shadow px-3 py-2 top-6 right-0 w-60">
            Skor dihitung dari:<br />
            - Rasio Income/Outcome (ideal: 2.0)<br />
            - Rasio Tabungan terhadap Total Saldo (ideal: 30%)
          </div>
        </div>
      </div>

      <div className="text-center text-xl font-bold mb-4">
        <span className={
          survivability.icon === '✅' ? 'text-green-500' :
          survivability.icon === '⚠️' ? 'text-yellow-500' : 'text-red-500'
        }>
          {survivability.icon} {survivability.label}
        </span>
      </div>

      {/* Overall Score */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-center mb-1">Overall Score</p>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${survivability.details.total}%` }}></div>
        </div>
      </div>

      <hr className="my-4" />

      {/* Income vs Outcome */}
      <div className="mb-4">
        <p className="text-xs font-semibold mb-1">Income vs Outcome</p>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-green-500 h-3 rounded-full" style={{ width: `${survivability.details.income.score}%` }}></div>
        </div>
      </div>

      {/* Savings Score */}
      <div>
        <p className="text-xs font-semibold mb-1">Savings Score</p>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${survivability.details.savings.score}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default SurvivabilityScoreBox;