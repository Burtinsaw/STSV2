import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon, ArrowBack as BackIcon, Edit as EditIcon } from '@mui/icons-material';
import { fetchRequestById, updateRequestStatus, updateRequestProducts } from 'store/requestSlice';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

// ==============================|| TALEP DETAY SAYFASI ||============================== //

const RequestDetail = () => {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { currentRequest: request, loading, error } = useSelector((state) => state.request);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editableProducts, setEditableProducts] = useState([]);

  useEffect(() => {
    if (requestId) {
      dispatch(fetchRequestById(requestId));
    }
  }, [dispatch, requestId]);

  const handleApprove = () => {
    dispatch(updateRequestStatus({ id: request.id, status: 'Onaylandı' }));
    toast.success(`${request.requestID} numaralı talep onaylandı.`);
    navigate('/requests/pending');
  };

  const handleReject = () => {
    dispatch(updateRequestStatus({ id: request.id, status: 'Reddedildi' }));
    toast.error(`${request.requestID} numaralı talep reddedildi.`);
    navigate('/requests/pending');
  };

  const handleOpenEditDialog = () => {
    setEditableProducts(JSON.parse(JSON.stringify(request.products)));
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <Typography>Yükleniyor...</Typography>;
  }

  if (error || !request) {
    return (
        <Paper sx={{p: 3}}>
            <Typography variant="h5" align="center">Talep Bulunamadı</Typography>
            <Typography align="center" color="text.secondary">{error?.message || "Bu ID'ye sahip bir talep mevcut değil veya silinmiş olabilir."}</Typography>
            <Box textAlign="center" mt={2}>
                <Button variant="outlined" onClick={() => navigate('/requests/list')} startIcon={<BackIcon />}>
                    Talep Listesine Geri Dön
                </Button>
            </Box>
        </Paper>
    );
  }

  const handleSaveEditedProducts = () => {
    dispatch(updateRequestProducts({ requestId: request.id, products: editableProducts }));
    setIsEditDialogOpen(false);
    toast.success('Ürünler başarıyla güncellendi.');
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editableProducts];
    updatedProducts[index][field] = value;
    setEditableProducts(updatedProducts);
  };

  return (
    <Paper sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Talep Detayı</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<BackIcon />}>Geri</Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
            <Card>
                <CardHeader title={request.title} subheader={`Talep ID: ${request.requestID}`} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}><Typography variant="h6">Talep Bilgileri</Typography><Divider /></Grid>
                        <Grid item xs={4}><Typography color="text.secondary">Açıklama:</Typography></Grid><Grid item xs={8}><Typography sx={{whiteSpace: 'pre-wrap'}}>{request.description || '-'}</Typography></Grid>
                        <Grid item xs={4}><Typography color="text.secondary">Statü:</Typography></Grid><Grid item xs={8}><Chip label={request.status} color={request.status === 'Onay Bekliyor' ? 'warning' : (request.status === 'Onaylandı' ? 'success' : 'error')} size="small" /></Grid>
                        
                        <Grid item xs={12} mt={2}><Typography variant="h6">Kişi Bilgileri</Typography><Divider /></Grid>
                        <Grid item xs={4}><Typography color="text.secondary">Talep Sahibi Firma:</Typography></Grid><Grid item xs={8}><Typography>{request.externalCompanyName}</Typography></Grid>
                        <Grid item xs={4}><Typography color="text.secondary">İlgili Kişi (Firma):</Typography></Grid><Grid item xs={8}><Typography>{request.externalRequesterName}</Typography></Grid>
                        <Grid item xs={4}><Typography color="text.secondary">Sisteme Giren:</Typography></Grid><Grid item xs={8}><Typography>{request.internalRequester.name} ({request.internalRequester.department})</Typography></Grid>
                        
                        <Grid item xs={12} mt={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Ürünler ({request.products.length})</Typography>
                            {user.role === 'admin' || user.role === 'satin_alma_muduru' ? (
                              <Button variant="text" size="small" startIcon={<EditIcon />} onClick={handleOpenEditDialog}>
                                Ürünleri Düzenle
                              </Button>
                            ) : null}
                          </Box>
                          <Divider />
                        </Grid>
                        <Grid item xs={12}>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Ürün Adı</TableCell>
                                  <TableCell>Marka</TableCell>
                                  <TableCell>Model/Artikel No</TableCell>
                                  <TableCell align="right">Miktar</TableCell>
                                  <TableCell>Birim</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {request.products.map((p) => (
                                  <TableRow key={p.id}>
                                    <TableCell component="th" scope="row">{p.name}</TableCell>
                                    <TableCell>{p.brand || '-'}</TableCell>
                                    <TableCell>{p.articleNumber || '-'}</TableCell>
                                    <TableCell align="right">{p.quantity}</TableCell>
                                    <TableCell>{p.unit}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                    </Grid>
                    {request.status === 'Onay Bekliyor' && (
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button variant="contained" color="error" startIcon={<RejectIcon />} onClick={handleReject}>Reddet</Button>
                            <Button variant="contained" color="success" startIcon={<ApproveIcon />} onClick={handleApprove}>Onayla</Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Grid>
      </Grid>

      {/* Ürün Düzenleme Diyalogu */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Ürünleri Düzenle</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ürün Adı</TableCell>
                  <TableCell>Marka</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Miktar</TableCell>
                  <TableCell>Birim</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editableProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell><TextField size="small" value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" value={product.brand} onChange={(e) => handleProductChange(index, 'brand', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" value={product.articleNumber} onChange={(e) => handleProductChange(index, 'articleNumber', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" type="number" value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" value={product.unit} onChange={(e) => handleProductChange(index, 'unit', e.target.value)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSaveEditedProducts} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RequestDetail;
