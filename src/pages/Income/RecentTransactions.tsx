import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { IncomeEntry, WalletEntry } from "../helpers/types";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  Pagination,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  Fade,
  Skeleton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import { formatCurrency } from "../helpers/formatCurrency";

interface RecentTransactionsProps {
  onEdit?: (entry: IncomeEntry) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onEdit }) => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; entry: IncomeEntry | null }>({
    open: false,
    entry: null
  });
  const itemsPerPage = 5;
  const totalPages = Math.ceil(incomes.length / itemsPerPage);
  const paginatedIncomes = incomes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    
    const q = query(
      collection(db, "users", user.uid, "incomes"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setIncomes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IncomeEntry[]);
      setLoading(false);
    });
    
    const walletRef = collection(db, "users", user.uid, "wallets");
    const unsubWallets = onSnapshot(walletRef, (snap) => {
      setWallets(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WalletEntry[]);
    });
    
    return () => {
      unsub();
      unsubWallets();
    };
  }, [user]);

  const getWalletName = (id: string) =>
    wallets.find((w) => w.id === id)?.name || "Dompet tidak ditemukan";

  const getWalletColor = (id: string) =>
    wallets.find((w) => w.id === id)?.color || "#1976d2";

  const handleDelete = async () => {
    if (!user || !deleteDialog.entry) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "incomes", deleteDialog.entry.id));
      await updateDoc(doc(db, "users", user.uid, "wallets", deleteDialog.entry.wallet), {
        balance: increment(-deleteDialog.entry.amount),
      });
      setDeleteDialog({ open: false, entry: null });
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  const handleEdit = (entry: IncomeEntry) => {
    if (onEdit) {
      onEdit(entry);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Transaksi Terbaru
          </Typography>
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 3, borderRadius: 2 }} elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUpIcon color="success" />
          <Typography variant="h6" component="h3">
            Transaksi Terbaru
          </Typography>
          {incomes.length > 0 && (
            <Chip 
              label={`${incomes.length} transaksi`} 
              size="small" 
              color="success" 
              variant="outlined" 
            />
          )}
        </Box>

        {incomes.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            py={4}
            sx={{ opacity: 0.6 }}
          >
            <TrendingUpIcon sx={{ fontSize: 48, mb: 1 }} color="disabled" />
            <Typography variant="body1" color="text.secondary">
              Belum ada pemasukan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transaksi pemasukan akan muncul di sini
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ p: 0 }}>
              {paginatedIncomes.map((entry, index) => (
                <Fade in key={entry.id} timeout={300 + index * 100}>
                  <Box>
                    <ListItem
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateY(-1px)',
                          boxShadow: 1,
                        },
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleExpand(entry.id)}
                    >
                      <Avatar
                        sx={{
                          bgcolor: getWalletColor(entry.wallet),
                          mr: 2,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <WalletIcon />
                      </Avatar>

                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {entry.description}
                            </Typography>
                            <Chip
                              label={getWalletName(entry.wallet)}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: getWalletColor(entry.wallet),
                                color: getWalletColor(entry.wallet),
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <CalendarIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(entry.createdAt?.toDate?.() ?? entry.createdAt).toLocaleDateString("id-ID", {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        }
                      />

                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography 
                          variant="h6" 
                          color="success.main" 
                          fontWeight="bold"
                          sx={{ mr: 1 }}
                        >
                          {formatCurrency(entry.amount, entry.currency)}
                        </Typography>

                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit transaksi">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(entry);
                              }}
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'primary.light', color: 'white' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Hapus transaksi">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog({ open: true, entry });
                              }}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': { bgcolor: 'error.light', color: 'white' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(entry.id);
                            }}
                          >
                            {expandedId === entry.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Stack>
                      </Box>
                    </ListItem>

                    <Collapse in={expandedId === entry.id} timeout="auto" unmountOnExit>
                      <Box sx={{ px: 2, pb: 2 }}>
                        <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                          <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Detail:</strong> {entry.description}
                            </Typography>
                            {entry.editHistory && entry.editHistory.length > 0 && (
                              <Box mt={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Riwayat Edit: {entry.editHistory.length} perubahan
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                    </Collapse>

                    {index < paginatedIncomes.length - 1 && <Divider sx={{ my: 0.5 }} />}
                  </Box>
                </Fade>
              ))}
            </List>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  size="medium"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, entry: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <DeleteIcon color="error" />
              Hapus Transaksi
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Yakin ingin menghapus transaksi "{deleteDialog.entry?.description}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Nominal: {deleteDialog.entry && formatCurrency(deleteDialog.entry.amount, deleteDialog.entry.currency)}
            </Typography>
            <Typography variant="body2" color="error.main" mt={2}>
              Tindakan ini tidak dapat dibatalkan.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog({ open: false, entry: null })}
              color="inherit"
            >
              Batal
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              Hapus
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;