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
  Alert
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

const ApprovedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const allRequests = JSON.parse(localStorage.getItem('purchaseRequests') || '[]');
    
    // DÜZELTME: Sadece geçerli bir 'id'ye sahip olan talepleri filtrele
    const validRequests = allRequests.filter(req => req && req.id !== undefined && req.id !== null);

    const filtered = validRequests.filter(req => req.status === 'approved_for_sourcing');
    const sorted = filtered.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    setRequests(sorted);
  }, []);

  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleViewDetails = (requestId) => { navigate(`/requests/detail/${requestId}`); };

  const paginatedRequests = requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader title="Onaylanmış ve Satınalmadaki Talepler" />
        <CardContent>
          {requests.length === 0 ? (
            <Alert severity="info">Onaylanmış bir talep bulunmuyor.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Talep ID</TableCell>
                    <TableCell>Başlık</TableCell>
                    <TableCell>Talep Eden</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell>{req.id ? `#${req.id.toString().slice(-6)}` : 'N/A'}</TableCell>
                      <TableCell>{req.title}</TableCell>
                      <TableCell>{req.requesterName || 'N/A'}</TableCell>
                      <TableCell>{new Date(req.requestDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{getStatusChip(req.status)}</TableCell>
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
                count={requests.length}
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
    </Box>
  );
};

export default ApprovedRequests;
