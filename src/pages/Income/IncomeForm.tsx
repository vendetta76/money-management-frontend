import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebaseClient";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  increment,
  arrayUnion,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Paper,
  Divider,
  Chip,
  Stack,
  FormHelperText,
  InputAdornment,
  Fade,
  Slide,
} from "@mui/material";
import {
  Save as SaveIcon,
  Add as AddIcon,
  Cancel as CancelIcon,
  AccountBalanceWallet as WalletIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { formatCurrency } from "../helpers/formatCurrency";
import { getCardStyle } from "../helpers/getCardStyle";
import { WalletEntry, IncomeEntry } from "../helpers/types";

interface IncomeFormProps {
  hideCardPreview?: boolean;
  presetWalletId?: string;
  onClose?: () => void;
  editingEntry?: IncomeEntry | null;
  onEditComplete?: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ 
  presetWalletId, 
  onClose, 
  hideCardPreview, 
  editingEntry, 
  onEditComplete 
}) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [form, setForm] = useState({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const descriptionRef = useRef<HTMLInputElement>(null);

  // Handle editing existing entry
  useEffect(() => {
    if (editingEntry) {
      setEditingId(editingEntry.id);
      
      const formattedAmount = editingEntry.amount.toLocaleString('id-ID', {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      
      setForm({
        wallet: editingEntry.wallet,
        description: editingEntry.description,
        amount: formattedAmount,
        currency: editingEntry.currency
      });
    } else {
      setEditingId(null);
      setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
    }
  }, [editingEntry, presetWalletId]);

  useEffect(() => {
    if (!user) return;
    
    const walletRef = collection(db, "users", user.uid, "wallets");
    
    const unsubWallets = onSnapshot(walletRef, (snap) => {
      const allWallets = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WalletEntry[];
      
      const activeWallets = allWallets.filter(w => {
        if (!w.name || w.name.trim() === '' || w.id.startsWith('_')) {
          return false;
        }
        
        const isArchived = w.status === "archived" || 
                          w.status === "deleted" || 
                          w.status === "inactive" ||
                          w.isArchived === true ||
                          w.deleted === true ||
                          w.active === false;
        
        return !isArchived;
      });
      
      setWallets(activeWallets);
      
      if (form.wallet && !activeWallets.find(w => w.id === form.wallet)) {
        setForm(prev => ({ ...prev, wallet: "", currency: "" }));
        if (presetWalletId === form.wallet) {
          setSnackbar({ open: true, message: "Dompet yang dipilih sudah dihapus atau diarsipkan.", severity: "error" });
          if (onClose) onClose();
        }
      }
    });
    
    const incomeRef = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const unsubIncomes = onSnapshot(incomeRef, (snap) => {
      setIncomes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IncomeEntry[]);
    });
    
    return () => {
      unsubWallets();
      unsubIncomes();
    };
  }, [user, form.wallet, presetWalletId, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "amount") {
      let cleaned = value.replace(/[^0-9.,]/g, "");
      
      const parts = cleaned.split(",");
      if (parts.length > 2) {
        cleaned = parts[0] + "," + parts.slice(1).join("").replace(/,/g, "");
      }
      
      const numberWithoutSeparator = parts[0].replace(/\./g, "");
      
      let formattedInteger = "";
      if (numberWithoutSeparator.length > 0) {
        formattedInteger = numberWithoutSeparator.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }
      
      const finalValue = parts.length > 1 
        ? formattedInteger + "," + parts[1] 
        : formattedInteger;
        
      setForm({ ...form, amount: finalValue });
    } else {
      setForm({ ...form, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
  };

  const handleWalletChange = (value: string) => {
    const selected = wallets.find((w) => w.id === value);
    setForm({
      ...form,
      wallet: value,
      currency: selected?.currency || "",
    });
    setErrors({ ...errors, wallet: "", currency: "" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.wallet.trim()) e.wallet = "Dompet wajib dipilih.";
    if (!form.description.trim()) e.description = "Deskripsi wajib diisi.";
    if (!form.amount.trim() || parseFloat(form.amount.replace(/\./g, "").replace(",", ".")) <= 0) 
      e.amount = "Nominal harus lebih dari 0.";
    if (!form.currency.trim()) e.currency = "Mata uang wajib dipilih.";
    
    if (form.wallet && !wallets.find(w => w.id === form.wallet)) {
      e.wallet = "Dompet sudah dihapus atau diarsipkan.";
    }
    
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (!user) return;

    const selectedWallet = wallets.find(w => w.id === form.wallet);
    if (!selectedWallet) {
      setSnackbar({ open: true, message: "Dompet sudah dihapus atau diarsipkan.", severity: "error" });
      return;
    }

    setLoading(true);

    try {
      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors({ amount: "Nominal harus lebih dari 0." });
        setLoading(false);
        return;
      }

      if (!editingId) {
        const incomeData = {
          amount: parsedAmount,
          description: form.description,
          wallet: form.wallet,
          currency: form.currency,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "users", user.uid, "incomes"), incomeData);
        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(parsedAmount),
        });
        setSnackbar({ open: true, message: "Pemasukan berhasil disimpan!", severity: "success" });
      } else {
        const old = incomes.find((i) => i.id === editingId);
        if (!old) return;
        await updateDoc(doc(db, "users", user.uid, "incomes", editingId), {
          description: form.description,
          amount: parsedAmount,
          wallet: form.wallet,
          currency: form.currency,
          editHistory: arrayUnion({
            description: old.description,
            amount: old.amount,
            editedAt: new Date(),
          }),
        });
        const diff = parsedAmount - old.amount;
        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(diff),
        });
        setSnackbar({ open: true, message: "Pemasukan berhasil diperbarui!", severity: "success" });
      }

      setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: form.currency });
      setEditingId(null);
      
      if (editingId && onEditComplete) {
        onEditComplete();
      }
      
      if (onClose) onClose();
    } catch (err) {
      setSnackbar({ open: true, message: "Gagal menyimpan data. Silakan coba lagi.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAndContinue = async () => {
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (!user) return;

    const selectedWallet = wallets.find(w => w.id === form.wallet);
    if (!selectedWallet) {
      setSnackbar({ open: true, message: "Dompet sudah dihapus atau diarsipkan.", severity: "error" });
      return;
    }

    setLoading(true);

    try {
      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors({ amount: "Nominal harus lebih dari 0." });
        setLoading(false);
        return;
      }

      const incomeData = {
        amount: parsedAmount,
        description: form.description,
        wallet: form.wallet,
        currency: form.currency,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "users", user.uid, "incomes"), incomeData);
      await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
        balance: increment(parsedAmount),
      });

      setForm({ wallet: form.wallet, description: "", amount: "", currency: form.currency });
      setTimeout(() => descriptionRef.current?.focus(), 50);
      setSnackbar({ open: true, message: "Pemasukan disimpan! Siap untuk entri berikutnya.", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Gagal menyimpan data. Silakan coba lagi.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedWallet = () => {
    if (!form.wallet) return null;
    return wallets.find((w) => w.id === form.wallet) || null;
  };

  const resetForm = () => {
    setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
    setEditingId(null);
    setErrors({});
    if (onEditComplete) onEditComplete();
    if (onClose) onClose();
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1}>
              <WalletIcon color="primary" />
              <Typography variant="h6" component="h2">
                {editingId ? "Edit Pemasukan" : "Tambah Pemasukan"}
              </Typography>
              {editingId && <Chip label="Edit Mode" color="primary" size="small" />}
            </Box>

            {/* Wallet Selection */}
            <FormControl fullWidth error={!!errors.wallet}>
              <InputLabel>Pilih Dompet</InputLabel>
              <Select
                value={form.wallet}
                label="Pilih Dompet"
                onChange={(e) => handleWalletChange(e.target.value)}
                disabled={!!presetWalletId || loading}
                startAdornment={
                  <InputAdornment position="start">
                    <WalletIcon />
                  </InputAdornment>
                }
              >
                {wallets.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <Typography>{w.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(w.balance || 0, w.currency)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.wallet && <FormHelperText>{errors.wallet}</FormHelperText>}
            </FormControl>

            {/* Wallet Card Preview */}
            {form.wallet && !hideCardPreview && (
              <Fade in={!!form.wallet}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${getSelectedWallet()?.color || '#1976d2'} 0%, ${getSelectedWallet()?.color || '#1976d2'}99 100%)`,
                    color: 'white'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    {getSelectedWallet()?.name}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" mt={0.5}>
                    {formatCurrency(getSelectedWallet()?.balance || 0, form.currency)}
                  </Typography>
                </Paper>
              </Fade>
            )}

            {/* Description */}
            <TextField
              ref={descriptionRef}
              name="description"
              label="Deskripsi"
              value={form.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              fullWidth
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Amount */}
            <TextField
              name="amount"
              label="Nominal"
              value={form.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
              fullWidth
              disabled={loading}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9.,]*"
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Currency Display */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">
                Mata Uang: <strong>{form.currency || "Akan otomatis terisi"}</strong>
              </Typography>
            </Paper>

            <Divider />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="space-between">
              {editingId && (
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={resetForm}
                  disabled={loading}
                  color="inherit"
                >
                  Batal Edit
                </Button>
              )}

              <Stack direction="row" spacing={1} ml="auto">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                  disabled={loading}
                  size="large"
                >
                  {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
                </Button>

                {!editingId && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
                    disabled={loading}
                    onClick={handleAddAndContinue}
                    size="large"
                  >
                    Simpan & Lanjut
                  </Button>
                )}
              </Stack>
            </Stack>
          </Stack>
        </form>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          TransitionComponent={Slide}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity as "success" | "error"}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default IncomeForm;