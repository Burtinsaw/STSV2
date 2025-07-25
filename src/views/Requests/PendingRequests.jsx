import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [comment, setComment] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Mock data
  useEffect(() => {
    const mockRequests = [
      {
        id: 'REQ-20240722-001',
        title: 'Ofis Malzemeleri Talebi',
        requesterName: 'Ahmet Yılmaz',
        companyName: 'ABC Şirketi',
        priority: 'medium',
        createdDate: '2024-07-22',
        waitingDays: 1,
        description: 'Ofis için kırtasiye malzemeleri gerekli. Kalem, kağıt, dosya vs.',
        estimatedCost: '₺2,500'
      },
      {
        id: 'REQ-20240722-004',
        title: 'Yazılım Lisansları',
        requesterName: 'Fatma Özkan',
        companyName: 'Tech Solutions',
        priority: 'high',
        createdDate: '2024-07-21',
        waitingDays: 2,
        description: 'Microsoft Office ve Adobe Creative Suite lisansları',
        estimatedCost: '₺15,000'
      },
      {
        id: 'REQ-20240722-005',
        title: 'Güvenlik Kameraları',
        requesterName: 'Ali Vural',
        companyName: 'Güvenlik A.Ş.',
        priority: 'urgent',
        createdDate: '2024-07-20',
        waitingDays: 3,
        description: 'Ofis güvenliği için IP kamera sistemi kurulumu',
        estimatedCost: '₺8,750'
      }
    ];
    setRequests(mockRequests);
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'low':
        return 'Düşük';
      case 'medium':
        return 'Orta';
      case 'high':
        return 'Yüksek';
      case 'urgent':
        return 'Acil';
      default:
        return priority;
    }
  };

  const getWaitingColor = (days) => {
    if (days <= 1) return 'success';
    if (days <= 3) return 'warning';
    return 'error';
  };

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setOpenDialog(true);
    setComment('');
  };

  const handleConfirmAction = () => {
    const actionText = actionType === 'approve' ? 'onaylandı' : 'reddedildi';
    
    // Remove from pending requests
    setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
    
    // Show success message
    setAlertMessage(`${selectedRequest.title} talebi ${actionText}.`);
    setShowAlert(true);
    
    // Close dialog
    setOpenDialog(false);
    
    // Hide alert after 3 seconds
    setTimeout(() => setShowAlert(false), 3000);
    
    console.log(`Talep ${actionText}:`, {
      request: selectedRequest,
      action: actionType,
      comment: comment
    });
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setActionType('view');
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTimeIcon />
        Bekleyen Talepler
      </Typography>

      {showAlert && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {alertMessage}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Talep No</strong></TableCell>
                  <TableCell><strong>Başlık</strong></TableCell>
                  <TableCell><strong>Talep Eden</strong></TableCell>
                  <TableCell><strong>Firma</strong></TableCell>
                  <TableCell><strong>Öncelik</strong></TableCell>
                  <TableCell><strong>Bekleme Süresi</strong></TableCell>
                  <TableCell><strong>Tahmini Maliyet</strong></TableCell>
                  <TableCell><strong>İşlemler</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {request.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.description.substring(0, 40)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{request.requesterName}</TableCell>
                    <TableCell>{request.companyName}</TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityText(request.priority)}
                        color={getPriorityColor(request.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${request.waitingDays} gün`}
                        color={getWaitingColor(request.waitingDays)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {request.estimatedCost}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(request)}
                        >
                          Detay
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleAction(request, 'approve')}
                        >
                          Onayla
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleAction(request, 'reject')}
                        >
                          Reddet
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {requests.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Bekleyen talep bulunmuyor.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'view' && 'Talep Detayları'}
          {actionType === 'approve' && 'Talebi Onayla'}
          {actionType === 'reject' && 'Talebi Reddet'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Talep No
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Başlık
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.title}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Talep Eden
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.requesterName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Firma
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.companyName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Açıklama
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Öncelik
                </Typography>
                <Chip
                  label={getPriorityText(selectedRequest.priority)}
                  color={getPriorityColor(selectedRequest.priority)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tahmini Maliyet
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.estimatedCost}
                </Typography>
              </Grid>
              
              {(actionType === 'approve' || actionType === 'reject') && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={`${actionType === 'approve' ? 'Onay' : 'Red'} Nedeni (İsteğe bağlı)`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`${actionType === 'approve' ? 'Onay' : 'Red'} sebebinizi yazabilirsiniz...`}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {actionType === 'view' ? 'Kapat' : 'İptal'}
          </Button>
          {(actionType === 'approve' || actionType === 'reject') && (
            <Button
              variant="contained"
              color={actionType === 'approve' ? 'success' : 'error'}
              onClick={handleConfirmAction}
            >
              {actionType === 'approve' ? 'Onayla' : 'Reddet'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingRequests;

