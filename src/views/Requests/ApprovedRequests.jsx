import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TablePagination,
  Alert,
  Typography
} from '@mui/material';
import { Visibility as ViewIcon, HourglassEmpty, CheckCircle, Cancel } from '@mui/icons-material';

// Talep durumlarına göre renk ve ikon belirleme
const getStatusChip = (status) => {
  const statusMap = {
    pending_review: { label: 'Onay Bekliyor', color: 'warning', icon: <HourglassEmpty /> },
    approved_for_sourcing: { label: 'Satınalmada', color: 'success', icon: <CheckCircle /> },
    rejected: { label: 'Reddedildi', color: 'error', icon: <Cancel /> },
  };
  const { label, color, icon } = statusMap[status] || { label: status, color: 'default', icon: null };
  return <Chip label={label} color={color} icon={icon} size="small" />;
};

import { Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRequests } from '../../store/requestSlice';

const ApprovedRequests = () => {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.request);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const approved = requests.filter(req => (req.status || req.durum) === 'Onaylandı');

  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleViewDetails = (requestId) => { navigate(`/requests/detail/${requestId}`); };

  const paginatedRequests = approved.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card>
      <CardHeader title="Onaylanmış Talepler" />
      <CardContent>
        {loading ? (
          <Typography>Yükleniyor...</Typography>
        ) : error ? (
          <Alert severity="error">{error.message || 'Talepler yüklenirken bir hata oluştu.'}</Alert>
        ) : approved.length === 0 ? (
          <Alert severity="info">Onaylanmış bir talep bulunmuyor.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Talep ID</TableCell>
                  <TableCell>Başlık</TableCell>
                  <TableCell>Oluşturan</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRequests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>{req.requestID || req.id}</TableCell>
                    <TableCell>{req.title || req.talepBasligi}</TableCell>
                    <TableCell>{req.internalRequester?.name || req.talepSahibiAd}</TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>{getStatusChip(req.status || req.durum)}</TableCell>
                    <TableCell align="right">
                      <Button variant="outlined" size="small" startIcon={<ViewIcon />} onClick={() => handleViewDetails(req.id)}>
                        Detay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={approved.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sayfa başına satır:"
            />
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovedRequests;
