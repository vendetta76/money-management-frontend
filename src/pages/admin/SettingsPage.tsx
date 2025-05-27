// src/pages/Settings.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Grid,
  Alert,
  Slider,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security,
  Notifications,
  Language,
  Palette,
  Storage,
  Email,
  Sms,
  Lock,
  ExpandMore,
  Save,
  RestartAlt,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

// Types
interface SystemSettings {
  defaultCurrency: string;
  maxWalletsPerUser: number;
  enableRegistration: boolean;
  maintenanceMode: boolean;
  sessionTimeout: number;
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  systemNotice: string;
  backupFrequency: string;
  logRetentionDays: number;
}

const GlobalSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    defaultCurrency: 'USD',
    maxWalletsPerUser: 5,
    enableRegistration: true,
    maintenanceMode: false,
    sessionTimeout: 30,
    twoFactorAuth: true,
    emailNotifications: true,
    smsNotifications: false,
    systemNotice: '',
    backupFrequency: 'daily',
    logRetentionDays: 90
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Handle setting changes
  const handleChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Save settings
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // System status items
  const systemStatus = [
    { label: 'Database', status: 'online', icon: <Storage />, color: 'success' as const },
    { label: 'API Server', status: 'online', icon: <CheckCircle />, color: 'success' as const },
    { label: 'Email Service', status: 'online', icon: <Email />, color: 'success' as const },
    { label: 'Backup System', status: 'warning', icon: <Warning />, color: 'warning' as const },
    { label: 'SMS Gateway', status: 'offline', icon: <ErrorIcon />, color: 'error' as const }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Global Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Save Status Alert */}
      {saveStatus !== 'idle' && (
        <Alert 
          severity={
            saveStatus === 'saved' ? 'success' : 
            saveStatus === 'error' ? 'error' : 'info'
          } 
          sx={{ mb: 3 }}
        >
          {saveStatus === 'saved' && 'Settings saved successfully!'}
          {saveStatus === 'error' && 'Error saving settings. Please try again.'}
          {saveStatus === 'saving' && 'Saving settings...'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">General Settings</Typography>
              </Box>
              
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Default Currency</InputLabel>
                  <Select
                    value={settings.defaultCurrency}
                    label="Default Currency"
                    onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                  >
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                    <MenuItem value="GBP">GBP - British Pound</MenuItem>
                    <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography gutterBottom>
                    Max Wallets per User: {settings.maxWalletsPerUser}
                  </Typography>
                  <Slider
                    value={settings.maxWalletsPerUser}
                    onChange={(_, value) => handleChange('maxWalletsPerUser', value)}
                    min={1}
                    max={20}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableRegistration}
                      onChange={(e) => handleChange('enableRegistration', e.target.checked)}
                    />
                  }
                  label="Enable Public Registration"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                      color="warning"
                    />
                  }
                  label="Maintenance Mode"
                />

                <TextField
                  label="System Notice"
                  multiline
                  rows={3}
                  value={settings.systemNotice}
                  onChange={(e) => handleChange('systemNotice', e.target.value)}
                  placeholder="Enter app-wide notice message..."
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Security color="error" />
                <Typography variant="h6">Security Settings</Typography>
              </Box>
              
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="Two-Factor Authentication"
                />

                <Box>
                  <Typography gutterBottom>
                    Session Timeout: {settings.sessionTimeout} minutes
                  </Typography>
                  <Slider
                    value={settings.sessionTimeout}
                    onChange={(_, value) => handleChange('sessionTimeout', value)}
                    min={5}
                    max={120}
                    step={5}
                    marks={[
                      { value: 15, label: '15m' },
                      { value: 30, label: '30m' },
                      { value: 60, label: '1h' },
                      { value: 120, label: '2h' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={settings.backupFrequency}
                    label="Backup Frequency"
                    onChange={(e) => handleChange('backupFrequency', e.target.value)}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Log Retention Days"
                  type="number"
                  value={settings.logRetentionDays}
                  onChange={(e) => handleChange('logRetentionDays', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1, max: 365 } }}
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Notifications color="info" />
                <Typography variant="h6">Notification Settings</Typography>
              </Box>
              
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />

                <Divider />

                <Typography variant="subtitle2" color="textSecondary">
                  Notification Types
                </Typography>

                <Box>
                  <FormControlLabel
                    control={<Switch defaultChecked size="small" />}
                    label="New User Registration"
                  />
                </Box>
                
                <Box>
                  <FormControlLabel
                    control={<Switch defaultChecked size="small" />}
                    label="Large Transactions (>$10,000)"
                  />
                </Box>
                
                <Box>
                  <FormControlLabel
                    control={<Switch size="small" />}
                    label="Failed Login Attempts"
                  />
                </Box>
                
                <Box>
                  <FormControlLabel
                    control={<Switch defaultChecked size="small" />}
                    label="System Errors"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              
              <List>
                {systemStatus.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: `${item.color}.main` 
                        }}
                      >
                        {item.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={
                        <Chip 
                          label={item.status.toUpperCase()} 
                          color={item.color}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  startIcon={<RestartAlt />}
                  size="small"
                >
                  Restart Services
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Storage />}
                  size="small"
                >
                  Run Backup
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Advanced Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Advanced Settings
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Database Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Connection Pool Size"
                        type="number"
                        defaultValue={10}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Query Timeout (seconds)"
                        type="number"
                        defaultValue={30}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>API Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Rate Limit (requests/minute)"
                        type="number"
                        defaultValue={100}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable API Logging"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Cache Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Cache TTL (minutes)"
                        type="number"
                        defaultValue={60}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Button variant="outlined" size="small">
                        Clear Cache
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GlobalSettings;