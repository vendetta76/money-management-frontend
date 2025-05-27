import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Paper
} from '@mui/material';
import {
  People,
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Person
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data
const statsData = [
  {
    title: 'Total Users',
    value: '12,547',
    change: '+12%',
    changeType: 'increase',
    icon: People,
    color: '#1976d2'
  },
  {
    title: 'Total Wallets',
    value: '8,234',
    change: '+8%',
    changeType: 'increase',
    icon: AccountBalanceWallet,
    color: '#2e7d32'
  },
  {
    title: 'Total Income',
    value: '$1,234,567',
    change: '+15%',
    changeType: 'increase',
    icon: TrendingUp,
    color: '#ed6c02'
  },
  {
    title: 'Total Outcome',
    value: '$987,654',
    change: '-3%',
    changeType: 'decrease',
    icon: TrendingDown,
    color: '#d32f2f'
  }
];

const weeklyData = [
  { name: 'Mon', income: 4000, outcome: 2400 },
  { name: 'Tue', income: 3000, outcome: 1398 },
  { name: 'Wed', income: 2000, outcome: 9800 },
  { name: 'Thu', income: 2780, outcome: 3908 },
  { name: 'Fri', income: 1890, outcome: 4800 },
  { name: 'Sat', income: 2390, outcome: 3800 },
  { name: 'Sun', income: 3490, outcome: 4300 }
];

const topUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', wallets: 5, status: 'Premium' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', wallets: 3, status: 'Regular' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', wallets: 4, status: 'Staff' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', wallets: 2, status: 'Premium' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', wallets: 6, status: 'Regular' }
];

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: stat.changeType === 'increase' ? 'success.main' : 'error.main',
                        mt: 1
                      }}
                    >
                      {stat.change} from last week
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    <stat.icon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Weekly Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Income vs Outcome Trend
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#2e7d32" 
                      strokeWidth={2}
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outcome" 
                      stroke="#d32f2f" 
                      strokeWidth={2}
                      name="Outcome"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Users */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Active Users
              </Typography>
              <List>
                {topUsers.map((user, index) => (
                  <ListItem key={user.id} divider={index < topUsers.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Typography variant="body2">
                            {user.wallets} wallets
                          </Typography>
                          <Chip 
                            label={user.status} 
                            size="small"
                            color={
                              user.status === 'Premium' ? 'primary' :
                              user.status === 'Staff' ? 'secondary' : 'default'
                            }
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <List>
                {[1, 2, 3, 4, 5].map((item) => (
                  <ListItem key={item} divider>
                    <ListItemText
                      primary={`Transaction #${1000 + item}`}
                      secondary={`User payment - $${(Math.random() * 1000).toFixed(2)}`}
                    />
                    <Typography variant="body2" color="textSecondary">
                      2 hours ago
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Database</Typography>
                  <Chip label="Online" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Payment Gateway</Typography>
                  <Chip label="Online" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Email Service</Typography>
                  <Chip label="Online" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Backup System</Typography>
                  <Chip label="Warning" color="warning" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;