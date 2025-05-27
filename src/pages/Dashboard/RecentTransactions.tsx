import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  LinearProgress,
  Alert,
  Collapse,
  useTheme
} from "@mui/material";
import {
  TrendingUp as IncomeIcon,
  TrendingDown as OutcomeIcon,
  SwapHoriz as TransferIcon,
  Search as SearchIcon,
  Visibility as ViewIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { id as localeID } from "date-fns/locale";

interface Transaction {
  id: string;
  type: 'income' | 'outcome' | 'transfer';
  description: string;
  amount: number;
  currency?: string;
  wallet?: string;
  from?: string;
  to?: string;
  category?: string;
  notes?: string;
  createdAt: {
    toDate: () => Date;
    seconds: number;
  };
}

interface Wallet {
  id: string;
  name: string;
  balance?: number;
  currency?: string;
}

interface Props {
  transactions: Transaction[];
  wallets: Wallet[];
  isWalletsLoaded: boolean;
  displayCurrency: string; // New prop for manual currency setting
}

// Simple currency formatting - no conversion, just formatting in display currency
const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  switch (currency.toUpperCase()) {
    case 'USD':
      return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
      });
    case 'EUR':
      return amount.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2
      });
    case 'JPY':
      return amount.toLocaleString('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0
      });
    case 'SGD':
      return amount.toLocaleString('en-SG', {
        style: 'currency',
        currency: 'SGD',
        maximumFractionDigits: 2
      });
    case 'GBP':
      return amount.toLocaleString('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 2
      });
    case 'THB':
      return amount.toLocaleString('th-TH', {
        style: 'currency',
        currency: 'THB',
        maximumFractionDigits: 2
      });
    case 'MYR':
      return `RM ${amount.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`;
    case 'IDR':
    default:
      return amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      });
  }
};

const getWalletName = (walletId: string, wallets: Wallet[]): string => {
  const wallet = wallets.find((w) => w.id === walletId);
  return wallet ? wallet.name : `${walletId} (Dihapus)`;
};

const RecentTransactions: React.FC<Props> = ({ 
  transactions, 
  wallets, 
  isWalletsLoaded,
  displayCurrency 
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  // Simple filtering and sorting
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((tx) => tx.createdAt);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tx) =>
        tx.description.toLowerCase().includes(query) ||
        tx.category?.toLowerCase().includes(query) ||
        getWalletName(tx.wallet || '', wallets).toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first) and take top 8
    return filtered
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
      .slice(0, 8);
  }, [transactions, searchQuery, wallets]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <IncomeIcon />;
      case 'outcome':
        return <OutcomeIcon />;
      case 'transfer':
        return <TransferIcon />;
      default:
        return <OutcomeIcon />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return theme.palette.success.main;
      case 'outcome':
        return theme.palette.error.main;
      case 'transfer':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'income':
        return '+';
      case 'outcome':
        return '-';
      default:
        return '';
    }
  };

  return (
    <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight="bold">
            Transaksi Terbaru
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {isWalletsLoaded 
              ? `${filteredTransactions.length} dari ${transactions.length} transaksi • ${displayCurrency}`
              : "Loading..."
            }
          </Typography>
        }
      />

      <CardContent sx={{ flex: 1, pt: 0 }}>
        {/* Simple Search */}
        <TextField
          size="small"
          placeholder="Cari transaksi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          fullWidth
          sx={{ mb: 2 }}
        />

        {!isWalletsLoaded ? (
          <Box>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" align="center">
              Loading...
            </Typography>
          </Box>
        ) : filteredTransactions.length === 0 ? (
          <Alert severity="info">
            {transactions.length === 0 
              ? "Belum ada transaksi."
              : "Tidak ada transaksi yang cocok dengan pencarian."
            }
          </Alert>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
            {filteredTransactions.map((tx, index) => {
              const walletName = getWalletName(tx.wallet || '', wallets);
              const isExpanded = expandedTx === tx.id;
              
              return (
                <Box key={tx.id}>
                  <ListItem 
                    sx={{ 
                      px: 0, 
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      borderRadius: 1
                    }}
                    onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                  >
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          bgcolor: getTransactionColor(tx.type),
                          width: 40,
                          height: 40
                        }}
                      >
                        {getTransactionIcon(tx.type)}
                      </Avatar>
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {tx.description}
                          </Typography>
                          {tx.category && (
                            <Chip 
                              label={tx.category} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 18, mt: 0.5 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {tx.type === 'transfer'
                              ? `${tx.from} → ${tx.to}`
                              : `${walletName}`
                            }
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {tx.createdAt?.toDate
                              ? format(new Date(tx.createdAt.toDate()), 'dd MMM yyyy, HH:mm', { locale: localeID })
                              : '-'
                            }
                          </Typography>
                        </Box>
                      }
                    />

                    <Box sx={{ textAlign: 'right', ml: 2 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ color: getTransactionColor(tx.type) }}
                      >
                        {getAmountPrefix(tx.type)}{formatCurrency(tx.amount, displayCurrency)}
                      </Typography>
                      {tx.currency && tx.currency !== displayCurrency && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Original: {tx.currency}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>

                  {/* Expanded Details */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ 
                      px: 2, 
                      pb: 2, 
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      mx: 1,
                      mb: 1
                    }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        <strong>Transaction ID:</strong> {tx.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        <strong>Amount:</strong> {formatCurrency(tx.amount, displayCurrency)}
                        {tx.currency && tx.currency !== displayCurrency && ` (Original: ${tx.currency})`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        <strong>Type:</strong> {tx.type.toUpperCase()}
                      </Typography>
                      {tx.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <strong>Catatan:</strong> {tx.notes}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                  
                  {index < filteredTransactions.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}

        {/* Footer */}
        {filteredTransactions.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box textAlign="center">
              <Link to="/history" style={{ textDecoration: 'none' }}>
                <Chip 
                  label="Lihat Semua" 
                  color="primary" 
                  size="small"
                  clickable
                  icon={<ViewIcon />}
                />
              </Link>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;