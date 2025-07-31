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
  Tooltip
} from '@mui/material';
import { Gavel as ManageIcon, CheckCircle, PlaylistAddCheck as OffersIcon } from '@mui/icons-material';

// Bu bileşen, durumu 'approved_for_sourcing' olan talepleri listeler.
const QuotationComparison = () => {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const allRequests = JSON.parse(localStorage.getItem('purchaseRequests') || '[]');
    const approved = allRequests.filter(req => req && req.id && req.status === 'approved_for_sourcing');
    
    // Her talep için teklif sayısını da al
    const requestsWithOfferCount = approved.map(req => {
      const offers = JSON.parse(localStorage.getItem(`offers_${req.id}`) || '[]');
      return { ...req, offerCount: offers.length };
    });

    const sorted = requestsWithOfferCount.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    setRequests(sorted);
  }, []);

  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleManageOffers = (requestId) => {
    navigate(`/procurement/manage/${requestId}`);
  };

  const paginatedRequests = requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader title="Satınalma Paneli (Onaylanmış Talepler)" />
        <CardContent>
          {requests.length === 0 ? (
            <Alert severity="info">Satınalma sürecinde olan bir talep bulunmuyor.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Talep ID</TableCell>
                    <TableCell>Başlık</TableCell>
                    <TableCell>Talep Eden</TableCell>
                    <TableCell>Teklif Sayısı</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell>#{req.id.toString().slice(-6)}</TableCell>
                      <TableCell>{req.title}</TableCell>
                      <TableCell>{req.requesterName || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip icon={<OffersIcon />} label={req.offerCount} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label="Satınalmada" color="success" icon={<CheckCircle />} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ManageIcon />}
                          onClick={() => handleManageOffers(req.id)}
                        >
                          Teklifleri Yönet
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

export default QuotationComparison;
