import React from 'react';
import { useSelector } from 'react-redux';
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
  // Adım 2: useSelector ile Redux store'daki 'requests' dizisini çekiyoruz.
  // state.request.requests yolu, reducer.js ve requestSlice.js'deki isimlendirmelerden gelir.
  const { requests } = useSelector((state) => state.request);

  return (
    <Card>
      <CardHeader title="Tüm Talepler" />
      <CardContent>
        {requests.length === 0 ? (
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
                {/* Adım 3: Çektiğimiz 'requests' dizisini map ile dönerek tabloya yazdırıyoruz. */}
                {requests.map((request) => (
                  <TableRow key={request.requestID}>
                    <TableCell>
                      <Typography variant="subtitle2">{request.requestID}</Typography>
                    </TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.internalRequester.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={request.status === 'Onay Bekliyor' ? 'warning' : 'primary'} 
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
