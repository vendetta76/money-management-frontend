import React, { useState } from "react";
import { formatCurrency } from "@/helpers/formatCurrency";
import { Info } from "lucide-react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

interface WalletTotalOverviewProps {
  totalsByCurrency: Record<string, number>;
  showBalance: boolean;
}

// Color palette for the treemap
const COLORS = [
  "#4f46e5", "#7c3aed", "#9333ea", "#c026d3", "#db2777",
  "#e11d48", "#f59e0b", "#d97706", "#84cc16", "#10b981",
  "#06b6d4", "#3b82f6"
];

const WalletTotalOverview: React.FC<WalletTotalOverviewProps> = ({
  totalsByCurrency,
  showBalance,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Create data structure for the treemap
  const data = {
    name: "Currencies",
    children: Object.entries(totalsByCurrency)
      .filter(([_, value]) => value > 0) // Only include positive balances
      .map(([currency, value], index) => ({
        name: currency,
        size: value,
        value, // Keep the original value for tooltips
        symbol: formatCurrency(0, currency).replace(/\d+([.,]\d+)?/, ""),
        color: COLORS[index % COLORS.length]
      }))
  };

  // Custom content for treemap cells
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, index, name, symbol, color } = props;
    
    // Determine text size based on cell dimensions
    const fontSize = Math.min(width / 6, height / 4, 16);
    const isActive = activeIndex === index;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: "#fff",
            strokeWidth: isActive ? 2 : 0.5,
            opacity: isActive ? 1 : 0.85,
          }}
        />
        {width > 30 && height > 30 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={fontSize}
              fontWeight="bold"
            >
              {name}
            </text>
            {showBalance && (
              <text
                x={x + width / 2}
                y={y + height / 2 + 10}
                textAnchor="middle"
                fill="#fff"
                fontSize={fontSize * 0.9}
              >
                {`${symbol}...`}
              </text>
            )}
          </>
        )}
      </g>
    );
  };

  // Custom tooltip for hover details
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="text-sm font-bold">{data.name}</p>
          {showBalance ? (
            <p className="text-lg font-bold">
              {formatCurrency(data.value, data.name)}
            </p>
          ) : (
            <p className="text-lg font-bold">••••••</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">💰 Total Saldo per Mata Uang</h2>
        <div className="tooltip relative group">
          <Info size={18} className="text-gray-400 cursor-help" />
          <div className="absolute right-0 top-6 w-64 bg-white dark:bg-gray-800 p-2 rounded shadow-lg border text-sm hidden group-hover:block z-10">
            Size of each block represents the proportion of your total assets in that currency
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 overflow-hidden">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data.children}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              content={<CustomizedContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
        
        {/* Legend - Bottom summary */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
          {Object.entries(totalsByCurrency).length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {Object.entries(totalsByCurrency).map(([currency], index) => (
                <div key={currency} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs font-medium">{currency}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No currencies available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletTotalOverview;