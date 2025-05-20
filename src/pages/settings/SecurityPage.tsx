import React, { useEffect, useState } from "react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import LayoutShell from "../../layouts/LayoutShell";
import PinManagement from "../components/security/PinManagement";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Paper
} from "@mui/material";
import {
  Lock,
  Key,
  Visibility,
  VisibilityOff,
  Shield,
} from "@mui/icons-material";

const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Password change state
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);
  
  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Alerts
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  // Show alert helper
  const showAlert = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validation
    if (!currentPassword) {
      showAlert("Masukkan password saat ini", "error");
      return;
    }
    
    if (newPassword.length < 6) {
      showAlert("Password baru minimal 6 karakter", "error");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showAlert("Password baru tidak cocok", "error");
      return;
    }
    
    setLoadingPwd(true);
    try {
      const cred = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      
      showAlert("Password berhasil diubah", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password change error:", err);
      
      // Handle specific Firebase errors
      if (err.code === "auth/wrong-password") {
        showAlert("Password saat ini tidak valid", "error");
      } else if (err.code === "auth/too-many-requests") {
        showAlert("Terlalu banyak percobaan. Coba lagi nanti", "error");
      } else {
        showAlert(`Gagal mengganti password: ${err.message}`, "error");
      }
    }
    setLoadingPwd(false);
  };

  return (
    <LayoutShell>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <Shield sx={{ mr: 1.5, color: 'primary.main' }} fontSize="large" />
            Keamanan Akun
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={2}>
            Kelola pengaturan keamanan untuk akun dan dompet Anda
          </Typography>
          <Divider />
        </Box>

        <Grid container spacing={4}>
          {/* Password Section */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Key sx={{ mr: 1, color: 'primary.main' }} />
                Ganti Password
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box component="form" onSubmit={handlePasswordChange} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type={showCurrentPassword ? "text" : "password"}
                      label="Password Saat Ini"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                            >
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type={showNewPassword ? "text" : "password"}
                      label="Password Baru"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type={showConfirmPassword ? "text" : "password"}
                      label="Konfirmasi Password Baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loadingPwd}
                        startIcon={loadingPwd ? <CircularProgress size={20} /> : <Lock />}
                      >
                        {loadingPwd ? "Menyimpan..." : "Simpan Password"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          {/* PIN Management Section */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <PinManagement />
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Alerts */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </LayoutShell>
  );
};

export default SecurityPage;