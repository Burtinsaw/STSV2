import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRequests } from '../../store/requestSlice';
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
  Chip
} from '@mui/material';

// ==============================|| TALEP LİSTESİ SAYFASI ||============================== //

const RequestList = () => {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.request);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  // DEBUG: requests dizisini ekrana yazdır
  console.log('Tüm Talepler:', requests);

  return (
    <Card>
      <CardHeader title="Tüm Talepler" />
      <CardContent>
        {loading ? (
          <Typography variant="body1" align="center">Yükleniyor...</Typography>
        ) : error ? (
          <Typography variant="body1" color="error" align="center">Hata: {error.message || error}</Typography>
        ) : requests.length === 0 ? (
          <Typography variant="body1" align="center">
            Henüz oluşturulmuş bir talep bulunmuyor.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Talep ID</TableCell>
                  <TableCell>Başlık</TableCell>
                  <TableCell>Oluşturan</TableCell>
                  <TableCell>Statü</TableCell>
                  <TableCell>Tarih</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.requestID || request.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{request.requestID || request.id}</Typography>
                    </TableCell>
                    <TableCell>{request.title || request.talepBasligi}</TableCell>
                    <TableCell>
                      {request.internalRequester?.name || request.talepSahibiAd || request.firma || request.userId}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status || request.durum} 
                        color={(request.status || request.durum) === 'Onay Bekliyor' ? 'warning' : 'primary'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString('tr-TR')}</TableCell>
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

export default RequestList;
