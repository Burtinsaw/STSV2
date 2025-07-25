import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Psychology as AIIcon,
  Compare as CompareIcon,
  Email as EmailIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Star as StarIcon
} from '@mui/icons-material';

// ==============================|| TEKLİF KARŞILAŞTIRMA ||============================== //

const QuotationComparison = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  // Mock data - gerçek uygulamada API'den gelecek
  const mockRequests = [
    {
      id: 1,
      title: 'Laptop ve Yazılım Lisansı Talebi',
      requestedBy: 'Ahmet Yılmaz - IT Departmanı',
      priority: 'high',
      status: 'quotation_received',
      items: [
        { name: 'Dell Laptop', quantity: 5, unit: 'Adet' },
        { name: 'Microsoft Office Lisansı', quantity: 5, unit: 'Adet' }
      ]
    }
  ];

  const mockQuotations = [
    {
      id: 1,
      supplier: 'TechnoPlus Bilişim',
      contactPerson: 'Mehmet Kaya',
      email: 'mehmet@technoplus.com',
      phone: '+90 212 555 0101',
      totalPrice: 85000,
      currency: 'TRY',
      deliveryTime: 7,
      validityPeriod: 30,
      paymentTerms: '30 gün vadeli',
      items: [
        { name: 'Dell Laptop', unitPrice: 15000, quantity: 5, total: 75000 },
        { name: 'Microsoft Office Lisansı', unitPrice: 2000, quantity: 5, total: 10000 }
      ],
      rating: 4.5,
      previousOrders: 12,
      onTimeDelivery: 95
    },
    {
      id: 2,
      supplier: 'Bilgisayar Dünyası',
      contactPerson: 'Ayşe Demir',
      email: 'ayse@bilgisayardunyasi.com',
      phone: '+90 212 555 0202',
      totalPrice: 82000,
      currency: 'TRY',
      deliveryTime: 10,
      validityPeriod: 15,
      paymentTerms: '45 gün vadeli',
      items: [
        { name: 'Dell Laptop', unitPrice: 14500, quantity: 5, total: 72500 },
        { name: 'Microsoft Office Lisansı', unitPrice: 1900, quantity: 5, total: 9500 }
      ],
      rating: 4.2,
      previousOrders: 8,
      onTimeDelivery: 88
    },
    {
      id: 3,
      supplier: 'Mega Teknoloji',
      contactPerson: 'Can Özkan',
      email: 'can@megateknoloji.com',
      phone: '+90 212 555 0303',
      totalPrice: 88000,
      currency: 'TRY',
      deliveryTime: 5,
      validityPeriod: 45,
      paymentTerms: '60 gün vadeli',
      items: [
        { name: 'Dell Laptop', unitPrice: 15500, quantity: 5, total: 77500 },
        { name: 'Microsoft Office Lisansı', unitPrice: 2100, quantity: 5, total: 10500 }
      ],
      rating: 4.8,
      previousOrders: 25,
      onTimeDelivery: 98
    }
  ];

  useEffect(() => {
    // İlk talebi seç
    if (mockRequests.length > 0) {
      setSelectedRequest(mockRequests[0]);
      setQuotations(mockQuotations);
    }
  }, []);

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    
    // Simulated AI analysis - gerçek uygulamada Gemini/ChatGPT API kullanılacak
    setTimeout(() => {
      const analysis = {
        recommendation: 'Bilgisayar Dünyası',
        reasoning: 'En uygun fiyat/performans oranı sunan teklif',
        priceAnalysis: {
          lowest: 'Bilgisayar Dünyası (₺82,000)',
          highest: 'Mega Teknoloji (₺88,000)',
          average: '₺85,000',
          savings: '₺3,000 (3.5%)'
        },
        deliveryAnalysis: {
          fastest: 'Mega Teknoloji (5 gün)',
          slowest: 'Bilgisayar Dünyası (10 gün)',
          average: '7.3 gün'
        },
        supplierAnalysis: {
          mostReliable: 'Mega Teknoloji (98% zamanında teslimat)',
          mostExperienced: 'Mega Teknoloji (25 önceki sipariş)',
          bestRated: 'Mega Teknoloji (4.8/5)'
        },
        risks: [
          'Bilgisayar Dünyası\'nın teslimat süresi diğerlerinden uzun',
          'TechnoPlus\'ın geçerlilik süresi kısa (30 gün)'
        ],
        opportunities: [
          'Mega Teknoloji ile uzun vadeli anlaşma yapılabilir',
          'Toplu alım indirimi için görüşme yapılabilir'
        ]
      };
      
      setAiAnalysis(analysis);
      setAiLoading(false);
    }, 3000);
  };

  const handleSendEmail = () => {
    const bestQuotation = quotations.find(q => q.supplier === aiAnalysis?.recommendation);
    const emailTemplate = `
Sayın ${selectedRequest?.requestedBy},

${selectedRequest?.title} talebiniz için gelen teklifler değerlendirilmiştir.

AI Analiz Sonucu:
- Önerilen Tedarikçi: ${aiAnalysis?.recommendation}
- Toplam Tutar: ₺${bestQuotation?.totalPrice.toLocaleString()}
- Teslimat Süresi: ${bestQuotation?.deliveryTime} gün
- Ödeme Koşulları: ${bestQuotation?.paymentTerms}

Detaylı karşılaştırma için sisteme giriş yapabilirsiniz.

Onayınızı bekliyoruz.

Satınalma Departmanı
    `;
    
    setEmailContent(emailTemplate);
    setEmailDialog(true);
  };

  const getBestPrice = () => {
    return Math.min(...quotations.map(q => q.totalPrice));
  };

  const getBestDelivery = () => {
    return Math.min(...quotations.map(q => q.deliveryTime));
  };

  const getPriceColor = (price) => {
    const bestPrice = getBestPrice();
    if (price === bestPrice) return 'success';
    if (price > bestPrice * 1.1) return 'error';
    return 'warning';
  };

  const getDeliveryColor = (days) => {
    const bestDelivery = getBestDelivery();
    if (days === bestDelivery) return 'success';
    if (days > bestDelivery * 1.5) return 'error';
    return 'warning';
  };

  return (
    <Grid container spacing={3}>
      {/* Başlık */}
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Teklif Karşılaştırma ve AI Analizi
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Gelen teklifleri karşılaştırın ve AI destekli analiz ile en uygun teklifi belirleyin.
        </Typography>
      </Grid>

      {/* Talep Bilgileri */}
      {selectedRequest && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">{selectedRequest.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedRequest.requestedBy}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Chip 
                    label={selectedRequest.priority === 'high' ? 'Yüksek Öncelik' : 'Normal'} 
                    color={selectedRequest.priority === 'high' ? 'error' : 'default'}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AIIcon />}
                    onClick={handleAIAnalysis}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'AI Analiz Yapılıyor...' : 'AI Analizi Başlat'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* AI Analiz Sonuçları */}
      {aiAnalysis && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                AI Analiz Sonuçları
              </Typography>
              
              <Grid container spacing={3}>
                {/* Öneri */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h6" gutterBottom>
                      <StarIcon sx={{ mr: 1 }} />
                      Önerilen Tedarikçi
                    </Typography>
                    <Typography variant="h4">{aiAnalysis.recommendation}</Typography>
                    <Typography variant="body2">{aiAnalysis.reasoning}</Typography>
                  </Paper>
                </Grid>

                {/* Fiyat Analizi */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      <MoneyIcon sx={{ mr: 1 }} />
                      Fiyat Analizi
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="En Düşük" 
                          secondary={aiAnalysis.priceAnalysis.lowest}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Tasarruf" 
                          secondary={aiAnalysis.priceAnalysis.savings}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                {/* Teslimat Analizi */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      <ScheduleIcon sx={{ mr: 1 }} />
                      Teslimat Analizi
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="En Hızlı" 
                          secondary={aiAnalysis.deliveryAnalysis.fastest}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Ortalama" 
                          secondary={`${aiAnalysis.deliveryAnalysis.average} gün`}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                {/* Riskler ve Fırsatlar */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="error">
                      ⚠️ Riskler
                    </Typography>
                    {aiAnalysis.risks.map((risk, index) => (
                      <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                        {risk}
                      </Alert>
                    ))}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="success.main">
                      💡 Fırsatlar
                    </Typography>
                    {aiAnalysis.opportunities.map((opportunity, index) => (
                      <Alert key={index} severity="info" sx={{ mb: 1 }}>
                        {opportunity}
                      </Alert>
                    ))}
                  </Paper>
                </Grid>
              </Grid>

              {/* Aksiyon Butonları */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<EmailIcon />}
                  onClick={handleSendEmail}
                >
                  Talep Edene Mail Gönder
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Analiz Raporunu İndir
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Teklif Karşılaştırma Tablosu */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <CompareIcon sx={{ mr: 1 }} />
              Teklif Karşılaştırması
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tedarikçi</TableCell>
                    <TableCell align="right">Toplam Fiyat</TableCell>
                    <TableCell align="center">Teslimat</TableCell>
                    <TableCell align="center">Ödeme</TableCell>
                    <TableCell align="center">Rating</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotations.map((quotation) => (
                    <TableRow 
                      key={quotation.id}
                      sx={{ 
                        bgcolor: aiAnalysis?.recommendation === quotation.supplier ? 'success.light' : 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {quotation.supplier}
                            {aiAnalysis?.recommendation === quotation.supplier && (
                              <StarIcon sx={{ ml: 1, color: 'warning.main' }} />
                            )}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {quotation.contactPerson}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {quotation.previousOrders} önceki sipariş
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`₺${quotation.totalPrice.toLocaleString()}`}
                          color={getPriceColor(quotation.totalPrice)}
                          icon={quotation.totalPrice === getBestPrice() ? <TrendingDownIcon /> : <TrendingUpIcon />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${quotation.deliveryTime} gün`}
                          color={getDeliveryColor(quotation.deliveryTime)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {quotation.paymentTerms}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {quotation.rating}
                          </Typography>
                          <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          %{quotation.onTimeDelivery} zamanında
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Detayları Görüntüle">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Onayla">
                            <IconButton size="small" color="success">
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reddet">
                            <IconButton size="small" color="error">
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* AI Loading */}
      {aiLoading && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Analiz Yapılıyor...
              </Typography>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Teklifler karşılaştırılıyor, fiyat analizi yapılıyor, tedarikçi güvenilirliği değerlendiriliyor...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Email Dialog */}
      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Talep Edene Mail Gönder</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EmailIcon />}
            onClick={() => {
              alert('Mail gönderildi!');
              setEmailDialog(false);
            }}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default QuotationComparison;

