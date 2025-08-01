import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardHeader,
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
  Box
} from '@mui/material';
import { Visibility as EyeIcon } from '@mui/icons-material';

// ==============================|| ONAY BEKLEYEN TALEPLER SAYFASI ||============================== //

const PendingRequests = () => {
  // Redux store'dan tüm talepleri çekiyoruz.
  // state.request yolu, ana reducer'daki isimlendirmeden gelir.
  const { requests } = useSelector((state) => state.request);

  // Sadece "Onay Bekliyor" statüsündeki talepleri filtreliyoruz.
  const pending = requests.filter(req => (req.status || req.durum) === 'Onay Bekliyor');

  return (
    <Card>
      <CardHeader title="Onay Bekleyen Talepler" />
      <CardContent>
        {pending.length === 0 ? (
          <Box textAlign="center" p={3}>
            <Typography variant="body1" color="text.secondary">
              Onay bekleyen bir talep bulunmuyor.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Talep ID</TableCell>
                  <TableCell>Başlık</TableCell>
                  <TableCell>Oluşturan</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pending.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{request.requestID}</Typography>
                    </TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.internalRequester.name}</TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        component={RouterLink}
                        to={`/requests/detail/${request.id}`}
                        startIcon={<EyeIcon />}
                      >
                        İncele
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingRequests;
