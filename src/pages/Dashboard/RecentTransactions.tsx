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
  useTheme,
  useMediaQuery,
  Paper,
  Tooltip,
  Stack,
  Badge
} from "@mui/material";
import {
  TrendingUp as IncomeIcon,
  TrendingDown as OutcomeIcon,
  SwapHoriz as TransferIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
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
  displayCurrency: string;
}

// Enhanced currency formatting with better support for all currencies
const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  // Handle undefined/null amounts
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }

  // Normalize currency to uppercase
  const normalizedCurrency = (currency || 'IDR').toUpperCase();

  switch (normalizedCurrency) {
    // Traditional Currencies
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
    case 'AUD':
      return amount.toLocaleString('en-AU', {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits: 2
      });
    case 'CAD':
      return amount.toLocaleString('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 2
      });
    case 'CHF':
      return amount.toLocaleString('de-CH', {
        style: 'currency',
        currency: 'CHF',
        maximumFractionDigits: 2
      });
    
    // Cryptocurrencies
    case 'USDT':
      return `USDT ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 6 
      })}`;
    case 'USDC':
      return `USDC ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 6 
      })}`;
    case 'BTC':
      return `₿ ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 8 
      })}`;
    case 'ETH':
      return `Ξ ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 6 
      })}`;
    case 'BNB':
      return `BNB ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 4 
      })}`;
    case 'ADA':
      return `ADA ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 6 
      })}`;
    case 'DOT':
      return `DOT ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 4 
      })}`;
    case 'MATIC':
      return `MATIC ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 4 
      })}`;
    case 'SOL':
      return `SOL ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 4 
      })}`;
    case 'AVAX':
      return `AVAX ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 4 
      })}`;
    
    // Indonesian Rupiah (default)
    case 'IDR':
      return amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      });
    
    // Fallback for unknown currencies
    default:
      return `${normalizedCurrency} ${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 6 
      })}`;
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced filtering and sorting
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((tx) => tx.createdAt && tx.amount !== undefined);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tx) =>
        tx.description?.toLowerCase().includes(query) ||
        tx.category?.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query) ||
        getWalletName(tx.wallet || '', wallets).toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first) and take appropriate amount for mobile
    return filtered
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
      .slice(0, isMobile ? 6 : 8);
  }, [transactions, searchQuery, wallets, isMobile]);

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

  const getCurrencyChipColor = (currency: string) => {
    const normalizedCurrency = (currency || '').toUpperCase();
    // Crypto currencies get special colors
    if (['BTC', 'ETH', 'BNB', 'USDT', 'USDC'].includes(normalizedCurrency)) {
      return 'warning';
    }
    // Traditional currencies
    return 'primary';
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              {isMobile ? 'Transaksi' : 'Transaksi Terbaru'}
            </Typography>
            
            {/* Mobile: Filter Toggle */}
            {isMobile && (
              <IconButton
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                sx={{ 
                  bgcolor: showFilters ? 'primary.main' : 'transparent',
                  color: showFilters ? 'white' : 'inherit'
                }}
              >
                <Badge badgeContent={searchQuery ? 1 : 0} color="error">
                  <FilterIcon />
                </Badge>
              </IconButton>
            )}
          </Box>
        }
        subheader={
          !isMobile && (
            <Typography variant="body2" color="text.secondary">
              {isWalletsLoaded 
                ? `${filteredTransactions.length} dari ${transactions.length} transaksi • Display: ${displayCurrency}`
                : "Loading..."
              }
            </Typography>
          )
        }
      />

      <CardContent sx={{ flex: 1, pt: 0 }}>
        {/* Search - Responsive */}
        <Collapse in={!isMobile || showFilters}>
          <Box sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder={isSmallMobile ? "Cari transaksi..." : "Cari transaksi, kategori, atau mata uang..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            
            {/* Mobile Status */}
            {isMobile && isWalletsLoaded && (
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {filteredTransactions.length} dari {transactions.length} transaksi
                </Typography>
                <Chip 
                  label={displayCurrency} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            )}
          </Box>
        </Collapse>

        {!isWalletsLoaded ? (
          <Box>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" align="center">
              Loading transactions...
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
          <>
            <List sx={{ maxHeight: { xs: 350, md: 400 }, overflow: 'auto', p: 0 }}>
              {filteredTransactions.map((tx, index) => {
                const walletName = getWalletName(tx.wallet || '', wallets);
                const isExpanded = expandedTx === tx.id;
                const txCurrency = tx.currency || displayCurrency;
                const showCurrencyDifference = tx.currency && tx.currency !== displayCurrency;
                
                return (
                  <Box key={tx.id}>
                    <ListItem 
                      sx={{ 
                        px: { xs: 1, sm: 2 }, 
                        py: { xs: 1, sm: 1.5 },
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        borderRadius: 1
                      }}
                      onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                    >
                      <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 } }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getTransactionColor(tx.type),
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 }
                          }}
                        >
                          {getTransactionIcon(tx.type)}
                        </Avatar>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box>
                            <Typography 
                              variant={isSmallMobile ? "body2" : "subtitle2"} 
                              fontWeight="bold"
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {tx.description || 'Transaksi'}
                            </Typography>
                            
                            {/* Mobile: Compact chips */}
                            {isMobile ? (
                              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                {tx.category && (
                                  <Chip 
                                    label={tx.category} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.6rem', height: 16 }}
                                  />
                                )}
                                {txCurrency && (
                                  <Chip 
                                    label={txCurrency}
                                    size="small" 
                                    color={getCurrencyChipColor(txCurrency)}
                                    variant="filled"
                                    sx={{ fontSize: '0.6rem', height: 16 }}
                                  />
                                )}
                              </Stack>
                            ) : (
                              <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                                {tx.category && (
                                  <Chip 
                                    label={tx.category} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 18 }}
                                  />
                                )}
                                {txCurrency && (
                                  <Chip 
                                    label={txCurrency}
                                    size="small" 
                                    color={getCurrencyChipColor(txCurrency)}
                                    variant="filled"
                                    sx={{ fontSize: '0.7rem', height: 18 }}
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {tx.type === 'transfer'
                                ? `${tx.from || 'Unknown'} → ${tx.to || 'Unknown'}`
                                : walletName
                              }
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {tx.createdAt?.toDate
                                ? format(new Date(tx.createdAt.toDate()), 
                                    isSmallMobile ? 'dd/MM, HH:mm' : 'dd MMM yyyy, HH:mm', 
                                    { locale: localeID }
                                  )
                                : '-'
                              }
                            </Typography>
                          </Box>
                        }
                      />

                      <Box sx={{ textAlign: 'right', ml: 1 }}>
                        <Typography
                          variant={isSmallMobile ? "body2" : "subtitle2"}
                          fontWeight="bold"
                          sx={{ 
                            color: getTransactionColor(tx.type),
                            fontSize: { xs: '0.85rem', sm: '0.875rem' }
                          }}
                        >
                          {getAmountPrefix(tx.type)}{formatCurrency(tx.amount, displayCurrency)}
                        </Typography>
                        
                        {/* Show original currency on mobile if different */}
                        {showCurrencyDifference && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {isSmallMobile ? tx.currency : `Orig: ${tx.currency}`}
                          </Typography>
                        )}
                        
                        <IconButton size="small" sx={{ opacity: 0.7, mt: 0.5 }}>
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </ListItem>

                    {/* Enhanced Expanded Details - Mobile Optimized */}
                    <Collapse in={isExpanded}>
                      <Paper sx={{ 
                        mx: { xs: 1, sm: 2 },
                        mb: 1,
                        p: { xs: 1.5, sm: 2 }, 
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider'
                      }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Detail Transaksi
                        </Typography>
                        
                        {isMobile ? (
                          /* Mobile: Stacked Layout */
                          <Stack spacing={1}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                ID & Tipe:
                              </Typography>
                              <Typography variant="body2">
                                {tx.id} • {tx.type.toUpperCase()}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Jumlah:
                              </Typography>
                              <Typography variant="body2">
                                {formatCurrency(tx.amount, tx.currency)} 
                                {showCurrencyDifference && (
                                  <Typography component="span" variant="caption" color="text.secondary">
                                    {' ≈ ' + formatCurrency(tx.amount, displayCurrency)}
                                  </Typography>
                                )}
                              </Typography>
                            </Box>
                            
                            {tx.category && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Kategori:
                                </Typography>
                                <Typography variant="body2">{tx.category}</Typography>
                              </Box>
                            )}
                          </Stack>
                        ) : (
                          /* Desktop: Grid Layout */
                          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                <strong>ID:</strong> {tx.id}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                <strong>Tipe:</strong> {tx.type.toUpperCase()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                <strong>Mata Uang:</strong> {txCurrency}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                <strong>Jumlah Asli:</strong> {formatCurrency(tx.amount, tx.currency)}
                              </Typography>
                              {showCurrencyDifference && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  <strong>Tampilan:</strong> {formatCurrency(tx.amount, displayCurrency)}
                                </Typography>
                              )}
                              {tx.category && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  <strong>Kategori:</strong> {tx.category}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                        
                        {tx.notes && (
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              <strong>Catatan:</strong>
                            </Typography>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                wordBreak: 'break-word'
                              }}
                            >
                              {tx.notes}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Collapse>
                    
                    {index < filteredTransactions.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          </>
        )}

        {/* Enhanced Footer - Mobile Friendly */}
        {filteredTransactions.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box 
              display="flex" 
              flexDirection={isSmallMobile ? 'column' : 'row'}
              justifyContent="space-between" 
              alignItems={isSmallMobile ? 'stretch' : 'center'}
              gap={1}
            >
              <Typography variant="caption" color="text.secondary">
                Menampilkan dalam {displayCurrency}
                {isSmallMobile && ` • ${filteredTransactions.length}/${transactions.length} transaksi`}
              </Typography>
              
              <Link to="/history" style={{ textDecoration: 'none' }}>
                <Chip 
                  label={isSmallMobile ? "Lihat Semua" : "Lihat Semua Transaksi"} 
                  color="primary" 
                  size="small"
                  clickable
                  icon={<ViewIcon />}
                  sx={{ 
                    width: isSmallMobile ? '100%' : 'auto',
                    '& .MuiChip-label': {
                      px: isSmallMobile ? 2 : 1
                    }
                  }}
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