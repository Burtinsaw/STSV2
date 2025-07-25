// src/views/Dashboard/Default/index.jsx - Basit ve Çalışan Dashboard
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Badge,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  Description as DocumentIcon,
  Assignment as TemplateIcon,
  Notifications as NotificationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

// project import
import { gridSpacing } from 'config.js';

const Dashboard = () => {
  const theme = useTheme();
  
  // State yönetimi
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data
  const [stats, setStats] = useState({
    companies: 2,
    bankAccounts: 4,
    templates: 8,
    documents: 12
  });

  // Grafik verileri
  const monthlyData = [
    { month: 'Oca', value: 180000 },
    { month: 'Şub', value: 220000 },
    { month: 'Mar', value: 250000 },
    { month: 'Nis', value: 280000 },
    { month: 'May', value: 320000 },
    { month: 'Haz', value: 350000 }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Dashboard Yükleniyor...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={gridSpacing}>
      {/* Header */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hoş geldiniz! İşletme durumunuzun genel görünümü
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="Verileri Yenile">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Badge badgeContent={3} color="error">
              <IconButton>
                <NotificationIcon />
              </IconButton>
            </Badge>
          </Box>
        </Box>
      </Grid>

      {/* İstatistik Kartları */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.companies}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Toplam Şirket
                    </Typography>
                  </Box>
                  <BusinessIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.bankAccounts}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Banka Hesabı
                    </Typography>
                  </Box>
                  <BankIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.templates}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Şablon
                    </Typography>
                  </Box>
                  <TemplateIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.documents}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Son Belgeler
                    </Typography>
                  </Box>
                  <DocumentIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Grafik Alanı */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  Aylık Gelir Analizi
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatCurrency} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#1976d2" 
                      fill="#1976d2" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  Hızlı İşlemler
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<BusinessIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Yeni Şirket
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<TemplateIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Şablon Ekle
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DocumentIcon />}
                      sx={{ py: 1.5 }}
                    >
                      PDF Oluştur
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<BankIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Hesap Ekle
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;

