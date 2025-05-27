import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Button,
  Avatar,
  Chip,
  Divider,
  Stack,
  Alert,
  Paper,
  Grid,
  Fade,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  HealthAndSafety as HealthIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Savings as SavingsIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Lightbulb as TipIcon,
  Analytics as AnalyticsIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { toast } from 'sonner';

interface Wallet {
  id: string;
  name: string;
  balance: number;
  isSaving?: boolean;
}

interface Props {
  income: number;
  outcome: number;
  wallets: Wallet[];
}

interface SurvivabilityDetails {
  icon: string;
  label: string;
  color: 'success' | 'warning' | 'error';
  details: {
    income: { score: number; ratio: string };
    savings: { score: number; ratio: string };
    total: string;
  };
}

const getSurvivabilityStatus = (income: number, outcome: number, wallets: Wallet[]): SurvivabilityDetails => {
  const savings = wallets.reduce((acc, w) => acc + (w.isSaving ? w.balance || 0 : 0), 0);
  const total = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const ratio = outcome > 0 ? income / outcome : income > 0 ? 2 : 0;
  const savingsRatio = total > 0 ? savings / total : 0;

  let scoreIncome = ratio >= 1.5 ? 100 : ratio >= 1 ? 70 : ratio >= 0.8 ? 40 : 10;
  let scoreSavings = savingsRatio >= 0.3 ? 100 : savingsRatio >= 0.2 ? 70 : savingsRatio >= 0.1 ? 40 : 10;
  const totalScore = (scoreIncome + scoreSavings) / 2;

  let status = '🔴';
  let color: 'success' | 'warning' | 'error' = 'error';
  let label = 'Bahaya';

  if (totalScore >= 80) {
    status = '✅';
    color = 'success';
    label = 'Aman';
  } else if (totalScore >= 50) {
    status = '⚠️';
    color = 'warning';
    label = 'Waspada';
  }

  return {
    icon: status,
    label,
    color,
    details: {
      income: { score: scoreIncome, ratio: ratio.toFixed(2) },
      savings: { score: scoreSavings, ratio: (savingsRatio * 100).toFixed(1) },
      total: totalScore.toFixed(1)
    }
  };
};

