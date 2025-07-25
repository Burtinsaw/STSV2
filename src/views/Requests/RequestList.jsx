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
  DialogActions
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Services
import wdCloudService from '../../services/wdCloudService';

// ==============================|| TALEP LİSTESİ ||============================== //

const RequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);

  // Mock data - gerçek uygulamada API'den gelecek
  const mockRequests = [
    {
      id: 1,
      requestCode: 'REQ-20241221-143052',
      title: 'Laptop ve Yazılım Lisansı Talebi',
      description: 'IT departmanı için 5 adet laptop ve Microsoft Office lisansı',
      requestedBy: 'Ahmet Yılmaz',
      department: 'Bilgi İşlem',
      category: 'Bilişim Teknolojileri',
      priority: 'high',
      status: 'quotation_received',
      createdDate: '2024-12-21',
      estimatedTotal: 85000,
      itemCount: 2,
      attachmentCount: 3
    },
    {
      id: 2,
      requestCode: 'REQ-20241220-091234',
      title: 'Ofis Malzemeleri Talebi',
      description: 'Kırtasiye ve ofis ekipmanları',
      requestedBy: 'Ayşe Demir',
      department: 'İnsan Kaynakları',
      category: 'Ofis Malzemeleri',
      priority: 'medium',
      status: 'approved',
      createdDate: '2024-12-20',
      estimatedTotal: 12500,
      itemCount: 8,
      attachmentCount: 1
    },
    {
      id: 3,
      requestCode: 'REQ-20241219-165432',
      title: 'Üretim Hattı Bakım Malzemeleri',
      description: 'Makine yedek parçaları ve bakım malzemeleri',
      requestedBy: 'Mehmet Kaya',
      department: 'Üretim',
      category: 'Makine ve Ekipman',
      priority: 'urgent',
      status: 'under_review',
      createdDate: '2024-12-19',
      estimatedTotal: 45000,
      itemCount: 12,
      attachmentCount: 5
    }
  ];

  const statusOptions = wdCloudService.getRequestStatuses();
  const priorities = [
    { value: 'low', label: 'Düşük', color: 'success' },
    { value: 'medium', label: 'Orta', color: 'warning' },
    { value: 'high', label: 'Yüksek', color: 'error' },
    { value: 'urgent', label: 'Acil', color: 'error' }
  ];

  useEffect(() => {
    // Mock data yükle
    setRequests(mockRequests);
    setFilteredRequests(mockRequests);
  }, []);

  // Filtreleme
  useEffect(() => {
    let filtered = requests;

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Öncelik filtresi
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, priorityFilter, requests]);

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.code === status) || { name: status, color: 'default' };
  };

  const getPriorityInfo = (priority) => {
    return priorities.find(p => p.value === priority) || { label: priority, color: 'default' };
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailDialog(true);
  };

  const handleEdit = (request) => {
    // Edit sayfasına yönlendir
    navigate(`/requests/edit/${request.id}`);
  };

  const handleDelete = (request) => {
    if (window.confirm(`${request.requestCode} kodlu talebi silmek istediğinizden emin misiniz?`)) {
      setRequests(prev => prev.filter(r => r.id !== request.id));
    }
  };

  const handleDownloadFiles = async (request) => {
    try {
      // WD Cloud'dan dosyaları listele ve indir
      const result = await wdCloudService.listRequestFiles(request.requestCode);
      if (result.success && result.files.length > 0) {
        alert(`${result.files.length} dosya bulundu. İndirme işlemi başlatılıyor...`);
        // Dosya indirme işlemi burada yapılacak
      } else {
        alert('Bu talep için dosya bulunamadı.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Dosya indirme başarısız: ' + error.message);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Başlık */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h4" gutterBottom>
                  Talep Listesi
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tüm talepleri görüntüleyin, filtreleyin ve yönetin.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/requests/enhanced-new')}
                  >
                    Yeni Talep
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Filtreler */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Arama"
                  placeholder="Talep kodu, başlık veya talep eden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Chip label={priority.label} color={priority.color} size="small" />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="textSecondary">
                  {filteredRequests.length} / {requests.length} talep
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Talep Tablosu */}
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
                    <TableCell>Departman</TableCell>
                    <TableCell align="center">Öncelik</TableCell>
                    <TableCell align="center">Durum</TableCell>
                    <TableCell align="right">Tutar</TableCell>
                    <TableCell align="center">Tarih</TableCell>
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
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.department}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={priorityInfo.label}
                            color={priorityInfo.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={statusInfo.name}
                            color={statusInfo.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2">
                            ₺{request.estimatedTotal.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {request.createdDate}
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
                            <Tooltip title="Düzenle">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(request)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Dosyaları İndir">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadFiles(request)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(request)}
                              >
                                <DeleteIcon />
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
          Talep Detayları
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
                <Typography variant="body1">
                  {selectedRequest.description}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Talep Eden:</Typography>
                <Typography variant="body2">{selectedRequest.requestedBy}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Departman:</Typography>
                <Typography variant="body2">{selectedRequest.department}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Kategori:</Typography>
                <Typography variant="body2">{selectedRequest.category}</Typography>
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
                <Typography variant="subtitle2">Durum:</Typography>
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
            <Button
              variant="contained"
              onClick={() => handleDownloadFiles(selectedRequest)}
            >
              Dosyaları İndir
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default RequestList;

