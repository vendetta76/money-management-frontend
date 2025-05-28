import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Paper,
  IconButton,
  Fab,
  Zoom,
  Grow,
  Slide,
  Stack,
  Rating
} from '@mui/material';
import {
  ThemeProvider,
  createTheme,
  styled,
  keyframes
} from '@mui/material/styles';
import {
  ArrowForward,
  Security,
  Analytics,
  Speed,
  Star,
  TrendingUp,
  AccountBalance,
  Rocket,
  AutoAwesome,
  ChevronRight
} from '@mui/icons-material';

// Modern vibrant theme
const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1',
      light: '#818CF8',
      dark: '#4F46E5',
    },
    secondary: {
      main: '#06B6D4',
      light: '#67E8F9',
      dark: '#0891B2',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
    },
    warning: {
      main: '#F59E0B',
    },
    success: {
      main: '#10B981',
    },
    error: {
      main: '#EF4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
`;

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.9)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #6366F1 30%, #06B6D4 90%)',
  borderRadius: 25,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #4F46E5 30%, #0891B2 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
  },
}));

const PlayfulCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.4s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
    '& .card-icon': {
      animation: `${pulse} 0.6s ease-in-out`,
    },
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #6366F1 30%, #06B6D4 70%, #10B981 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  animation: `${float} 4s ease-in-out infinite`,
  opacity: 0.1,
}));

const LoadingAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing your dashboard...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 12;
      });
    }, 400);

    const texts = [
      "Initializing your dashboard...",
      "Loading financial data...",
      "Preparing analytics...",
      "Almost ready!",
    ];

    const textTimer = setInterval(() => {
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, []);

  return (
    <ThemeProvider theme={modernTheme}>
      <Box
        sx={{
          height: '100vh',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating geometric shapes */}
        <FloatingElement sx={{ top: '10%', left: '10%', animationDelay: '0s' }}>
          <Box sx={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(45deg, #6366F1, #06B6D4)' }} />
        </FloatingElement>
        <FloatingElement sx={{ top: '20%', right: '15%', animationDelay: '1s' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1, background: 'linear-gradient(45deg, #10B981, #F59E0B)' }} />
        </FloatingElement>
        <FloatingElement sx={{ bottom: '20%', left: '20%', animationDelay: '2s' }}>
          <Box sx={{ width: 50, height: 50, borderRadius: 2, background: 'linear-gradient(45deg, #EF4444, #6366F1)' }} />
        </FloatingElement>

        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                background: 'linear-gradient(45deg, #6366F1 30%, #06B6D4 90%)',
                animation: `${glow} 3s ease-in-out infinite`,
              }}
            >
              <AutoAwesome sx={{ fontSize: '2rem' }} />
            </Avatar>

            <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>
              <GradientText>MeowIQ</GradientText>
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, minHeight: 60 }}>
              {loadingText}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #6366F1 30%, #06B6D4 90%)',
                  borderRadius: 4,
                },
              }}
            />

            <Stack direction="row" spacing={3} justifyContent="center">
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #6366F1, #06B6D4)',
                    animation: `${pulse} 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setLoading(false), 3000);
  }, []);

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <ThemeProvider theme={modernTheme}>
      <Box sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background decorations */}
        <FloatingElement sx={{ top: '5%', left: '5%', animationDelay: '0s' }}>
          <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(45deg, #6366F1, #06B6D4)', opacity: 0.1 }} />
        </FloatingElement>
        <FloatingElement sx={{ top: '60%', right: '10%', animationDelay: '2s' }}>
          <Box sx={{ width: 80, height: 80, borderRadius: 2, background: 'linear-gradient(45deg, #10B981, #F59E0B)', opacity: 0.1 }} />
        </FloatingElement>
        <FloatingElement sx={{ bottom: '10%', left: '15%', animationDelay: '4s' }}>
          <Box sx={{ width: 60, height: 60, borderRadius: 1, background: 'linear-gradient(45deg, #EF4444, #6366F1)', opacity: 0.1 }} />
        </FloatingElement>

        {/* AppBar */}
        <StyledAppBar position="sticky" elevation={0}>
          <Toolbar>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
              <AutoAwesome sx={{ color: 'primary.main' }} />
              <GradientText variant="h5" sx={{ fontWeight: 800 }}>
                MeowIQ
              </GradientText>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button color="inherit">Login</Button>
              <GradientButton variant="contained">
                Register
              </GradientButton>
            </Stack>
          </Toolbar>
        </StyledAppBar>

        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Grow in={mounted} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                icon={<Rocket />}
                label="Transform Your Financial Future"
                sx={{
                  mb: 4,
                  background: 'linear-gradient(45deg, #6366F1 30%, #06B6D4 90%)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />

              <Typography variant="h1" sx={{ mb: 3, fontWeight: 800 }}>
                Smart Finance
                <br />
                <GradientText variant="h1" component="span">
                  Management
                </GradientText>
              </Typography>

              <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                Revolutionary PWA that transforms how you manage wallets, track transactions, and visualize financial insights with AI-powered analytics.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center">
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<ChevronRight />}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.light',
                      background: 'rgba(99, 102, 241, 0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
                
                <GradientButton
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                >
                  Get Started Free
                </GradientButton>
              </Stack>

              {/* Stats */}
              <Grid container spacing={4} sx={{ mt: 8, justifyContent: 'center' }}>
                <Grid item xs={4} sm="auto">
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>50K+</Typography>
                  <Typography color="text.secondary">Active Users</Typography>
                </Grid>
                <Grid item xs={4} sm="auto">
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main' }}>$10M+</Typography>
                  <Typography color="text.secondary">Managed</Typography>
                </Grid>
                <Grid item xs={4} sm="auto">
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main' }}>99.9%</Typography>
                  <Typography color="text.secondary">Uptime</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grow>

          {/* App Preview */}
          <Zoom in={mounted} timeout={1500}>
            <Paper
              elevation={24}
              sx={{
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                mb: 8,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" color="text.secondary">
                  Interactive Demo Coming Soon
                </Typography>
              </Box>
              
              {/* Floating decorative elements */}
              <Box sx={{ position: 'absolute', top: 20, left: 20, width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(45deg, #EF4444, #F59E0B)', animation: `${float} 3s ease-in-out infinite` }} />
              <Box sx={{ position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderRadius: 1, background: 'linear-gradient(45deg, #10B981, #06B6D4)', animation: `${float} 4s ease-in-out infinite` }} />
            </Paper>
          </Zoom>
        </Container>

        {/* Features */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
              Powerful <GradientText variant="h2" component="span">Features</GradientText>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to master your finances
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Slide direction="up" in={mounted} timeout={800}>
                <PlayfulCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      className="card-icon"
                      sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 3,
                        background: 'linear-gradient(45deg, #6366F1, #8B5CF6)',
                      }}
                    >
                      <Security sx={{ fontSize: '1.8rem' }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      Bank-Grade Security
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Military-grade encryption and multi-layer security protocols protect your financial data with zero-trust architecture.
                    </Typography>
                  </CardContent>
                </PlayfulCard>
              </Slide>
            </Grid>

            <Grid item xs={12} md={4}>
              <Slide direction="up" in={mounted} timeout={1000}>
                <PlayfulCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      className="card-icon"
                      sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 3,
                        background: 'linear-gradient(45deg, #06B6D4, #10B981)',
                      }}
                    >
                      <Analytics sx={{ fontSize: '1.8rem' }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      AI-Powered Insights
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Machine learning algorithms analyze your spending patterns and provide personalized recommendations for optimal financial health.
                    </Typography>
                  </CardContent>
                </PlayfulCard>
              </Slide>
            </Grid>

            <Grid item xs={12} md={4}>
              <Slide direction="up" in={mounted} timeout={1200}>
                <PlayfulCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      className="card-icon"
                      sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 3,
                        background: 'linear-gradient(45deg, #F59E0B, #EF4444)',
                      }}
                    >
                      <Speed sx={{ fontSize: '1.8rem' }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      Lightning Fast
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Progressive Web App technology ensures instant loading, offline functionality, and native app-like performance.
                    </Typography>
                  </CardContent>
                </PlayfulCard>
              </Slide>
            </Grid>
          </Grid>
        </Container>

        {/* How it Works */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
              Get Started in <GradientText variant="h2" component="span">Minutes</GradientText>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Simple setup, powerful results
            </Typography>
          </Box>

          <Grid container spacing={6}>
            {[
              { icon: <AccountBalance />, title: "Create Account", desc: "Sign up instantly with email or social login. No credit card required." },
              { icon: <AutoAwesome />, title: "Smart Setup", desc: "AI-guided wallet configuration tailored to your financial goals and preferences." },
              { icon: <TrendingUp />, title: "Track & Analyze", desc: "Automatic transaction categorization with real-time insights and spending alerts." },
              { icon: <Star />, title: "Optimize & Grow", desc: "Receive personalized recommendations to maximize savings and investment opportunities." }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Grow in={mounted} timeout={800 + index * 200}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        background: `linear-gradient(45deg, ${index % 2 === 0 ? '#6366F1, #06B6D4' : '#10B981, #F59E0B'})`,
                        fontWeight: 800,
                        fontSize: '1.2rem',
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* CTA Section */}
        <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
          <Zoom in={mounted} timeout={1500}>
            <Paper
              elevation={12}
              sx={{
                p: 6,
                background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
                Ready to Transform Your
                <br />
                <GradientText variant="h3" component="span">Financial Future?</GradientText>
              </Typography>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                Join thousands of smart users who have revolutionized their financial management with MeowIQ.
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 4 }}>
                <Rating value={5} readOnly sx={{ color: '#F59E0B' }} />
                <Typography variant="body2" color="text.secondary">
                  Rated 5.0 by 10,000+ users
                </Typography>
              </Stack>

              <GradientButton
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{ fontSize: '1.2rem', py: 2, px: 4 }}
              >
                Start Your Journey
              </GradientButton>
            </Paper>
          </Zoom>
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AutoAwesome sx={{ color: 'primary.main' }} />
                  <GradientText variant="h5" sx={{ fontWeight: 800 }}>
                    MeowIQ
                  </GradientText>
                </Stack>
                <Typography color="text.secondary">
                  The Future of Personal Finance Management
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                <Typography variant="body2" color="text.secondary">
                  © 2025 MeowIQ. Built with ❤️ and cutting-edge technology
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;