const SurvivabilityScoreBox: React.FC<Props> = ({ income, outcome, wallets }) => {
  const theme = useTheme();
  const prevStatus = useRef<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);
  
  const survivability = getSurvivabilityStatus(income, outcome, wallets);

  // Toast notification for status changes
  useEffect(() => {
    if (!prevStatus.current) {
      prevStatus.current = survivability.icon;
    } else if (prevStatus.current !== survivability.icon) {
      toast(`Status survivability berubah dari ${prevStatus.current} ke ${survivability.icon}`);
      prevStatus.current = survivability.icon;
      setAnimateScore(true);
      setTimeout(() => setAnimateScore(false), 1000);
    }
  }, [survivability.icon]);

  const getStatusIcon = () => {
    switch (survivability.color) {
      case 'success':
        return <CheckCircleIcon fontSize="large" />;
      case 'warning':
        return <WarningIcon fontSize="large" />;
      case 'error':
        return <ErrorIcon fontSize="large" />;
    }
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (survivability.details.income.score < 70) {
      recommendations.push({
        icon: <TrendingUpIcon />,
        text: 'Tingkatkan pemasukan atau kurangi pengeluaran',
        priority: 'high'
      });
    }
    
    if (survivability.details.savings.score < 70) {
      recommendations.push({
        icon: <SavingsIcon />,
        text: 'Alokasikan minimal 30% untuk tabungan',
        priority: 'medium'
      });
    }
    
    if (parseFloat(survivability.details.total) >= 80) {
      recommendations.push({
        icon: <CheckCircleIcon />,
        text: 'Pertahankan kebiasaan finansial yang baik!',
        priority: 'low'
      });
    }
    
    return recommendations;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    });
  };

  const totalSavings = wallets.reduce((acc, w) => acc + (w.isSaving ? w.balance || 0 : 0), 0);
  const totalBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);

  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              bgcolor: `${survivability.color}.main`,
              width: 48,
              height: 48
            }}
          >
            <HealthIcon />
          </Avatar>
        }
        title={
          <Typography variant="h6" fontWeight="bold">
            Health Score
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            Analisis kesehatan finansial Anda
          </Typography>
        }
        action={
          <Tooltip 
            title={
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cara Perhitungan Skor:
                </Typography>
                <Typography variant="body2">
                  • Rasio Income/Outcome (ideal: ≥1.5)<br/>
                  • Rasio Tabungan/Total Saldo (ideal: ≥30%)<br/>
                  • Skor = (Skor Income + Skor Tabungan) / 2
                </Typography>
              </Box>
            }
            arrow
            placement="top"
          >
            <IconButton size="small">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        }
      />

      <CardContent sx={{ flex: 1, pt: 0 }}>
        {/* Main Status Display */}
        <Box textAlign="center" mb={3}>
          <Fade in={true} timeout={500}>
            <Box>
              <Box 
                sx={{ 
                  fontSize: '3rem',
                  mb: 1,
                  transform: animateScore ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}
              >
                {survivability.icon}
              </Box>
              
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color={`${survivability.color}.main`}
                gutterBottom
              >
                {survivability.label}
              </Typography>
              
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                <CircularProgress
                  variant="determinate"
                  value={parseFloat(survivability.details.total)}
                  size={60}
                  thickness={4}
                  color={survivability.color}
                />
                <Box position="absolute">
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    color={`${survivability.color}.main`}
                  >
                    {survivability.details.total}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Overall Score
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 1.5, 
                textAlign: 'center',
                bgcolor: alpha(theme.palette.success.main, 0.1)
              }}
            >
              <TrendingUpIcon color="success" />
              <Typography variant="caption" display="block" color="text.secondary">
                Income Ratio
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {survivability.details.income.ratio}x
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 1.5, 
                textAlign: 'center',
                bgcolor: alpha(theme.palette.info.main, 0.1)
              }}
            >
              <SavingsIcon color="info" />
              <Typography variant="caption" display="block" color="text.secondary">
                Savings Ratio
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="info.main">
                {survivability.details.savings.ratio}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Progress Bars */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Overall Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={parseFloat(survivability.details.total)}
            color={survivability.color}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} mb={2}>
          <Button
            variant="outlined"
            size="small"
            startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowDetails(!showDetails)}
            fullWidth
          >
            {showDetails ? 'Sembunyikan' : 'Detail'} Analisis
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<TipIcon />}
            onClick={() => setShowTips(!showTips)}
            color="info"
          >
            Tips
          </Button>
        </Stack>

        {/* Detailed Analysis */}
        <Collapse in={showDetails}>
          <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              📊 Breakdown Analisis
            </Typography>
            
            <Stack spacing={2}>
              {/* Income vs Outcome */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">
                    Income vs Outcome
                  </Typography>
                  <Chip 
                    label={`${survivability.details.income.score}/100`}
                    size="small"
                    color={survivability.details.income.score >= 70 ? 'success' : 'warning'}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={survivability.details.income.score}
                  color={survivability.details.income.score >= 70 ? 'success' : 'warning'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              {/* Savings Score */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">
                    Savings Score
                  </Typography>
                  <Chip 
                    label={`${survivability.details.savings.score}/100`}
                    size="small"
                    color={survivability.details.savings.score >= 70 ? 'success' : 'warning'}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={survivability.details.savings.score}
                  color={survivability.details.savings.score >= 70 ? 'success' : 'warning'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Financial Summary */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              💰 Ringkasan Keuangan
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Total Pemasukan: <strong>{formatCurrency(income)}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Total Pengeluaran: <strong>{formatCurrency(outcome)}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Total Tabungan: <strong>{formatCurrency(totalSavings)}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Total Saldo: <strong>{formatCurrency(totalBalance)}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>

        {/* Tips & Recommendations */}
        <Collapse in={showTips}>
          <Alert 
            severity={survivability.color} 
            sx={{ mb: 2 }}
            icon={<TipIcon />}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              💡 Rekomendasi Perbaikan:
            </Typography>
            <Stack spacing={1}>
              {getRecommendations().map((rec, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1}>
                  {rec.icon}
                  <Typography variant="body2">
                    {rec.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Alert>
        </Collapse>

        {/* Status Badge */}
        <Box position="absolute" top={8} right={8}>
          <Chip
            label={survivability.label}
            color={survivability.color}
            size="small"
            icon={getStatusIcon()}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SurvivabilityScoreBox;