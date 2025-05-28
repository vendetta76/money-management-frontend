import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import ReportForm from '../../components/ReportForm';

const ReportPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          🐱 Laporan & Saran
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Bantu kami meningkatkan MeowIQ dengan melaporkan bug atau memberikan saran. 
          Masukan Anda sangat berharga untuk membuat aplikasi lebih baik! 🐾
        </Typography>
      </Paper>

      {/* Instructions Card */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          📝 Cara Membuat Laporan yang Baik
        </Typography>
        <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
          <li>
            <Typography variant="body2">
              <strong>Untuk Laporan Bug:</strong> Jelaskan apa yang Anda harapkan vs apa yang sebenarnya terjadi
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Untuk Saran:</strong> Bagikan ide, saran, atau hal yang ingin Anda lihat diperbaiki
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Jadilah Spesifik:</strong> Sertakan langkah-langkah untuk mereproduksi masalah atau permintaan fitur yang detail
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Info Kontak:</strong> Berikan email atau Telegram agar kami bisa menghubungi jika diperlukan
            </Typography>
          </li>
        </Box>
      </Paper>

      {/* Report Form */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <ReportForm />
      </Box>

      {/* Additional Help */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mt: 4, 
          backgroundColor: 'action.hover',
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Butuh bantuan segera? Hubungi kami langsung di{' '}
          <Typography component="span" color="primary.main" sx={{ fontWeight: 500 }}>
            support@meowiq.com
          </Typography>
        </Typography>
      </Paper>
    </Container>
  );
};

export default ReportPage;