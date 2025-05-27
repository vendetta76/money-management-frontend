// src/pages/Wallets.tsx
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
  Avatar,
  Toolbar
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Edit,
  Delete,
  Lock,
  LockOpen,
  AccountBalanceWallet,
  Circle
} from '@mui/icons-material';

// Types
interface Wallet {
  id: number;
  name: string;
  owner: string;
  ownerId: number;
  balance: number;
  currency: string;
  status: 'Active' | 'Locked' | 'Archived';
  color: string;
  createdAt: string;
}

// Mock data
const initialWallets: Wallet[] = [
  {
    id: 1,
    name: 'Main Wallet',
    owner: 'John Doe',
    ownerId: 1,
    balance: 12450.50,
    currency: 'USD',
    status: 'Active',
    color: '#1976d2',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Savings Account',
    owner: 'Jane Smith',
    ownerId: 2,
    balance: 8234.75,
    currency: 'USD',
    status: 'Active',
    color: '#2e7d32',
    createdAt: '2024-02-10'
  },
  {
    id: 3,
    name: 'Business Wallet',
    owner: 'Bob Johnson',
    ownerId: 3,
    balance: 45678.90,
    currency: 'USD',
    status: 'Locked',
    color: '#d32f2f',
    createdAt: '2024-01-20'
  },
  {
    id: 4,
    name: 'Investment Fund',
    owner: 'Alice Brown',
    ownerId: 4,
    balance: 23456.25,
    currency: 'EUR',
    status: 'Active',
    color: '#7b1fa2',
    createdAt: '2024-03-05'
  },
  {
    id: 5,
    name: 'Emergency Fund',
    owner: 'Charlie Wilson',
    ownerId: 5,
    balance: 5000.00,
    currency: 'USD',
    status: 'Archived',
    color: '#ed6c02',
    createdAt: '2024-02-28'
  }
];

const mockUsers = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Bob Johnson' },
  { id: 4, name: 'Alice Brown' },
  { id: 5, name: 'Charlie Wilson' }
];

const colorOptions = [
  { value: '#1976d2', label: 'Blue' },
  { value: '#2e7d32', label: 'Green' },
  { value: '#d32f2f', label: 'Red' },
  { value: '#7b1fa2', label: 'Purple' },
  { value: '#ed6c02', label: 'Orange' },
  { value: '#1565c0', label: 'Dark Blue' }
];

const WalletManagement: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ownerId: 0,
    balance: 0,
    currency: 'USD',
    status: 'Active' as Wallet['status'],
    color: '#1976d2'
  });

  // Filter wallets based on search term
  const filteredWallets = wallets.filter(wallet =>
    wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle dialog open/close
  const handleOpenDialog = (wallet?: Wallet) => {
    if (wallet) {
      setSelectedWallet(wallet);
      setFormData({
        name: wallet.name,
        ownerId: wallet.ownerId,
        balance: wallet.balance,
        currency: wallet.currency,
        status: wallet.status,
        color: wallet.color
      });
    } else {
      setSelectedWallet(null);
      setFormData({
        name: '',
        ownerId: 0,
        balance: 0,
        currency: 'USD',
        status: 'Active',
        color: '#1976d2'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWallet(null);
  };

  // Handle form submission
  const handleSubmit = () => {
    const ownerName = mockUsers.find(user => user.id === formData.ownerId)?.name || '';
    
    if (selectedWallet) {
      // Update existing wallet
      setWallets(wallets.map(wallet =>
        wallet.id === selectedWallet.id
          ? { 
              ...wallet, 
              ...formData,
              owner: ownerName
            }
          : wallet
      ));
    } else {
      // Create new wallet
      const newWallet: Wallet = {
        id: Math.max(...wallets.map(w => w.id)) + 1,
        ...formData,
        owner: ownerName,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setWallets([...wallets, newWallet]);
    }
    handleCloseDialog();
  };

  // Handle wallet deletion
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      setWallets(wallets.filter(wallet => wallet.id !== id));
    }
  };

  // Handle status toggle
  const handleToggleStatus = (id: number) => {
    setWallets(wallets.map(wallet =>
      wallet.id === id
        ? { 
            ...wallet, 
            status: wallet.status === 'Locked' ? 'Active' : 'Locked'
          }
        : wallet
    ));
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Wallet',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Circle sx={{ color: params.row.color, fontSize: 16 }} />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ID: {params.row.id}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'owner',
      headerName: 'Owner',
      width: 180
    },
    {
      field: 'balance',
      headerName: 'Balance',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {formatCurrency(params.row.balance, params.row.currency)}
        </Typography>
      )
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 100
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Active' ? 'success' :
            params.value === 'Locked' ? 'error' : 'default'
          }
          size="small"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 130
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={params.row.status === 'Locked' ? <LockOpen /> : <Lock />}
          label={params.row.status === 'Locked' ? 'Unlock' : 'Lock'}
          onClick={() => handleToggleStatus(params.row.id)}
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Wallet Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Create Wallet
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ p: 2, minWidth: 200 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AccountBalanceWallet />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {wallets.filter(w => w.status === 'Active').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Wallets
              </Typography>
            </Box>
          </Box>
        </Card>
        
        <Card sx={{ p: 2, minWidth: 200 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <AccountBalanceWallet />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {formatCurrency(
                  wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
                  'USD'
                )}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Balance
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <Toolbar>
          <TextField
            placeholder="Search wallets..."
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
        </Toolbar>
      </Card>

      {/* Wallets Table */}
      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredWallets}
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

      {/* Wallet Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedWallet ? 'Edit Wallet' : 'Create New Wallet'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Wallet Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>Owner</InputLabel>
              <Select
                value={formData.ownerId}
                label="Owner"
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value as number })}
              >
                {mockUsers.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Initial Balance"
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                label="Currency"
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="JPY">JPY</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Wallet['status'] })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Locked">Locked</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Color Theme</InputLabel>
              <Select
                value={formData.color}
                label="Color Theme"
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                renderValue={(value) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Circle sx={{ color: value, fontSize: 16 }} />
                    {colorOptions.find(option => option.value === value)?.label}
                  </Box>
                )}
              >
                {colorOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Circle sx={{ color: option.value, fontSize: 16 }} />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedWallet ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletManagement;