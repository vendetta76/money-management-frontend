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
  Snackbar,
  Switch,
  FormControlLabel,
  Badge,
  InputAdornment,
  useTheme,
  useMediaQuery,
  alpha,
  Slide,
  Fade,
  Stack
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
  Analytics as AnalyticsIcon,
  Close as CloseIcon
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
  isMobile?: boolean;
}

// Mobile-Friendly Sortable Item Component
function SortableItem({ id, item, onChange, onRemove, isOverLimit, total, selectedCurrency, isMobile }: SortableItemProps) {
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(false);
  
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

  if (isMobile) {
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
        }}
      >
        {/* Mobile: Compact Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>
            {item.name || 'Kategori'}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={0.5}>
            <Chip
              size="small"
              label={`${item.percent}%`}
              color={isOverLimit ? 'error' : 'primary'}
              variant="filled"
            />
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Amount Display */}
        <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
          {formatCurrency((total * item.percent) / 100, selectedCurrency)}
        </Typography>

        {/* Priority Chip */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={expanded ? 2 : 0}>
          <Chip
            size="small"
            label={item.priority === 'high' ? 'Tinggi' : item.priority === 'medium' ? 'Sedang' : 'Rendah'}
            sx={{
              bgcolor: alpha(priorityColors[item.priority || 'medium'], 0.1),
              color: priorityColors[item.priority || 'medium'],
            }}
          />
          
          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(id)}
            >
              <DeleteIcon />
            </IconButton>
            <Box {...listeners} sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
              <IconButton size="small">
                <DragIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Expandable Edit Form */}
        <Collapse in={expanded}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nama Kategori"
              value={item.name}
              onChange={(e) => onChange(id, "name", e.target.value)}
              error={isOverLimit}
            />
            
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                type="number"
                label="Persentase"
                value={item.percent}
                onChange={(e) => onChange(id, "percent", parseFloat(e.target.value) || 0)}
                error={isOverLimit}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
                sx={{ flex: 1 }}
              />
              
              <FormControl size="small" sx={{ flex: 1 }}>
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
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Deskripsi (opsional)"
              value={item.description || ''}
              onChange={(e) => onChange(id, "description", e.target.value)}
              multiline
              rows={2}
            />
          </Stack>
        </Collapse>
      </Paper>
    );
  }

  // Desktop version (original layout)
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
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  // Template functions (simplified for mobile)
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

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const result = categories.map((cat) => {
    const value = (total * cat.percent) / 100;
    return { ...cat, value, name: cat.name, percent: cat.percent };
  });

  return (
    <Card elevation={3} sx={{ maxWidth: '100%', mx: 'auto', mt: 4 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <CalculateIcon color="primary" />
            <Typography variant={isSmallMobile ? "h6" : "h5"} component="h1" fontWeight="bold">
              {isSmallMobile ? "Money Split" : "Money Split Simulator Pro"}
            </Typography>
            <Chip label="Enhanced" color="primary" size="small" />
          </Box>
        }
        subheader={
          <Typography variant="body2" sx={{ mt: 1 }}>
            {isSmallMobile ? "Bagi uang dengan bijak" : "Bagi uang Anda dengan bijak menggunakan strategi keuangan terpercaya"}
          </Typography>
        }
        action={
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {!isSmallMobile && (
              <Tooltip title="Tips & Panduan">
                <IconButton onClick={() => setShowTips(!showTips)} color="info" size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Template">
              <IconButton onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} size="small">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Mobile Tips */}
        {isMobile && (
          <Collapse in={showTips}>
            <Alert severity="info" sx={{ mb: 2 }} 
              action={
                <IconButton size="small" onClick={() => setShowTips(false)}>
                  <CloseIcon />
                </IconButton>
              }
            >
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                💡 Template Populer:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="caption">
                  <strong>50/30/20:</strong> 50% Kebutuhan, 30% Keinginan, 20% Tabungan
                </Typography>
                <Typography variant="caption">
                  <strong>60/20/20:</strong> 60% Kebutuhan, 20% Tabungan, 20% Investasi
                </Typography>
              </Stack>
            </Alert>
          </Collapse>
        )}

        {/* Template Quick Actions - Mobile Optimized */}
        <Collapse in={showAdvancedOptions}>
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              🚀 Template Cepat
            </Typography>
            
            {isMobile ? (
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => applyRecommendedSplit('50-30-20')}
                  startIcon={<TrendingUpIcon />}
                  fullWidth
                >
                  50/30/20 Rule
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => applyRecommendedSplit('60-20-20')}
                  startIcon={<TrendingUpIcon />}
                  fullWidth
                >
                  60/20/20 Conservative
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => applyRecommendedSplit('aggressive-save')}
                  startIcon={<TrendingUpIcon />}
                  fullWidth
                >
                  Aggressive Saving
                </Button>
              </Stack>
            ) : (
              <Box display="flex" flexWrap="wrap" gap={1}>
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
              </Box>
            )}
          </Paper>
        </Collapse>

        {/* Currency and Total Input - Mobile Friendly */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            {/* Status Indicator - Mobile Optimized */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} gap={1} mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Kategori & Alokasi
                </Typography>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip
                    label={`Total: ${totalPercent}%`}
                    color={totalPercent === 100 ? 'success' : totalPercent > 100 ? 'error' : 'warning'}
                    icon={totalPercent === 100 ? <span>✅</span> : totalPercent > 100 ? <span>⚠️</span> : <span>📊</span>}
                    size={isSmallMobile ? 'small' : 'medium'}
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
              <LinearProgress
                variant="determinate"
                value={Math.min(totalPercent, 100)}
                color={totalPercent === 100 ? 'success' : totalPercent > 100 ? 'error' : 'primary'}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
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
                    isMobile={isMobile}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Action Buttons - Mobile Optimized */}
            <Box sx={{ mt: 3, mb: 4 }}>
              {isMobile ? (
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    color="success"
                    fullWidth
                  >
                    Tambah Kategori
                  </Button>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={<UndoIcon />}
                      onClick={handleUndo}
                      disabled={!prevCategories}
                      sx={{ flex: 1 }}
                    >
                      Undo
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleReset}
                      color="error"
                      sx={{ flex: 1 }}
                    >
                      Reset
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={2}>
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
              )}
            </Box>

            {/* Results - Mobile Optimized */}
            {result.length > 0 && totalPercent === 100 && (
              <Fade in={true}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    📊 Hasil Pembagian
                  </Typography>
                  
                  {/* Results List for Mobile */}
                  {isMobile ? (
                    <Stack spacing={2}>
                      {result.map((cat, idx) => (
                        <Paper key={idx} elevation={1} sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {cat.name}
                            </Typography>
                            <Chip
                              label={`${cat.percent}%`}
                              size="small"
                              color="primary"
                            />
                          </Box>
                          <Typography variant="h6" color="primary.main">
                            {formatCurrency(cat.value, selectedCurrency)}
                          </Typography>
                          {cat.description && (
                            <Typography variant="caption" color="text.secondary">
                              {cat.description}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    /* Desktop Results with Chart */
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={2} sx={{ p: 2, height: 300 }}>
                          <Typography variant="subtitle1" align="center" gutterBottom>
                            Visualisasi Pembagian
                          </Typography>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={result}
                                dataKey="percent"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, percent }) => `${name}: ${percent}%`}
                              >
                                {result.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
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
                  )}
                </Box>
              </Fade>
            )}
          </>
        )}

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