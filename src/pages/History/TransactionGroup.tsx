import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import TransactionItem from './TransactionItem';
import { UnifiedEntry } from './historyTypes';

interface TransactionGroupProps {
  date: string;
  entries: UnifiedEntry[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  getWalletName: (walletId: string) => string;
  getWalletCurrency: (walletId: string) => string;
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({
  date,
  entries,
  expandedId,
  onToggleExpand,
  getWalletName,
  getWalletCurrency
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Date Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'grey.100',
          py: 1,
          px: 2,
          zIndex: 10,
          borderBottom: 1,
          borderColor: 'grey.300',
          mb: 2
        }}
      >
        <Typography
          variant="subtitle2"
          component="div"
          sx={{
            fontWeight: 600,
            color: 'text.secondary'
          }}
        >
          {formatDate(date)}
        </Typography>
      </Box>

      {/* Transaction Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {entries.map((item) => (
          <TransactionItem
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            onToggleExpand={() => onToggleExpand(item.id!)}
            getWalletName={getWalletName}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TransactionGroup;