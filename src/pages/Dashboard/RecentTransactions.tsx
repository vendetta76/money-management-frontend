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
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  InputAdornment,
  Badge,
  Tooltip,
  Menu,
  Paper,
  Stack,
  LinearProgress,
  Alert,
  Fade,
  Zoom,
  useTheme,
  alpha
} from "@mui/material";
import {
  TrendingUp as IncomeIcon,
  TrendingDown as OutcomeIcon,
  SwapHoriz as TransferIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Visibility as ViewIcon,
  Category as CategoryIcon,
  AccessTime as TimeIcon,
  AccountBalanceWallet as WalletIcon,
  StickyNote2 as NotesIcon,
  MoreVert as MoreIcon,
  TrendingFlat as NeutralIcon,
  Analytics as AnalyticsIcon,
  CalendarToday as CalendarIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { id as localeID } from "date-fns/locale";

interface Transaction {
  id: string;
  type: 'income' | 'outcome' | 'transfer';
  description: string;
  amount: number;
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
}

type SortBy = 'date' | 'amount' | 'name' | 'type';
type FilterBy = 'all' | 'income' | 'outcome' | 'transfer';

const formatRupiah = (amount: number): string => {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
};

const getWalletName = (walletId: string, wallets: Wallet[]): string => {
  const wallet = wallets.find((w) => w.id === walletId);
  return wallet ? wallet.name : `${walletId} (Telah dihapus)`;
};

const RecentTransactions: React.FC<Props> = ({ 
  transactions, 
  wallets, 
  isWalletsLoaded 
}) => {
  const theme = useTheme();
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Enhanced filtering and sorting
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter((tx) => tx.createdAt);

    // Apply type filter
    if (filterBy !== 'all') {
      filtered = filtered.filter((tx) => tx.type === filterBy);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tx) =>
        tx.description.toLowerCase().includes(query) ||
        tx.category?.toLowerCase().includes(query) ||
        tx.notes?.toLowerCase().includes(query) ||
        getWalletName(tx.wallet || '', wallets).toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt.seconds - a.createdAt.seconds;
        case 'amount':
          return b.amount - a.amount;
        case 'name':
          return a.description.localeCompare(b.description);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return sorted.slice(0, 10); // Show top 10
  }, [transactions, filterBy, sortBy, searchQuery, wallets]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <IncomeIcon />;
      case 'outcome':
        return <OutcomeIcon />;
      case 'transfer':
        return <TransferIcon />;
      default:
        return <NeutralIcon />;
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

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case 'income':
        return alpha(theme.palette.success.main, 0.1);
      case 'outcome':
        return alpha(theme.palette.error.main, 0.1);
      case 'transfer':
        return alpha(theme.palette.info.main, 0.1);
      default:
        return alpha(theme.palette.grey[500], 0.1);
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

  const handleTransactionClick = (tx: Transaction) => {
    setExpandedTx(expandedTx === tx.id ? null : tx.id);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, tx: Transaction) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTx(tx);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTx(null);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = filteredAndSortedTransactions.length;
    const income = filteredAndSortedTransactions.filter(tx => tx.type === 'income').length;
    const outcome = filteredAndSortedTransactions.filter(tx => tx.type === 'outcome').length;
    const transfer = filteredAndSortedTransactions.filter(tx => tx.type === 'transfer').length;
    
    return { total, income, outcome, transfer };
  }, [filteredAndSortedTransactions]);

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <AnalyticsIcon />
          </Avatar>
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              Transaksi Terbaru
            </Typography>
            <Badge badgeContent={stats.total} color="primary" max={99}>
              <Box />
            </Badge>
          </Box>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {isWalletsLoaded 
              ? `Menampilkan ${filteredAndSortedTransactions.length} dari ${transactions.length} transaksi`
              : "Memuat data..."
            }
          </Typography>
        }
        action={
          <Box display="flex" gap={1}>
            <Tooltip title="Filter & Pencarian">
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'default'}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      {/* Filter Section */}
      <Collapse in={showFilters}>
        <Box sx={{ px: 2, pb: 2 }}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Stack spacing={2}>
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
              />
              
              <Box display="flex" gap={2}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter Jenis</InputLabel>
                  <Select
                    value={filterBy}
                    label="Filter Jenis"
                    onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                  >
                    <MenuItem value="all">Semua</MenuItem>
                    <MenuItem value="income">
                      <Box display="flex" alignItems="center" gap={1}>
                        <IncomeIcon fontSize="small" />
                        Pemasukan
                      </Box>
                    </MenuItem>
                    <MenuItem value="outcome">
                      <Box display="flex" alignItems="center" gap={1}>
                        <OutcomeIcon fontSize="small" />
                        Pengeluaran
                      </Box>
                    </MenuItem>
                    <MenuItem value="transfer">
                      <Box display="flex" alignItems="center" gap={1}>
                        <TransferIcon fontSize="small" />
                        Transfer
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Urutkan</InputLabel>
                  <Select
                    value={sortBy}
                    label="Urutkan"
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                  >
                    <MenuItem value="date">
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon fontSize="small" />
                        Tanggal
                      </Box>
                    </MenuItem>
                    <MenuItem value="amount">
                      <Box display="flex" alignItems="center" gap={1}>
                        <TrendingUpIcon fontSize="small" />
                        Jumlah
                      </Box>
                    </MenuItem>
                    <MenuItem value="name">Nama</MenuItem>
                    <MenuItem value="type">Jenis</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Quick Stats */}
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={`Total: ${stats.total}`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Pemasukan: ${stats.income}`}
                  size="small" 
                  color="success"
                  variant="outlined"
                />
                <Chip 
                  label={`Pengeluaran: ${stats.outcome}`}
                  size="small" 
                  color="error"
                  variant="outlined"
                />
                <Chip 
                  label={`Transfer: ${stats.transfer}`}
                  size="small" 
                  color="info"
                  variant="outlined"
                />
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Collapse>

      <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 } }}>
        {!isWalletsLoaded ? (
          <Box sx={{ p: 3 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" align="center">
              Memuat dompet...
            </Typography>
          </Box>
        ) : filteredAndSortedTransactions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {transactions.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body2">
                  Belum ada transaksi. Mulai tambahkan transaksi pertama Anda!
                </Typography>
              </Alert>
            ) : (
              <Alert severity="warning">
                <Typography variant="body2">
                  Tidak ada transaksi yang sesuai dengan filter yang dipilih.
                </Typography>
              </Alert>
            )}
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
            {filteredAndSortedTransactions.map((tx, index) => {
              const walletName = getWalletName(tx.wallet || '', wallets);
              const isExpanded = expandedTx === tx.id;
              
              return (
                <Fade key={tx.id} in={true} timeout={300 + index * 100}>
                  <Box>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        borderLeft: `4px solid ${getTransactionColor(tx.type)}`,
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleTransactionClick(tx)}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: getTransactionBgColor(tx.type),
                            color: getTransactionColor(tx.type),
                            width: 40,
                            height: 40
                          }}
                        >
                          {getTransactionIcon(tx.type)}
                        </Avatar>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {tx.description}
                            </Typography>
                            {tx.category && (
                              <Chip 
                                label={tx.category} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <WalletIcon fontSize="small" />
                              <Typography variant="caption" color="text.secondary">
                                {tx.type === 'transfer'
                                  ? `${tx.from} → ${tx.to}`
                                  : `Dompet: ${walletName}`
                                }
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <TimeIcon fontSize="small" />
                              <Typography variant="caption" color="text.secondary">
                                {tx.createdAt?.toDate
                                  ? format(new Date(tx.createdAt.toDate()), 'dd MMM yyyy, HH:mm', { locale: localeID })
                                  : '-'
                                }
                              </Typography>
                            </Box>
                          </Stack>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Tooltip title={`Jumlah ${tx.type}`}>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{ 
                                color: getTransactionColor(tx.type),
                                minWidth: 100,
                                textAlign: 'right'
                              }}
                            >
                              {getAmountPrefix(tx.type)}{formatRupiah(tx.amount)}
                            </Typography>
                          </Tooltip>
                          
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, tx)}
                          >
                            <MoreIcon />
                          </IconButton>
                          
                          <IconButton size="small">
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>

                    {/* Expanded Details */}
                    <Collapse in={isExpanded} timeout="auto">
                      <Box sx={{ 
                        px: 3, 
                        pb: 2, 
                        bgcolor: getTransactionBgColor(tx.type),
                        borderLeft: `4px solid ${getTransactionColor(tx.type)}`
                      }}>
                        <Stack spacing={1}>
                          {tx.notes && (
                            <Box display="flex" alignItems="flex-start" gap={1}>
                              <NotesIcon fontSize="small" color="action" />
                              <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Catatan:
                                </Typography>
                                <Typography variant="body2">
                                  {tx.notes}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Chip 
                              label={`ID: ${tx.id.slice(-6)}`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              label={tx.type.toUpperCase()}
                              size="small"
                              sx={{ 
                                bgcolor: getTransactionColor(tx.type),
                                color: 'white'
                              }}
                            />
                          </Box>
                        </Stack>
                      </Box>
                    </Collapse>
                    
                    <Divider />
                  </Box>
                </Fade>
              );
            })}
          </List>
        )}

        {/* Footer */}
        {filteredAndSortedTransactions.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Menampilkan {filteredAndSortedTransactions.length} transaksi terbaru
              </Typography>
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

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Lihat Detail</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <CategoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Kategori</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default RecentTransactions;