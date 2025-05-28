// src/pages/admin/SecurityManagement.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Chip,
  TextField,
  Tab,
  Tabs,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Security,
  Shield,
  Lock,
  VpnKey,
  Warning,
  Block,
  CheckCircle,
  Error,
  Add,
  Delete,
  Edit,
  Visibility,
  LocationOn,
  Computer,
  Phone,
  BugReport,
  Report,
  Timeline,
  Assessment,
  Person,
  AdminPanelSettings,
  VerifiedUser,
  GppBad,
  GppGood,
  Key,
  Fingerprint,
  ScreenLockPortrait,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface SecurityAlert {
  id: number;
  type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'malware' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  userId?: number;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
}

interface LoginAttempt {
  id: number;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  email: string;
  status: 'success' | 'failed' | 'blocked';
  reason?: string;
  location: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

interface ActiveSession {
  id: string;
  userId: number;
  userName: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  loginTime: string;
  lastActivity: string;
  isCurrentSession: boolean;
}

interface BugReport {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  component: string;
  reproducible: boolean;
}

interface IPWhitelistEntry {
  id: number;
  ipAddress: string;
  description: string;
  addedBy: string;
  addedAt: string;
  isActive: boolean;
}

const SecurityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true);
  const [openAddIPDialog, setOpenAddIPDialog] = useState(false);
  const [openBugReportDialog, setOpenBugReportDialog] = useState(false);

  // Sample data
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: 1,
      type: 'failed_login',
      severity: 'high',
      title: 'Multiple Failed Login Attempts',
      description: 'User attempted to login 10 times with incorrect password',
      timestamp: '2024-05-26 10:30:00',
      ipAddress: '203.0.113.45',
      userId: 1234,
      status: 'investigating',
      assignedTo: 'Security Team'
    },
    {
      id: 2,
      type: 'suspicious_activity',
      severity: 'critical',
      title: 'Unusual Transaction Pattern',
      description: 'Large volume of transactions from new device',
      timestamp: '2024-05-26 09:15:00',
      ipAddress: '198.51.100.23',
      userId: 5678,
      status: 'active'
    }
  ]);

  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([
    {
      id: 1,
      timestamp: '2024-05-26 10:30:15',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 124.0.0.0',
      email: 'john@example.com',
      status: 'success',
      location: 'New York, USA',
      deviceType: 'desktop'
    },
    {
      id: 2,
      timestamp: '2024-05-26 10:25:42',
      ipAddress: '203.0.113.45',
      userAgent: 'Unknown',
      email: 'admin@example.com',
      status: 'failed',
      reason: 'Invalid password',
      location: 'Unknown',
      deviceType: 'desktop'
    }
  ]);

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: 'sess_123',
      userId: 1,
      userName: 'John Doe',
      ipAddress: '192.168.1.100',
      location: 'New York, USA',
      device: 'Windows 11',
      browser: 'Chrome 124.0',
      loginTime: '2024-05-26 08:30:00',
      lastActivity: '2024-05-26 10:25:00',
      isCurrentSession: true
    },
    {
      id: 'sess_456',
      userId: 2,
      userName: 'Jane Smith',
      ipAddress: '10.0.0.15',
      location: 'California, USA',
      device: 'iPhone 15',
      browser: 'Safari 17.4',
      loginTime: '2024-05-26 09:15:00',
      lastActivity: '2024-05-26 10:20:00',
      isCurrentSession: false
    }
  ]);

  const [bugReports, setBugReports] = useState<BugReport[]>([
    {
      id: 1,
      title: 'Login form validation bypass',
      description: 'Users can bypass email validation by modifying DOM',
      severity: 'high',
      status: 'in_progress',
      reportedBy: 'Security Researcher',
      reportedAt: '2024-05-25 14:30:00',
      assignedTo: 'Dev Team',
      component: 'Authentication',
      reproducible: true
    },
    {
      id: 2,
      title: 'XSS vulnerability in comments',
      description: 'Script injection possible in transaction descriptions',
      severity: 'critical',
      status: 'open',
      reportedBy: 'QA Team',
      reportedAt: '2024-05-26 09:45:00',
      component: 'Transaction System',
      reproducible: true
    }
  ]);

  const [ipWhitelist, setIpWhitelist] = useState<IPWhitelistEntry[]>([
    {
      id: 1,
      ipAddress: '192.168.1.0/24',
      description: 'Office Network',
      addedBy: 'Admin',
      addedAt: '2024-05-20 10:00:00',
      isActive: true
    },
    {
      id: 2,
      ipAddress: '10.0.0.0/16',
      description: 'VPN Network',
      addedBy: 'Security Team',
      addedAt: '2024-05-21 15:30:00',
      isActive: true
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': case 'resolved': return 'success';
      case 'failed': case 'active': case 'open': return 'error';
      case 'blocked': case 'investigating': case 'in_progress': return 'warning';
      default: return 'default';
    }
  };

  const terminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const resolveAlert = (alertId: number) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
    ));
  };

  const addIPToWhitelist = (ip: string, description: string) => {
    const newEntry: IPWhitelistEntry = {
      id: Date.now(),
      ipAddress: ip,
      description,
      addedBy: 'Admin',
      addedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      isActive: true
    };
    setIpWhitelist(prev => [...prev, newEntry]);
    setOpenAddIPDialog(false);
  };

  const loginAttemptColumns: GridColDef[] = [
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value.split(' ')[1]}
        </Typography>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200
    },
    {
      field: 'ipAddress',
      headerName: 'IP Address',
      width: 130
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      )
    },
    {
      field: 'deviceType',
      headerName: 'Device',
      width: 100,
      renderCell: (params) => {
        const icon = params.value === 'desktop' ? <Computer /> : 
                    params.value === 'mobile' ? <Phone /> : <Computer />;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="body2">{params.value}</Typography>
          </Box>
        );
      }
    }
  ];

  const renderSecurityOverview = () => (
    <Grid container spacing={3}>
      {/* Security Metrics */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Security Status</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                    <Shield />
                  </Avatar>
                  <Typography variant="h4">98.5%</Typography>
                  <Typography variant="body2" color="textSecondary">Security Score</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                    <Warning />
                  </Avatar>
                  <Typography variant="h4">3</Typography>
                  <Typography variant="body2" color="textSecondary">Active Alerts</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                    <Timeline />
                  </Avatar>
                  <Typography variant="h4">1,247</Typography>
                  <Typography variant="body2" color="textSecondary">Active Sessions</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                    <Block />
                  </Avatar>
                  <Typography variant="h4">45</Typography>
                  <Typography variant="body2" color="textSecondary">Blocked IPs</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Security Settings */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Security Settings</Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  />
                }
                label="Two-Factor Authentication"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={ipWhitelistEnabled}
                    onChange={(e) => setIpWhitelistEnabled(e.target.checked)}
                  />
                }
                label="IP Whitelisting"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={securityAlertsEnabled}
                    onChange={(e) => setSecurityAlertsEnabled(e.target.checked)}
                  />
                }
                label="Real-time Security Alerts"
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Security Alerts */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Security Alerts</Typography>
            <List>
              {securityAlerts.slice(0, 5).map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: getSeverityColor(alert.severity) + '.main',
                        width: 40, 
                        height: 40 
                      }}>
                        <Warning />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.title}
                      secondary={
                        <Box>
                          <Typography variant="body2">{alert.description}</Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={alert.severity} size="small" color={getSeverityColor(alert.severity) as any} />
                            <Chip label={alert.status} size="small" color={getStatusColor(alert.status) as any} />
                            <Chip label={alert.ipAddress} size="small" variant="outlined" />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => resolveAlert(alert.id)}
                        disabled={alert.status === 'resolved'}
                      >
                        Resolve
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < securityAlerts.slice(0, 5).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLoginAttempts = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Login Attempt Monitoring</Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={loginAttempts}
            columns={loginAttemptColumns}
            pageSizeOptions={[10, 25]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </CardContent>
    </Card>
  );

  const renderSessionManagement = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Active Sessions</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Device & Location</TableCell>
                <TableCell>Login Time</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{session.userName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {session.userId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{session.device}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {session.location} • {session.ipAddress}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{session.loginTime}</TableCell>
                  <TableCell>{session.lastActivity}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => terminateSession(session.id)}
                      disabled={session.isCurrentSession}
                    >
                      {session.isCurrentSession ? 'Current' : 'Terminate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderIPWhitelist = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">IP Whitelist Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddIPDialog(true)}
          >
            Add IP Address
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>IP Address/Range</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Added Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ipWhitelist.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {entry.ipAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.addedBy}</TableCell>
                  <TableCell>{entry.addedAt.split(' ')[0]}</TableCell>
                  <TableCell>
                    <Chip 
                      label={entry.isActive ? 'Active' : 'Inactive'}
                      color={entry.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add IP Dialog */}
        <Dialog open={openAddIPDialog} onClose={() => setOpenAddIPDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add IP to Whitelist</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <TextField
                label="IP Address or Range"
                placeholder="192.168.1.0/24 or 203.0.113.45"
                fullWidth
              />
              <TextField
                label="Description"
                placeholder="Office Network, VPN, etc."
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddIPDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => addIPToWhitelist('192.168.1.0/24', 'New Network')}
            >
              Add to Whitelist
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );

  const renderBugReports = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Bug Reports & Security Issues</Typography>
          <Button
            variant="contained"
            startIcon={<BugReport />}
            onClick={() => setOpenBugReportDialog(true)}
          >
            Report Bug
          </Button>
        </Box>
        
        <List>
          {bugReports.map((bug, index) => (
            <React.Fragment key={bug.id}>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ 
                    bgcolor: getSeverityColor(bug.severity) + '.main',
                    width: 40, 
                    height: 40 
                  }}>
                    <BugReport />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={bug.title}
                  secondary={
                    <Box>
                      <Typography variant="body2">{bug.description}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={bug.severity} size="small" color={getSeverityColor(bug.severity) as any} />
                        <Chip label={bug.status} size="small" color={getStatusColor(bug.status) as any} />
                        <Chip label={bug.component} size="small" variant="outlined" />
                        {bug.reproducible && <Chip label="Reproducible" size="small" color="warning" />}
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        Reported by {bug.reportedBy} on {bug.reportedAt}
                        {bug.assignedTo && ` • Assigned to ${bug.assignedTo}`}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < bugReports.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* Bug Report Dialog */}
        <Dialog open={openBugReportDialog} onClose={() => setOpenBugReportDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Report Security Bug</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <TextField
                label="Bug Title"
                placeholder="Brief description of the issue"
                fullWidth
              />
              
              <TextField
                label="Detailed Description"
                multiline
                rows={4}
                placeholder="Provide detailed steps to reproduce the issue"
                fullWidth
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Severity</InputLabel>
                    <Select defaultValue="medium" label="Severity">
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Component</InputLabel>
                    <Select defaultValue="" label="Component">
                      <MenuItem value="Authentication">Authentication</MenuItem>
                      <MenuItem value="Transaction System">Transaction System</MenuItem>
                      <MenuItem value="User Management">User Management</MenuItem>
                      <MenuItem value="API">API</MenuItem>
                      <MenuItem value="Frontend">Frontend</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <FormControlLabel
                control={<Switch />}
                label="I can reproduce this issue consistently"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBugReportDialog(false)}>Cancel</Button>
            <Button variant="contained" color="error" startIcon={<Report />}>
              Submit Bug Report
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Security Management
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<Shield />} label="Overview" />
          <Tab icon={<Timeline />} label="Login Attempts" />
          <Tab icon={<ScreenLockPortrait />} label="Sessions" />
          <Tab icon={<VpnKey />} label="IP Whitelist" />
          <Tab icon={<BugReport />} label="Bug Reports" />
        </Tabs>
      </Paper>

      {activeTab === 0 && renderSecurityOverview()}
      {activeTab === 1 && renderLoginAttempts()}
      {activeTab === 2 && renderSessionManagement()}
      {activeTab === 3 && renderIPWhitelist()}
      {activeTab === 4 && renderBugReports()}
    </Box>
  );
};

export default SecurityManagement;