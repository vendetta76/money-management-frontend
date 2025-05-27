// src/pages/Transactions.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  InputAdornment,
  Toolbar,
  Stack,
  Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Edit,
  Delete,
  Download,
  FilterList,
  TrendingUp,
  TrendingDown,
  Receipt
} from '@mui/icons-material';

// Types
interface Transaction {
  id: number;
  user: string;
  userId: number;
  wallet: string;
  walletId: number;
  type: 'Income' | 'Outcome';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

// Mock data
const initialTransactions: Transaction[] = [
  {
    id: 1,
    user: 'John Doe',
    userId: 1,
    wallet: 'Main Wallet',
    walletId: 1,
    type: 'Income',
    amount: 1200.00,
    description: 'Monthly Salary',
    category: 'Salary',
    date: '2024-05-26',
    status: 'Completed'
  },
  {
    id: 2,
    user: 'Jane Smith',
    userId: 2,
    wallet: 'Savings Account',
    walletId: 2,
    type: 'Outcome',
    amount: 300.50,
    description: 'Grocery Shopping',
    category: 'Food',
    date: '2024-05-25',
    status: 'Completed'
  },
  {
    id: 3,
    user: 'Alice Brown',
    userId: 4,
    wallet: 'Investment Fund',
    walletId: 4,
    type: 'Income',
    amount: 500.00,
    description: 'Dividend Payment',
    category: 'Investment',
    date: '2024-05-24',
    status: 'Completed'
  },
  {
    id: 4,
    user: 'Bob Johnson',
    userId: 3,
    wallet: 'Business Wallet',
    walletId: 3,
    type: 'Outcome',
    amount: 2400.00,
    description: 'Office Rent',
    category: 'Business',
    date: '2024-05-23',
    status: 'Pending'
  },
  {
    id: 5,
    user: 'Charlie Wilson',
    userId: 5,
    wallet: 'Emergency Fund',
    walletId: 5,
    type: 'Outcome',
    amount: 150.00,
    description: 'Medical Bills',
    category: 'Healthcare',
    date: '2024-05-22',
    status: 'Failed'
  }
];

const mockUsers = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Bob Johnson' },
  { id: 4, name: 'Alice Brown' },
  { id: 5, name: 'Charlie Wilson' }
];

const mockWallets = [
  { id: 1, name: 'Main Wallet', userId: 1 },
  { id: 2, name: 'Savings Account', userId: 2 },
  { id: 3, name: 'Business Wallet', userId: 3 },
  { id: 4, name: 'Investment Fund', userId: 4 },
  { id: 5, name: 'Emergency Fund', userId: 5 }
];

const categories = ['Salary', 'Food', 'Investment', 'Business', 'Healthcare', 'Transportation', 'Entertainment', 'Utilities'];

const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    userId: 0,
    walletId: 0,
    type: 'Income' as Transaction['type'],
    amount: 0,
    description: '',
    category: '',
    date: new Date(),
    status: 'Completed' as Transaction['status']
  });

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || transaction.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const totalIncome = transactions
    .filter(t => t.type === 'Income' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalOutcome = transactions
    .filter(t => t.type === 'Outcome' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Handle dialog open/close
  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setSelectedTransaction(transaction);
      setFormData({
        userId: transaction.userId,
        walletId: transaction.walletId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: new Date(transaction.date),
        status: transaction.status
      });
    } else {
      setSelectedTransaction(null);
      setFormData({
        userId: 0,
        walletId: 0,
        type: 'Income',
        amount: 0,
        description: '',
        category: '',
        date: new Date(),
        status: 'Completed'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  // Handle form submission
  const handleSubmit = () => {
    const userName = mockUsers.find(user => user.id === formData.userId)?.name || '';
    const walletName = mockWallets.find(wallet => wallet.id === formData.walletId)?.name || '';
    
    if (selectedTransaction) {
      // Update existing transaction
      setTransactions(transactions.map(transaction =>
        transaction.id === selectedTransaction.id
          ? { 
              ...transaction, 
              ...formData,
              user: userName,
              wallet: walletName,
              date: formData.date.toISOString().split('T')[0]
            }
          : transaction
      ));
    } else {
      // Create new transaction
      const newTransaction: Transaction = {
        id: Math.max(...transactions.map(t => t.id)) + 1,
        ...formData,
        user: userName,
        wallet: walletName,
        date: formData.date.toISOString().split('T')[0]
      };
      setTransactions([...transactions, newTransaction]);
    }
    handleCloseDialog();
  };

  // Handle transaction deletion
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(transaction => transaction.id !== id));
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ['ID', 'User', 'Wallet', 'Type', 'Amount', 'Description', 'Category', 'Date', 'Status'],
      ...filteredTransactions.map(t => [
        t.id, t.user, t.wallet, t.type, t.amount, t.description, t.category, t.date, t.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80
    },
    {
      field: 'user',
      headerName: 'User',
      width: 150
    },
    {
      field: 'wallet',
      headerName: 'Wallet',
      width: 150
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Income' ? 'success' : 'error'}
          size="small"
          icon={params.value === 'Income' ? <TrendingUp /> : <TrendingDown />}
        />
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          fontWeight="bold"
          color={params.row.type === 'Income' ? 'success.main' : 'error.main'}
        >
          {formatCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 120
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Completed' ? 'success' :
            params.value === 'Pending' ? 'warning' : 'error'
          }
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />
      ]
    }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Transaction Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Transaction
            </Button>
          </Stack>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ p: 2, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(totalIncome)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Income
                </Typography>
              </Box>
            </Box>
          </Card>
          
          <Card sx={{ p: 2, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <TrendingDown />
              </Avatar>
              <Box>
                <Typography variant="h6" color="error.main">
                  {formatCurrency(totalOutcome)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Outcome
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 2, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Receipt />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {transactions.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Transactions
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <Toolbar>
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <TextField
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 300 }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="All">All Types</MenuItem>
                  <MenuItem value="Income">Income</MenuItem>
                  <MenuItem value="Outcome">Outcome</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Toolbar>
        </Card>

        {/* Transactions Table */}
        <Card>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredTransactions}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 }
                }
              }}
              pageSizeOptions={[5, 10, 25]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>
        </Card>

        {/* Transaction Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={formData.userId}
                  label="User"
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value as number })}
                >
                  {mockUsers.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Wallet</InputLabel>
                <Select
                  value={formData.walletId}
                  label="Wallet"
                  onChange={(e) => setFormData({ ...formData, walletId: e.target.value as number })}
                >
                  {mockWallets
                    .filter(wallet => wallet.userId === formData.userId)
                    .map(wallet => (
                      <MenuItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Transaction['type'] })}
                >
                  <MenuItem value="Income">Income</MenuItem>
                  <MenuItem value="Outcome">Outcome</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => newValue && setFormData({ ...formData, date: newValue })}
                slotProps={{ textField: { fullWidth: true } }}
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Transaction['status'] })}
                >
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedTransaction ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TransactionManagement;