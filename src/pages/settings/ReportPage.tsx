import React from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
} from '@mui/material';
import { NavigateNext, Settings, BugReport } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import ReportForm from '../components/ReportForm';

const ReportPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component={RouterLink}
          to="/dashboard"
          color="inherit"
          underline="hover"
        >
          Dashboard
        </Link>
        <Link
          component={RouterLink}
          to="/settings/profile"
          color="inherit"
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Settings fontSize="small" />
          Settings
        </Link>
        <Typography 
          color="text.primary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <BugReport fontSize="small" />
          Report
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          🐱 Report & Feedback
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Help us improve MeowIQ by reporting bugs or sharing your feedback. 
          Your input is valuable to make our app better for all cat lovers! 🐾
        </Typography>
      </Paper>

      {/* Instructions Card */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          📝 How to Submit a Good Report
        </Typography>
        <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
          <li>
            <Typography variant="body2">
              <strong>For Bug Reports:</strong> Describe what you expected to happen vs. what actually happened
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>For Feedback:</strong> Share your ideas, suggestions, or what you'd like to see improved
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Be Specific:</strong> Include steps to reproduce issues or detailed feature requests
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Contact Info:</strong> Provide your email or Telegram so we can follow up if needed
            </Typography>
          </li>
        </Box>
      </Paper>

      {/* Report Form */}
      <ReportForm />

      {/* Additional Help */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mt: 3, 
          backgroundColor: 'action.hover',
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Need immediate help? Check out our{' '}
          <Link component={RouterLink} to="/about" color="primary">
            About & FAQ section
          </Link>{' '}
          or contact us directly at{' '}
          <Link href="mailto:support@meowiq.com" color="primary">
            support@meowiq.com
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default ReportPage;