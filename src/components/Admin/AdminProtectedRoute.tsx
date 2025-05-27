import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { toast } from 'react-hot-toast';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'superadmin';
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'staff' // Default minimum role
}) => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Define role hierarchy (higher number = more permissions)
  const roleHierarchy = {
    'regular': 0,
    'premium': 1,
    'staff': 2,
    'admin': 3,
    'superadmin': 4
  };

  // Admin allowed emails (fallback if role system isn't set up yet)
  const adminEmails = [
    'koutoybox@gmail.com', // Your existing admin email
    'admin@example.com',
    // Add more admin emails as needed
  ];

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Listen to user document for role changes
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          const role = userData.role?.toLowerCase() || 'regular';
          setUserRole(role);
        } else {
          // If user document doesn't exist, check if email is in admin list
          if (adminEmails.includes(user.email || '')) {
            setUserRole('admin');
          } else {
            setUserRole('regular');
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user role:', error);
        
        // Fallback: check if email is in admin list
        if (adminEmails.includes(user.email || '')) {
          setUserRole('admin');
          toast.success('Admin access granted via email verification');
        } else {
          setError('Unable to verify admin permissions');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Show loading while checking auth or user role
  if (authLoading || loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={50} />
        <Typography variant="h6" color="textSecondary">
          Verifying admin access...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    toast.error('Please login to access admin panel');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole];

  const hasAccess = userRoleLevel >= requiredRoleLevel || adminEmails.includes(user.email || '');

  if (!hasAccess) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          p: 3
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2">
              You don't have permission to access the admin panel.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Required role: <strong>{requiredRole}</strong>
            </Typography>
            <Typography variant="body2">
              Your role: <strong>{userRole || 'none'}</strong>
            </Typography>
          </Alert>
          
          <Typography variant="body2" color="textSecondary">
            Contact your administrator if you believe this is an error.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          p: 3
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Alert severity="warning">
            <Typography variant="body2">
              {error}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please try refreshing the page or contact support.
            </Typography>
          </Alert>
        </Paper>
      </Box>
    );
  }

  // Grant access if all checks pass
  return <>{children}</>;
};

export default AdminProtectedRoute;