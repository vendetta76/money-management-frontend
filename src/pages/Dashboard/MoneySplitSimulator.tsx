import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Chip,
  Alert,
  Collapse,
  Divider,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  InputAdornment,
  useTheme,
  alpha,
  Slide,
  Fade
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon,
  Refresh as RefreshIcon,
  DragIndicator as DragIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  AutoAwesome as AutoIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculateIcon,
  AttachMoney as MoneyIcon,
  Analytics as AnalyticsIcon
} from "@mui/icons-material";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatCurrency } from "../helpers/formatCurrency";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

interface Category {
  id: string;
  name: string;
  percent: number;
  color?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface SortableItemProps {
  id: string;
  item: Category;
  onChange: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
  isOverLimit: boolean;
  total: number;
  selectedCurrency: string;
}

// Sortable Item Component
function SortableItem({ id, item, onChange, onRemove, isOverLimit, total, selectedCurrency }: SortableItemProps) {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    transition: { duration: 250, easing: "ease" }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      elevation={isDragging ? 8 : 2}
      sx={{
        p: 2,
        mb: 2,
        border: isOverLimit ? `2px solid ${theme.palette.error.main}` : 'none',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            label="Nama Kategori"
            value={item.name}
            onChange={(e) => onChange(id, "name", e.target.value)}
            error={isOverLimit}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Persentase"
            value={item.percent}
            onChange={(e) => onChange(id, "percent", parseFloat(e.target.value) || 0)}
            error={isOverLimit}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Prioritas</InputLabel>
            <Select
              value={item.priority || 'medium'}
              label="Prioritas"
              onChange={(e) => onChange(id, "priority", e.target.value)}
            >
              <MenuItem value="high">Tinggi</MenuItem>
              <MenuItem value="medium">Sedang</MenuItem>
              <MenuItem value="low">Rendah</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Typography variant="body2" color="textSecondary" align="center">
            <strong>{formatCurrency((total * item.percent) / 100, selectedCurrency)}</strong>
          </Typography>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <Chip
              size="small"
              label={item.priority || 'medium'}
              sx={{
                bgcolor: alpha(priorityColors[item.priority || 'medium'], 0.1),
                color: priorityColors[item.priority || 'medium'],
                mr: 1
              }}
            />
            <Tooltip title="Hapus Kategori">
              <IconButton
                size="small"
                color="error"
                onClick={() => onRemove(id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Box
              {...listeners}
              sx={{
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                '&:active': { cursor: 'grabbing' }
              }}
            >
              <Tooltip title="Drag untuk mengubah urutan">
                <IconButton size="small">
                  <DragIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {item.description && (
        <Box mt={1}>
          <Typography variant="caption" color="textSecondary">
            {item.description}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

// Main Component
export default function MoneySplitAdvanced() {
  const theme = useTheme();
  const availableCurrencies = ["IDR", "USD", "EUR", "THB", "SGD", "JPY", "GBP"];
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [total, setTotal] = useState(0);
  
  // Enhanced state management
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem("moneySplitCategories");
    return saved
      ? JSON.parse(saved)
      : [
          { id: "1", name: "Tabungan Darurat", percent: 20, priority: 'high', description: 'Dana darurat 6 bulan pengeluaran' },
          { id: "2", name: "Investasi Jangka Panjang", percent: 20, priority: 'high', description: 'Saham, reksadana, crypto' },
          { id: "3", name: "Kebutuhan Pokok", percent: 50, priority: 'high', description: 'Makanan, transportasi, utilitas' },
          { id: "4", name: "Hiburan & Gaya Hidup", percent: 10, priority: 'medium', description: 'Rekreasi, hobi, shopping' },
        ];
  });

  const [prevCategories, setPrevCategories] = useState<Category[] | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);

  const totalPercent = categories.reduce((sum, item) => sum + item.percent, 0);
  const isOverLimit = totalPercent !== 100;
  const isUnderLimit = totalPercent < 100;
  const remaining = 100 - totalPercent;

  // Load saved templates
  useEffect(() => {
    const saved = localStorage.getItem("moneySplitTemplates");
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem("moneySplitCategories", JSON.stringify(categories));
  }, [categories]);

  const handleChange = (id: string, field: string, value: any) => {
    const updated = categories.map((cat) =>
      cat.id === id
        ? { ...cat, [field]: value }
        : cat
    );
    setPrevCategories(categories);
    setCategories(updated);
  };

  const handleAdd = () => {
    setPrevCategories(categories);
    const newCategory: Category = {
      id: Date.now().toString(),
      name: "Kategori Baru",
      percent: Math.max(0, remaining),
      priority: 'medium',
      description: ''
    };
    setCategories([...categories, newCategory]);
  };

  const handleRemove = (id: string) => {
    setPrevCategories(categories);
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const handleReset = () => {
    setPrevCategories(categories);
    setCategories([]);
  };

  const handleUndo = () => {
    if (prevCategories) {
      setCategories(prevCategories);
      setPrevCategories(null);
    }
  };

  const handleDragEnd = ({ active, over }: any) => {
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    setPrevCategories(categories);
    setCategories(arrayMove(categories, oldIndex, newIndex));
  };

  // New advanced features
  const autoBalance = () => {
    if (categories.length === 0) return;
    
    const evenSplit = Math.floor(100 / categories.length);
    const remainder = 100 % categories.length;
    
    const updated = categories.map((cat, index) => ({
      ...cat,
      percent: evenSplit + (index < remainder ? 1 : 0)
    }));
    
    setPrevCategories(categories);
    setCategories(updated);
    showSnackbar("Persentase berhasil diseimbangkan secara otomatis!");
  };

  const applyRecommendedSplit = (type: '50-30-20' | '60-20-20' | 'aggressive-save') => {
    setPrevCategories(categories);
    
    let newCategories: Category[] = [];
    
    switch (type) {
      case '50-30-20':
        newCategories = [
          { id: "1", name: "Kebutuhan Pokok", percent: 50, priority: 'high', description: 'Makanan, sewa, utilitas' },
          { id: "2", name: "Keinginan & Hiburan", percent: 30, priority: 'medium', description: 'Hobi, rekreasi, shopping' },
          { id: "3", name: "Tabungan & Investasi", percent: 20, priority: 'high', description: 'Dana darurat dan investasi' },
        ];
        break;
      case '60-20-20':
        newCategories = [
          { id: "1", name: "Kebutuhan Pokok", percent: 60, priority: 'high', description: 'Pengeluaran wajib sehari-hari' },
          { id: "2", name: "Tabungan", percent: 20, priority: 'high', description: 'Dana darurat dan tabungan' },
          { id: "3", name: "Investasi", percent: 20, priority: 'high', description: 'Investasi jangka panjang' },
        ];
        break;
      case 'aggressive-save':
        newCategories = [
          { id: "1", name: "Kebutuhan Pokok", percent: 40, priority: 'high', description: 'Pengeluaran minimal' },
          { id: "2", name: "Tabungan Darurat", percent: 30, priority: 'high', description: 'Dana darurat 12 bulan' },
          { id: "3", name: "Investasi Agresif", percent: 25, priority: 'high', description: 'Saham, crypto, startup' },
          { id: "4", name: "Hiburan Minimal", percent: 5, priority: 'low', description: 'Hiburan terbatas' },
        ];
        break;
    }
    
    setCategories(newCategories);
    showSnackbar(`Template ${type} berhasil diterapkan!`);
  };

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    
    const template = {
      id: Date.now().toString(),
      name: templateName,
      categories: categories,
      createdAt: new Date().toISOString()
    };
    
    const updatedTemplates = [...savedTemplates, template];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem("moneySplitTemplates", JSON.stringify(updatedTemplates));
    
    setSaveDialogOpen(false);
    setTemplateName("");
    showSnackbar("Template berhasil disimpan!");
  };

  const loadTemplate = (template: any) => {
    setPrevCategories(categories);
    setCategories(template.categories);
    showSnackbar(`Template "${template.name}" berhasil dimuat!`);
  };

  const exportData = () => {
    const result = {
      currency: selectedCurrency,
      total: total,
      categories: categories.map((cat) => ({
        name: cat.name,
        percentage: cat.percent,
        priority: cat.priority,
        description: cat.description,
        amount: (total * cat.percent) / 100,
        formatted: formatCurrency((total * cat.percent) / 100, selectedCurrency)
      })),
      summary: {
        totalPercentage: totalPercent,
        isBalanced: totalPercent === 100,
        totalAmount: total,
        exportedAt: new Date().toISOString()
      }
    };
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `money-split-${selectedCurrency}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setExportDialogOpen(false);
    showSnackbar("Data berhasil diekspor!");
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const result = categories.map((cat) => {
    const value = (total * cat.percent) / 100;
    return { ...cat, value, name: cat.name, percent: cat.percent };
  });

  const pieData = categories.map((cat, index) => ({
    name: cat.name,
    value: cat.percent,
    color: theme.palette.primary.main
  }));

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  return (
    <Card elevation={3} sx={{ maxWidth: '100%', mx: 'auto', mt: 4 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <CalculateIcon color="primary" />
            <Typography variant="h5" component="h1" fontWeight="bold">
              Money Split Simulator Pro
            </Typography>
            <Chip label="Enhanced" color="primary" size="small" />
          </Box>
        }
        subheader="Bagi uang Anda dengan bijak menggunakan strategi keuangan terpercaya"
        action={
          <Box display="flex" gap={1}>
            <Tooltip title="Tips & Panduan">
              <IconButton onClick={() => setShowTips(!showTips)} color="info">
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Pengaturan Lanjutan">
              <IconButton onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Simpan Template">
              <IconButton onClick={() => setSaveDialogOpen(true)} color="success">
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ekspor Data">
              <IconButton onClick={() => setExportDialogOpen(true)} disabled={!selectedCurrency}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      <CardContent>
        {/* Tips Section */}
        <Collapse in={showTips}>
          <Alert severity="info" sx={{ mb: 3 }} action={
            <IconButton size="small" onClick={() => setShowTips(false)}>
              ✕
            </IconButton>
          }>
            <Typography variant="subtitle2" gutterBottom>
              💡 Tips Pembagian Uang yang Ideal:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  <strong>Rule 50/30/20:</strong><br />
                  50% Kebutuhan, 30% Keinginan, 20% Tabungan
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  <strong>Conservative 60/20/20:</strong><br />
                  60% Kebutuhan, 20% Tabungan, 20% Investasi
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  <strong>Aggressive Saving:</strong><br />
                  40% Kebutuhan, 30% Tabungan, 25% Investasi, 5% Hiburan
                </Typography>
              </Grid>
            </Grid>
          </Alert>
        </Collapse>

        {/* Template Quick Actions */}
        <Collapse in={showAdvancedOptions}>
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              🚀 Template Cepat
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyRecommendedSplit('50-30-20')}
                startIcon={<TrendingUpIcon />}
              >
                50/30/20 Rule
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyRecommendedSplit('60-20-20')}
                startIcon={<TrendingUpIcon />}
              >
                60/20/20 Conservative
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyRecommendedSplit('aggressive-save')}
                startIcon={<TrendingUpIcon />}
              >
                Aggressive Saving
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={autoBalance}
                startIcon={<AutoIcon />}
                disabled={categories.length === 0}
              >
                Auto Balance
              </Button>
            </Box>
            
            {/* Saved Templates */}
            {savedTemplates.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  📋 Template Tersimpan
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {savedTemplates.map((template) => (
                    <Chip
                      key={template.id}
                      label={template.name}
                      onClick={() => loadTemplate(template)}
                      onDelete={() => {
                        const updated = savedTemplates.filter(t => t.id !== template.id);
                        setSavedTemplates(updated);
                        localStorage.setItem("moneySplitTemplates", JSON.stringify(updated));
                      }}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Collapse>

        {/* Currency and Total Input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="currency-label">Mata Uang</InputLabel>
              <Select
                labelId="currency-label"
                value={selectedCurrency}
                label="Mata Uang"
                onChange={(e) => {
                  setSelectedCurrency(e.target.value);
                  setTotal(0);
                }}
                startAdornment={<MoneyIcon />}
              >
                {availableCurrencies.map((cur) => (
                  <MenuItem key={cur} value={cur}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MoneyIcon fontSize="small" />
                      {cur}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedCurrency && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`Total Uang (${selectedCurrency})`}
                value={formatCurrency(total, selectedCurrency)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setTotal(Number(raw));
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          )}
        </Grid>

        {selectedCurrency && (
          <>
            {/* Status Indicator */}
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Kategori & Alokasi
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  label={`Total: ${totalPercent}%`}
                  color={totalPercent === 100 ? 'success' : totalPercent > 100 ? 'error' : 'warning'}
                  icon={totalPercent === 100 ? <span>✅</span> : totalPercent > 100 ? <span>⚠️</span> : <span>📊</span>}
                />
                {remaining !== 0 && (
                  <Chip
                    label={`${remaining > 0 ? 'Sisa' : 'Lebih'}: ${Math.abs(remaining)}%`}
                    color={remaining > 0 ? 'info' : 'error'}
                    size="small"
                  />
                )}
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(totalPercent, 100)}
                color={totalPercent === 100 ? 'success' : totalPercent > 100 ? 'error' : 'primary'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Alerts */}
            {isOverLimit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Persentase total melebihi 100%. Silakan kurangi beberapa kategori.
              </Alert>
            )}
            
            {isUnderLimit && totalPercent > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Masih ada sisa {remaining}% yang belum dialokasikan.
              </Alert>
            )}

            {totalPercent === 100 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ Perfect! Semua uang telah teralokasi dengan baik.
              </Alert>
            )}

            {/* Drag and Drop Categories */}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((cat) => (
                  <SortableItem
                    key={cat.id}
                    id={cat.id}
                    item={cat}
                    onChange={handleChange}
                    onRemove={handleRemove}
                    isOverLimit={isOverLimit}
                    total={total}
                    selectedCurrency={selectedCurrency}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Action Buttons */}
            <Box display="flex" flexWrap="wrap" gap={2} sx={{ mt: 3, mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                color="success"
              >
                Tambah Kategori
              </Button>
              <Button
                variant="outlined"
                startIcon={<UndoIcon />}
                onClick={handleUndo}
                disabled={!prevCategories}
              >
                Undo
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                color="error"
              >
                Reset Semua
              </Button>
            </Box>

            {/* Results */}
            {result.length > 0 && totalPercent === 100 && (
              <Fade in={true}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    📊 Hasil Pembagian
                  </Typography>
                  
                  {/* Pie Chart */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Paper elevation={2} sx={{ p: 2, height: 300 }}>
                        <Typography variant="subtitle1" align="center" gutterBottom>
                          Visualisasi Pembagian
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, value }) => `${name}: ${value}%`}
                            >
                              {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Paper elevation={2} sx={{ p: 2, height: 300, overflow: 'auto' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Detail Alokasi
                        </Typography>
                        {result.map((cat, idx) => (
                          <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight="bold">
                                {cat.name}
                              </Typography>
                              <Chip
                                label={`${cat.percent}%`}
                                size="small"
                                color="primary"
                              />
                            </Box>
                            <Typography variant="h6" color="primary.main" sx={{ mt: 1 }}>
                              {formatCurrency(cat.value, selectedCurrency)}
                            </Typography>
                            {cat.description && (
                              <Typography variant="caption" color="text.secondary">
                                {cat.description}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}
          </>
        )}

        {/* Dialogs */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
          <DialogTitle>Ekspor Data Pembagian Uang</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Data akan diekspor dalam format JSON yang bisa digunakan untuk backup atau import ke aplikasi lain.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Batal</Button>
            <Button onClick={exportData} variant="contained" startIcon={<DownloadIcon />}>
              Ekspor
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
          <DialogTitle>Simpan Template</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nama Template"
              fullWidth
              variant="outlined"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Contoh: Template Konservatif"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)}>Batal</Button>
            <Button 
              onClick={saveTemplate} 
              variant="contained" 
              disabled={!templateName.trim()}
              startIcon={<SaveIcon />}
            >
              Simpan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </CardContent>
    </Card>
  );
}