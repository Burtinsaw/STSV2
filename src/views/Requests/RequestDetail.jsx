import React from 'react';
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
  ListItemText
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { updateRequestStatus } from 'store/requestSlice';
import { toast } from 'sonner';

// ==============================|| TALEP DETAY SAYFASI ||============================== //

const RequestDetail = () => {
  const { requestId } = useParams(); // URL'den talep ID'sini al
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux store'dan ilgili talebi bul
  const request = useSelector((state) =>
    state.request.requests.find(req => req.requestID === requestId)
  );

  if (!request) {
    return (
        <Paper sx={{p: 3}}>
            <Typography variant="h5" align="center">Talep Bulunamadı</Typography>
            <Typography align="center" color="text.secondary">Bu ID'ye sahip bir talep mevcut değil veya silinmiş olabilir.</Typography>
            <Box textAlign="center" mt={2}>
                <Button variant="outlined" onClick={() => navigate('/requests/list')} startIcon={<BackIcon />}>
                    Talep Listesine Geri Dön
                </Button>
            </Box>
        </Paper>
    );
  }

  const handleApprove = () => {
    dispatch(updateRequestStatus({ requestId: request.requestID, newStatus: 'Onaylandı' }));
    toast.success(`${request.requestID} numaralı talep onaylandı.`);
    navigate('/requests/pending'); // Onay sonrası listeye geri dön
  };

  const handleReject = () => {
    dispatch(updateRequestStatus({ requestId: request.requestID, newStatus: 'Reddedildi' }));
    toast.error(`${request.requestID} numaralı talep reddedildi.`);
    navigate('/requests/pending');
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
                        
                        <Grid item xs={12} mt={2}><Typography variant="h6">Ürünler ({request.products.length})</Typography><Divider /></Grid>
                        <Grid item xs={12}><List dense>{request.products.map(p=><ListItem key={p.id}><ListItemText primary={p.name} secondary={`Marka: ${p.brand || '-'}, Art: ${p.articleNumber || '-'}, Miktar: ${p.quantity} ${p.unit}`} /></ListItem>)}</List></Grid>
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
    </Paper>
  );
};

export default RequestDetail;
