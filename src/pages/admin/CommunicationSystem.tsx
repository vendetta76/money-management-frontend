// src/pages/admin/CommunicationSystem.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Avatar,
  Badge,
  Stack,
  Paper,
} from '@mui/material';
import {
  Send,
  Notifications,
  Email,
  Campaign,
  Delete,
  Edit,
  Add,
  Visibility,
  NotificationsActive,
  Announcement,
  Schedule,
  Group,
  Person,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'specific' | 'role';
  targetUsers: string[];
  status: 'draft' | 'sent' | 'scheduled';
  scheduledFor?: string;
  createdAt: string;
  sentCount: number;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'notification' | 'announcement' | 'security';
  isActive: boolean;
  lastUsed: string;
}

interface SystemAnnouncement {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isActive: boolean;
  showToUsers: boolean;
  showToAdmins: boolean;
  startDate: string;
  endDate?: string;
  createdBy: string;
}

const CommunicationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Sample data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'System Maintenance Alert',
      message: 'Scheduled maintenance on Sunday 2 AM - 4 AM EST',
      type: 'warning',
      target: 'all',
      targetUsers: [],
      status: 'sent',
      createdAt: '2024-05-26 10:30:00',
      sentCount: 1250
    },
    {
      id: 2,
      title: 'New Feature Release',
      message: 'Dark mode is now available in settings!',
      type: 'info',
      target: 'all',
      targetUsers: [],
      status: 'scheduled',
      scheduledFor: '2024-05-28 09:00:00',
      createdAt: '2024-05-25 15:20:00',
      sentCount: 0
    }
  ]);

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: 1,
      name: 'Welcome Email',
      subject: 'Welcome to MeowIQ!',
      content: '<h1>Welcome!</h1><p>Thank you for joining MeowIQ...</p>',
      type: 'welcome',
      isActive: true,
      lastUsed: '2024-05-26 08:30:00'
    },
    {
      id: 2,
      name: 'Security Alert',
      subject: 'Security Alert - Login from new device',
      content: '<h2>Security Alert</h2><p>We detected a login from a new device...</p>',
      type: 'security',
      isActive: true,
      lastUsed: '2024-05-24 14:15:00'
    }
  ]);

  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([
    {
      id: 1,
      title: 'Scheduled Maintenance',
      message: 'System will be down for maintenance on Sunday from 2-4 AM EST',
      type: 'warning',
      isActive: true,
      showToUsers: true,
      showToAdmins: true,
      startDate: '2024-05-26',
      endDate: '2024-05-30',
      createdBy: 'Admin'
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      default: return <Info color="info" />;
    }
  };

  const notificationColumns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getNotificationIcon(params.row.type)}
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} color={params.value as any} size="small" />
      )
    },
    {
      field: 'target',
      headerName: 'Target',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'all' ? 'All Users' : params.value} 
          variant="outlined" 
          size="small" 
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          color={
            params.value === 'sent' ? 'success' :
            params.value === 'scheduled' ? 'warning' : 'default'
          }
          size="small"
        />
      )
    },
    {
      field: 'sentCount',
      headerName: 'Sent To',
      width: 100
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150
    }
  ];

  const renderNotifications = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Push Notifications</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenNotificationDialog(true)}
        >
          Create Notification
        </Button>
      </Box>

      <Card>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={notifications}
            columns={notificationColumns}
            pageSizeOptions={[10, 25]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </Card>

      {/* Create Notification Dialog */}
      <Dialog open={openNotificationDialog} onClose={() => setOpenNotificationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Notification Title"
              fullWidth
              placeholder="Enter notification title"
            />
            
            <TextField
              label="Message"
              multiline
              rows={4}
              fullWidth
              placeholder="Enter notification message"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select defaultValue="info" label="Type">
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Audience</InputLabel>
                  <Select defaultValue="all" label="Target Audience">
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="role">By Role</MenuItem>
                    <MenuItem value="specific">Specific Users</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={<Switch />}
                label="Schedule for later"
              />
              <TextField
                type="datetime-local"
                label="Schedule Date & Time"
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotificationDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Send />}>
            Send Notification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderEmailTemplates = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Email Templates</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenTemplateDialog(true)}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {emailTemplates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Subject: {template.subject}
                </Typography>
                
                <Chip 
                  label={template.type} 
                  color="primary" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Switch checked={template.isActive} />}
                    label="Active"
                  />
                  <Typography variant="caption" color="textSecondary">
                    Last used: {template.lastUsed}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderAnnouncements = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">System Announcements</Typography>
        <Button
          variant="contained"
          startIcon={<Announcement />}
          onClick={() => setOpenAnnouncementDialog(true)}
        >
          Create Announcement
        </Button>
      </Box>

      <Stack spacing={2}>
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getNotificationIcon(announcement.type)}
                    <Typography variant="h6">{announcement.title}</Typography>
                    {announcement.isActive && (
                      <Chip label="Active" color="success" size="small" />
                    )}
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {announcement.message}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {announcement.showToUsers && (
                      <Chip label="Users" size="small" variant="outlined" />
                    )}
                    {announcement.showToAdmins && (
                      <Chip label="Admins" size="small" variant="outlined" />
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="textSecondary">
                    {announcement.startDate} - {announcement.endDate || 'Ongoing'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Create Announcement Dialog */}
      <Dialog open={openAnnouncementDialog} onClose={() => setOpenAnnouncementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create System Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Announcement Title"
              fullWidth
              placeholder="Enter announcement title"
            />
            
            <TextField
              label="Message"
              multiline
              rows={4}
              fullWidth
              placeholder="Enter announcement message"
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select defaultValue="info" label="Type">
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Display To:</Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show to Users"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show to Admins"
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="End Date (Optional)"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAnnouncementDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Announcement />}>
            Create Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Communication System
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<NotificationsActive />} label="Push Notifications" />
          <Tab icon={<Email />} label="Email Templates" />
          <Tab icon={<Campaign />} label="Announcements" />
        </Tabs>
      </Paper>

      {activeTab === 0 && renderNotifications()}
      {activeTab === 1 && renderEmailTemplates()}
      {activeTab === 2 && renderAnnouncements()}
    </Box>
  );
};

export default CommunicationSystem;