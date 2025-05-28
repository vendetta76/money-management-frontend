// src/pages/admin/SystemManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
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
  Divider,
  Avatar,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import {
  Storage,
  Memory,
  Speed,
  CloudDownload,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Settings,
  PlayArrow,
  Stop,
  Schedule,
  Database,
  NetworkCheck,
  Security,
  BugReport,
  SystemUpdate,
  MonitorHeart,
  Backup,
  RestartAlt,
  Visibility,
  Delete,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

interface BackupJob {
  id: number;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'success' | 'failed' | 'running' | 'scheduled';
  size: string;
}

interface ErrorLog {
  id: number;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  stackTrace?: string;
  userId?: number;
  resolved: boolean;
}

const SystemManagement: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'healthy', lastUpdated: '2024-05-26 10:30:00' },
    { name: 'Memory Usage', value: 72, unit: '%', status: 'warning', lastUpdated: '2024-05-26 10:30:00' },
    { name: 'Disk Usage', value: 23, unit: '%', status: 'healthy', lastUpdated: '2024-05-26 10:30:00' },
    { name: 'Database Connections', value: 15, unit: 'active', status: 'healthy', lastUpdated: '2024-05-26 10:30:00' },
    { name: 'API Response Time', value: 245, unit: 'ms', status: 'healthy', lastUpdated: '2024-05-26 10:30:00' },
    { name: 'Active Sessions', value: 1247, unit: 'users', status: 'healthy', lastUpdated: '2024-05-26 10:30:00' }
  ]);

  const [performanceData, setPerformanceData] = useState([
    { time: '00:00', cpu: 30, memory: 65, responseTime: 200 },
    { time: '04:00', cpu: 25, memory: 60, responseTime: 180 },
    { time: '08:00', cpu: 55, memory: 75, responseTime: 320 },
    { time: '12:00', cpu: 70, memory: 80, responseTime: 450 },
    { time: '16:00', cpu: 45, memory: 70, responseTime: 280 },
    { time: '20:00', cpu: 35, memory: 68, responseTime: 220 },
  ]);

  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([
    {
      id: 1,
      name: 'Daily Full Backup',
      type: 'full',
      schedule: 'Daily at 2:00 AM',
      lastRun: '2024-05-26 02:00:00',
      nextRun: '2024-05-27 02:00:00',
      status: 'success',
      size: '2.4 GB'
    },
    {
      id: 2,
      name: 'Hourly Incremental',
      type: 'incremental',
      schedule: 'Every hour',
      lastRun: '2024-05-26 10:00:00',
      nextRun: '2024-05-26 11:00:00',
      status: 'running',
      size: '45 MB'
    }
  ]);

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([
    {
      id: 1,
      timestamp: '2024-05-26 10:25:30',
      level: 'error',
      component: 'Authentication Service',
      message: 'Failed to validate JWT token',
      userId: 1234,
      resolved: false
    },
    {
      id: 2,
      timestamp: '2024-05-26 09:45:15',
      level: 'warning',
      component: 'Database Connection Pool',
      message: 'Connection pool reaching capacity limit',
      resolved: true
    },
    {
      id: 3,
      timestamp: '2024-05-26 08:30:20',
      level: 'error',
      component: 'Payment Gateway',
      message: 'Transaction timeout after 30 seconds',
      userId: 5678,
      resolved: false
    }
  ]);

  const [openBackupDialog, setOpenBackupDialog] = useState(false);
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'success': return 'success';
      case 'warning': return 'warning';
      case 'critical': case 'error': case 'failed': return 'error';
      case 'running': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'critical': case 'error': case 'failed': return <Error color="error" />;
      case 'running': return <PlayArrow color="info" />;
      default: return <CheckCircle />;
    }
  };

  const handleMaintenanceToggle = () => {
    if (!maintenanceMode) {
      setOpenMaintenanceDialog(true);
    } else {
      setMaintenanceMode(false);
    }
  };

  const enableMaintenanceMode = () => {
    setMaintenanceMode(true);
    setOpenMaintenanceDialog(false);
  };

  const runBackupNow = (jobId: number) => {
    setBackupJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'running' as const } : job
    ));
    
    // Simulate backup completion after 3 seconds
    setTimeout(() => {
      setBackupJobs(prev => prev.map(job => 
        job.id === jobId ? { 
          ...job, 
          status: 'success' as const, 
          lastRun: new Date().toISOString().slice(0, 19).replace('T', ' ')
        } : job
      ));
    }, 3000);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">System Management</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={maintenanceMode}
                onChange={handleMaintenanceToggle}
                color="warning"
              />
            }
            label="Maintenance Mode"
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {maintenanceMode && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">System is in Maintenance Mode</Typography>
          <Typography>All user access is temporarily disabled. Only administrators can access the system.</Typography>
        </Alert>
      )}

      {/* System Health Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {systemMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontSize="0.9rem">
                    {metric.name}
                  </Typography>
                  {getStatusIcon(metric.status)}
                </Box>
                
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {metric.value}
                  <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                    {metric.unit}
                  </Typography>
                </Typography>
                
                {metric.name.includes('Usage') && (
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.value} 
                    color={getStatusColor(metric.status) as any}
                    sx={{ mb: 1 }}
                  />
                )}
                
                <Typography variant="caption" color="textSecondary">
                  Updated: {metric.lastUpdated.split(' ')[1]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Performance (24h)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#1976d2" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#d32f2f" name="Memory %" />
                  <Line type="monotone" dataKey="responseTime" stroke="#ed6c02" name="Response Time (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<RestartAlt />}
                  fullWidth
                  color="warning"
                >
                  Restart Services
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Database />}
                  fullWidth
                >
                  Database Health Check
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<NetworkCheck />}
                  fullWidth
                >
                  Network Diagnostics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  fullWidth
                >
                  Security Scan
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SystemUpdate />}
                  fullWidth
                  color="success"
                >
                  System Updates
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Backup Management */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Backup Jobs</Typography>
                <Button
                  size="small"
                  startIcon={<Schedule />}
                  onClick={() => setOpenBackupDialog(true)}
                >
                  Schedule Backup
                </Button>
              </Box>
              
              <List>
                {backupJobs.map((job, index) => (
                  <React.Fragment key={job.id}>
                    <ListItem
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Run Now">
                            <IconButton 
                              size="small" 
                              onClick={() => runBackupNow(job.id)}
                              disabled={job.status === 'running'}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <Backup />
                      </ListItemIcon>
                      <ListItemText
                        primary={job.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">{job.schedule}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip 
                                label={job.status} 
                                size="small" 
                                color={getStatusColor(job.status) as any}
                              />
                              <Chip label={job.size} size="small" variant="outlined" />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < backupJobs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Recent Error Logs</Typography>
                <Button size="small" startIcon={<BugReport />}>
                  View All Logs
                </Button>
              </Box>
              
              <List>
                {errorLogs.slice(0, 5).map((log, index) => (
                  <React.Fragment key={log.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ 
                          bgcolor: log.level === 'error' ? 'error.main' : 
                                   log.level === 'warning' ? 'warning.main' : 'info.main',
                          width: 32, 
                          height: 32 
                        }}>
                          {log.level === 'error' ? <Error /> : 
                           log.level === 'warning' ? <Warning /> : <BugReport />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={log.message}
                        secondary={
                          <Box>
                            <Typography variant="caption">
                              {log.component} • {log.timestamp}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {!log.resolved && (
                                <Chip label="Unresolved" size="small" color="error" />
                              )}
                              {log.userId && (
                                <Chip label={`User: ${log.userId}`} size="small" variant="outlined" sx={{ ml: 1 }} />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < errorLogs.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Backup Schedule Dialog */}
      <Dialog open={openBackupDialog} onClose={() => setOpenBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Backup</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Backup Name"
              fullWidth
              placeholder="Enter backup job name"
            />

            <FormControl fullWidth>
              <InputLabel>Backup Type</InputLabel>
              <Select defaultValue="full" label="Backup Type">
                <MenuItem value="full">Full Backup</MenuItem>
                <MenuItem value="incremental">Incremental</MenuItem>
                <MenuItem value="differential">Differential</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Schedule</InputLabel>
              <Select defaultValue="daily" label="Schedule">
                <MenuItem value="hourly">Every Hour</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="time"
              label="Preferred Time"
              InputLabelProps={{ shrink: true }}
              fullWidth
              defaultValue="02:00"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBackupDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Schedule />}>
            Schedule Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Mode Dialog */}
      <Dialog open={openMaintenanceDialog} onClose={() => setOpenMaintenanceDialog(false)}>
        <DialogTitle>Enable Maintenance Mode?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will temporarily disable access for all users except administrators.
          </Alert>
          <Typography>
            Maintenance mode is typically used during system updates, database migrations, 
            or critical maintenance tasks. Users will see a maintenance message when trying to access the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMaintenanceDialog(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={enableMaintenanceMode}>
            Enable Maintenance Mode
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemManagement;