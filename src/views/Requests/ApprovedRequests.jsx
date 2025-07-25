import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  ShoppingCart as ProcurementIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

// Services
import wdCloudService from '../../services/wdCloudService';

// ==============================|| ONAYLANAN TALEPLER ||============================== //

const ApprovedRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);

  // Mock data - onaylanan talepler
  const mockApprovedRequests = [
    {
      id: 1,
      requestCode: 'REQ-20241218-143052',
      title: 'Laptop ve Yazılım Lisansı Talebi',
      description: 'IT departmanı için 5 adet laptop ve Microsoft Office lisansı',
      requestedBy: 'Ahmet Yılmaz',
      companyName: 'TechCorp A.Ş.',
      contactPerson: 'Mehmet Demir',
      contactEmail: 'mehmet@techcorp.com',
      priority: 'high',
      status: 'quotation_received',
      createdDate: '2024-12-18',
      approvedDate: '2024-12-19',
      estimatedTotal: 85000,
      itemCount: 2,
      attachmentCount: 3,
      progress: 60,
      nextStep: 'Teklif Karşılaştırması'
    },
    {
      id: 2,
      requestCode: 'REQ-20241217-091234',
      title: 'Ofis Malzemeleri Talebi',
      description: 'Kırtasiye ve ofis ekipmanları',
      requestedBy: 'Ayşe Demir',
      companyName: 'İnnovatif Çözümler Ltd.',
      contactPerson: 'Ali Kaya',
      contactEmail: 'ali@innovatif.com',
      priority: 'medium',
      status: 'order_placed',
      createdDate: '2024-12-17',
      approvedDate: '2024-12-18',
      estimatedTotal: 12500,
      itemCount: 8,
      attachmentCount: 1,
      progress: 80,
      nextStep: 'Teslimat Bekleniyor'
    },
    {
      id: 3,
      requestCode: 'REQ-20241216-165432',
      title: 'Üretim Hattı Bakım Malzemeleri',
      description: 'Makine yedek parçaları ve bakım malzemeleri',
      requestedBy: 'Mehmet Kaya',
      companyName: 'Endüstri Pro A.Ş.',
      contactPerson: 'Fatma Özkan',
      contactEmail: 'fatma@endustripro.com',
      priority: 'urgent',
      status: 'completed',
      createdDate: '2024-12-16',
      approvedDate: '2024-12-17',
      estimatedTotal: 45000,
      itemCount: 12,
      attachmentCount: 5,
      progress: 100,
      nextStep: 'Tamamlandı'
    }
  ];

  const statusOptions = [
    { code: 'approved', name: 'Onaylandı', color: 'success' },
    { code: 'quotation_requested', name: 'Teklif İstendi', color: 'info' },
    { code: 'quotation_received', name: 'Teklif Alındı', color: 'warning' },
    { code: 'quotation_compared', name: 'Teklif Karşılaştırıldı', color: 'info' },
    { code: 'purchase_approved', name: 'Satınalma Onaylandı', color: 'success' },
    { code: 'order_placed', name: 'Sipariş Verildi', color: 'info' },
    { code: 'delivered', name: 'Teslim Edildi', color: 'success' },
    { code: 'invoiced', name: 'Faturalandı', color: 'warning' },
    { code: 'paid', name: 'Ödendi', color: 'success' },
    { code: 'completed', name: 'Tamamlandı', color: 'success' }
  ];

  const priorities = [
    { value: 'low', label: 'Düşük', color: 'success' },
    { value: 'medium', label: 'Orta', color: 'warning' },
    { value: 'high', label: 'Yüksek', color: 'error' },
    { value: 'urgent', label: 'Acil', color: 'error' }
  ];

  useEffect(() => {
    // Mock data yükle
    setRequests(mockApprovedRequests);
    setFilteredRequests(mockApprovedRequests);
  }, []);

  // Filtreleme
  useEffect(() => {
    let filtered = requests;

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.code === status) || { name: status, color: 'default' };
  };

  const getPriorityInfo = (priority) => {
    return priorities.find(p => p.value === priority) || { label: priority, color: 'default' };
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'success';
    if (progress >= 70) return 'info';
    if (progress >= 40) return 'warning';
    return 'error';
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailDialog(true);
  };

  const handleProcurement = (request) => {
    // Satınalma sürecine yönlendir
    navigate(`/procurement/quotations?requestCode=${request.requestCode}`);
  };

  const handleViewTimeline = (request) => {
    // Timeline sayfasına yönlendir (gelecekte eklenecek)
    alert(`${request.requestCode} için timeline görüntüleme özelliği yakında eklenecek.`);
  };

  return (
    <Grid container spacing={3}>
      {/* Başlık */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color="success" />
                  Onaylanan Talepler
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Onaylanan taleplerin süreç durumunu takip edin.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                    {filteredRequests.length} onaylı talep
                  </Alert>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* İstatistikler */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {requests.filter(r => r.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tamamlanan
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {requests.filter(r => r.status.includes('quotation')).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Teklif Aşamasında
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {requests.filter(r => r.status.includes('order')).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Sipariş Aşamasında
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  ₺{requests.reduce((sum, r) => sum + r.estimatedTotal, 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Toplam Tutar
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Filtreler */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Arama"
                  placeholder="Talep kodu, başlık, talep eden veya firma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    {statusOptions.map((status) => (
                      <MenuItem key={status.code} value={status.code}>
                        <Chip label={status.name} color={status.color} size="small" />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="textSecondary" align="center">
                  {filteredRequests.length} / {requests.length} talep
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Onaylanan Talepler Tablosu */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request Kodu</TableCell>
                    <TableCell>Başlık</TableCell>
                    <TableCell>Talep Eden</TableCell>
                    <TableCell>Firma</TableCell>
                    <TableCell align="center">Durum</TableCell>
                    <TableCell align="center">İlerleme</TableCell>
                    <TableCell align="right">Tutar</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const statusInfo = getStatusInfo(request.status);
                    const priorityInfo = getPriorityInfo(request.priority);
                    
                    return (
                      <TableRow key={request.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" color="primary">
                            {request.requestCode}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Onay: {request.approvedDate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {request.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {request.itemCount} ürün • {request.attachmentCount} dosya
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.requestedBy}
                          </Typography>
                          <Chip
                            label={priorityInfo.label}
                            color={priorityInfo.color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.companyName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {request.contactPerson}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={statusInfo.name}
                            color={statusInfo.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={request.progress}
                              color={getProgressColor(request.progress)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {request.progress}% • {request.nextStep}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2">
                            ₺{request.estimatedTotal.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Detayları Görüntüle">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(request)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Satınalma Süreci">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleProcurement(request)}
                              >
                                <ProcurementIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Süreç Timeline">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleViewTimeline(request)}
                              >
                                <TimelineIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Detay Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Onaylı Talep Detayları
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedRequest.title}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {selectedRequest.requestCode}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>İlerleme Durumu:</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedRequest.progress}
                    color={getProgressColor(selectedRequest.progress)}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {selectedRequest.progress}% tamamlandı • {selectedRequest.nextStep}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {selectedRequest.description}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Talep Eden:</Typography>
                <Typography variant="body2">{selectedRequest.requestedBy}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Firma:</Typography>
                <Typography variant="body2">{selectedRequest.companyName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">İletişim Kişisi:</Typography>
                <Typography variant="body2">{selectedRequest.contactPerson}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Email:</Typography>
                <Typography variant="body2">{selectedRequest.contactEmail}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Onay Tarihi:</Typography>
                <Typography variant="body2">{selectedRequest.approvedDate}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Tahmini Toplam:</Typography>
                <Typography variant="body2">₺{selectedRequest.estimatedTotal.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Öncelik:</Typography>
                <Chip
                  label={getPriorityInfo(selectedRequest.priority).label}
                  color={getPriorityInfo(selectedRequest.priority).color}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Mevcut Durum:</Typography>
                <Chip
                  label={getStatusInfo(selectedRequest.status).name}
                  color={getStatusInfo(selectedRequest.status).color}
                  size="small"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>
            Kapat
          </Button>
          {selectedRequest && (
            <>
              <Button
                variant="outlined"
                startIcon={<TimelineIcon />}
                onClick={() => {
                  setDetailDialog(false);
                  handleViewTimeline(selectedRequest);
                }}
              >
                Timeline
              </Button>
              <Button
                variant="contained"
                startIcon={<ProcurementIcon />}
                onClick={() => {
                  setDetailDialog(false);
                  handleProcurement(selectedRequest);
                }}
              >
                Satınalma Süreci
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ApprovedRequests;

