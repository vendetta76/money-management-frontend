// src/pages/AuditLogs.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Toolbar,
  Stack,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  Download,
  Visibility,
  Security,
  Person,
  AccountBalanceWallet,
  Receipt,
  Settings,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Delete,
  Edit,
  Add,
  Login,
  Logout,
  History,
} from '@mui/icons-material';

// Types
interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  userId: number;
  action: string;
  target: string;
  targetType: 'User' | 'Wallet' | 'Transaction' | 'System' | 'Settings';
  status: 'Success' | 'Failed' | 'Warning';
  ipAddress: string;
  userAgent: string;
  details?: string;
}

// Mock data
const initialLogs: AuditLog[] = [
  {
    id: 1,
    timestamp: '2024-05-26 14:30:25',
    user: 'Admin User',
    userId: 1,
    action: 'User Created',
    target: 'john.doe@example.com',
    targetType: 'User',
    status: 'Success',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 124.0.0.0',
    details: 'New user account created with Premium role'
  },
  {
    id: 2,
    timestamp: '2024-05-26 14:25:15',
    user: 'Staff User',
    userId: 2,
    action: 'Wallet Balance Updated',
    target: 'Main Wallet (#1234)',
    targetType: 'Wallet',
    status: 'Success',
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox 125.0.1',
    details: 'Balance adjusted from $1,200.00 to $1,500.00'
  },
  {
    id: 3,
    timestamp: '2024-05-26 14:20:10',
    user: 'Admin User',
    userId: 1,
    action: 'Transaction Deleted',
    target: 'Transaction #12345',
    targetType: 'Transaction',
    status: 'Success',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 124.0.0.0',
    details: 'Duplicate transaction removed: $250.00 grocery payment'
  },
  {
    id: 4,
    timestamp: '2024-05-26 14:15:45',
    user: 'System',
    userId: 0,
    action: 'Failed Login Attempt',
    target: 'admin@example.com',
    targetType: 'System',
    status: 'Failed',
    ipAddress: '203.0.113.195',
    userAgent: 'Unknown',
    details: 'Multiple failed login attempts detected'
  },
  {
    id: 5,
    timestamp: '2024-05-26 14:10:30',
    user: 'Admin User',
    userId: 1,
    action: 'Settings Updated',
    target: 'System Configuration',
    targetType: 'Settings',
    status: 'Success',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 124.0.0.0',
    details: 'Max wallets per user changed from 5 to 10'
  },
  {
    id: 6,
    timestamp: '2024-05-26 13:55:20',
    user: 'Staff User',
    userId: 2,
    action: 'User Login',
    target: 'jane.smith@example.com',
    targetType: 'User',
    status: 'Success',
    ipAddress: '192.168.1.102',
    userAgent: 'Safari 17.4.1',
    details: 'Successful login from mobile device'
  },
  {
    id: 7,
    timestamp: '2024-05-26 13:50:15',
    user: 'System',
    userId: 0,
    action: 'Backup Completed',
    target: 'Database Backup',
    targetType: 'System',
    status: 'Success',
    ipAddress: 'Internal',
    userAgent: 'System Process',
    details: 'Daily database backup completed successfully'
  },
  {
    id: 8,
    timestamp: '2024-05-26 13:45:10',
    user: 'Admin User',
    userId: 1,
    action: 'Wallet Locked',
    target: 'Business Wallet (#5678)',
    targetType: 'Wallet',
    status: 'Warning',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 124.0.0.0',
    details: 'Wallet locked due to suspicious activity'
  }
];

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action.includes(actionFilter);
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    const matchesTargetType = targetTypeFilter === 'All' || log.targetType === targetTypeFilter;
    
    return matchesSearch && matchesAction && matchesStatus && matchesTargetType;
  });

  // Get action icon
  const getActionIcon = (action: string) => {
    if (action.includes('Created') || action.includes('Add')) return <Add />;
    if (action.includes('Updated') || action.includes('Edit')) return <Edit />;
    if (action.includes('Deleted') || action.includes('Remove')) return <Delete />;
    if (action.includes('Login')) return <Login />;
    if (action.includes('Logout')) return <Logout />;
    if (action.includes('Settings')) return <Settings />;
    if (action.includes('User')) return <Person />;
    if (action.includes('Wallet')) return <AccountBalanceWallet />;
    if (action.includes('Transaction')) return <Receipt />;
    return <Info />;
  };

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Success':
        return { color: 'success', icon: <CheckCircle /> };
      case 'Failed':
        return { color: 'error', icon: <ErrorIcon /> };
      case 'Warning':
        return { color: 'warning', icon: <Warning /> };
      default:
        return { color: 'default', icon: <Info /> };
    }
  };

  // Export logs
  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Target', 'Type', 'Status', 'IP Address', 'Details'],
      ...filteredLogs.map(log => [
        log.timestamp, log.user, log.action, log.target, log.targetType, 
        log.status, log.ipAddress, log.details || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-logs.csv';
    a.click();
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value.split(' ')[1]}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.value.split(' ')[0]}
          </Typography>
        </Box>
      )
    },
    {
      field: 'user',
      headerName: 'User',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24 }}>
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getActionIcon(params.value)}
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'target',
      headerName: 'Target',
      width: 200
    },
    {
      field: 'targetType',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const config = getStatusConfig(params.value);
        return (
          <Chip
            label={params.value}
            color={config.color as any}
            size="small"
            icon={config.icon}
          />
        );
      }
    },
    {
      field: 'ipAddress',
      headerName: 'IP Address',
      width: 130
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="View Details">
              <Visibility />
            </Tooltip>
          }
          label="View"
          onClick={() => console.log('View details:', params.row)}
        />
      ]
    }
  ];

  const renderTimeline = () => (
    <Card>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Activity Timeline
        </Typography>
        <Timeline>
          {filteredLogs.slice(0, 10).map((log, index) => (
            <TimelineItem key={log.id}>
              <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="textSecondary">
                {log.timestamp.split(' ')[1]}
                <br />
                <Typography variant="caption">
                  {log.timestamp.split(' ')[0]}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={getStatusConfig(log.status).color as any}>
                  {getActionIcon(log.action)}
                </TimelineDot>
                {index < filteredLogs.slice(0, 10).length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {log.action}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    by {log.user}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Target: {log.target}
                  </Typography>
                  {log.details && (
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      {log.details}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip label={log.targetType} size="small" variant="outlined" />
                    <Chip 
                      label={log.status} 
                      size="small" 
                      color={getStatusConfig(log.status).color as any}
                    />
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Audit Logs
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('timeline')}
          >
            Timeline View
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <Toolbar>
          <Stack direction="row" spacing={2} sx={{ width: '100%', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search logs..."
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
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={actionFilter}
                label="Action"
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <MenuItem value="All">All Actions</MenuItem>
                <MenuItem value="Created">Created</MenuItem>
                <MenuItem value="Updated">Updated</MenuItem>
                <MenuItem value="Deleted">Deleted</MenuItem>
                <MenuItem value="Login">Login</MenuItem>
                <MenuItem value="Settings">Settings</MenuItem>
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
                <MenuItem value="Success">Success</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
                <MenuItem value="Warning">Warning</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={targetTypeFilter}
                label="Type"
                onChange={(e) => setTargetTypeFilter(e.target.value)}
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Wallet">Wallet</MenuItem>
                <MenuItem value="Transaction">Transaction</MenuItem>
                <MenuItem value="System">System</MenuItem>
                <MenuItem value="Settings">Settings</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Toolbar>
      </Card>

      {/* Content */}
      {viewMode === 'table' ? (
        <Card>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredLogs}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 }
                }
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              checkboxSelection
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Box>
        </Card>
      ) : (
        renderTimeline()
      )}
    </Box>
  );
};

export default AuditLogs;