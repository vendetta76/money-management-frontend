import { useState, useMemo } from 'react';
import { FilterState, UnifiedEntry } from './historyTypes';

export const useHistoryFilters = (data: UnifiedEntry[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    selectedDateRange: "all",
    customDate: "",
    selectedType: "all",
    selectedWallet: "all"
  });

  // Date filtering logic
  const isInSelectedDateRange = (date: Date) => {
    const now = new Date();
    const itemDate = new Date(date);

    switch (filters.selectedDateRange) {
      case "today":
        return itemDate.toDateString() === now.toDateString();
      
      case "yesterday":
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        return itemDate.toDateString() === yesterday.toDateString();
      
      case "last7":
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return itemDate >= sevenDaysAgo && itemDate <= now;
      
      case "thisMonth":
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      
      case "custom":
        return filters.customDate &&
          itemDate.toISOString().split("T")[0] === filters.customDate;
      
      default:
        return true;
    }
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchType = filters.selectedType === "all" || item.type === filters.selectedType;

      const matchWallet = filters.selectedWallet === "all" ||
        (item.type === "transfer"
          ? item.from === filters.selectedWallet || item.to === filters.selectedWallet
          : item.wallet === filters.selectedWallet);

      const matchSearch = "description" in item &&
        item.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchDate = isInSelectedDateRange(
        new Date(item.createdAt?.toDate?.() ?? item.createdAt)
      );

      return matchType && matchWallet && matchSearch && matchDate;
    });
  }, [data, filters]);

  // Grouped data by date
  const groupedData = useMemo(() => {
    const grouped: { [date: string]: UnifiedEntry[] } = {};
    filteredData.forEach((item) => {
      const d = new Date(item.createdAt?.seconds * 1000);
      const dateStr = d.toISOString().split("T")[0];
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(item);
    });
    return grouped;
  }, [filteredData]);

  return {
    filters,
    setFilters,
    filteredData,
    groupedData
  };
};