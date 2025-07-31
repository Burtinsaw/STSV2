import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  MonetizationOn,
  LocalShipping,
  CompareArrows,
  EmojiEvents,
  Mail as MailIcon,
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import html2pdf from 'html2pdf.js';
import axios from 'axios'; // Axios'u import ettiğinizden emin olun

// Teklifleri işlemek için AI servisi (Bu kısım değişmeden kalabilir)
class OfferProcessingService {
    constructor() {
        this.geminiApiKey = import.meta.env?.VITE_GEMINI_API_KEY || '';
    }
    // ... Sizin parseFile ve extractOfferDetailsWithAI fonksiyonlarınız burada...
}
const offerService = new OfferProcessingService();


const OfferManagement = () => {
  const { id } = useParams(); // Talep ID'si
  const navigate = useNavigate();

  // STATE'LER
  const [request, setRequest] = useState(null); // Ana Talep bilgisi
  const [offers, setOffers] = useState([]);   // Talebe ait teklifler
  const [companies, setCompanies] = useState([]); // Şirket listesi
  const [bankAccounts, setBankAccounts] = useState([]); // Banka hesapları
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [open, setOpen] = useState(false); // Yeni teklif dialog'u
  const [openProforma, setOpenProforma] = useState(false); // Proforma dialog'u
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [newOffer, setNewOffer] = useState({ supplierName: '', price: '', currency: 'TRY', deliveryTime: '', notes: '' });
  const fileInputRef = useRef(null);
  const proformaRef = useRef(null);

  // --- VERİ ÇEKME FONKSİYONU (API Entegrasyonu) ---
  const fetchData = async () => {
    try {
      // Backend'den hem talep hem de teklif verilerini çekiyoruz
      // NOT: Bu endpoint'i de oluşturmanız gerekecek (örn: talepController.js içinde)
      const requestRes = await axios.get(`/api/talepler/${id}`);
      const offersRes = await axios.get(`/api/offers/talep/${id}`);
      const companiesRes = await axios.get('/api/companies'); // Tüm firmaları çek

      setRequest(requestRes.data);
      setOffers(offersRes.data);
      setCompanies(companiesRes.data);
      
      // Gerekirse banka hesaplarını da çekebilirsiniz
      // const bankAccountsRes = await axios.get('/api/bank-accounts');
      // setBankAccounts(bankAccountsRes.data);

    } catch (error) {
      console.error("Veri alınırken hata oluştu:", error);
      showSnackbar(error.response?.data?.message || 'Veriler yüklenemedi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [id]);

  // --- YARDIMCI FONKSİYONLAR ---
  const showSnackbar = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };
  const handleOpenDialog = () => setOpen(true);
  const handleCloseDialog = () => {
    setOpen(false);
    setNewOffer({ supplierName: '', price: '', currency: 'TRY', deliveryTime: '', notes: '' });
  };

  // --- CRUD FONKSİYONLARI (API Entegrasyonu) ---
  const handleAddOffer = async () => {
    if (!newOffer.supplierName || !newOffer.price) {
      showSnackbar('Tedarikçi ve Fiyat alanları zorunludur.', 'warning');
      return;
    }
    try {
        const { data: addedOffer } = await axios.post(`/api/offers/talep/${id}`, newOffer);
        setOffers(prevOffers => [...prevOffers, addedOffer]); // State'i backend'den dönen veriyle güncelle
        handleCloseDialog();
        showSnackbar('Yeni teklif başarıyla eklendi.', 'success');
    } catch (error) {
        showSnackbar(error.response?.data?.message || 'Teklif eklenirken bir hata oluştu.', 'error');
    }
  };
  
  const handleSelectOffer = async (offerId) => {
    try {
        await axios.put(`/api/offers/select/${offerId}`);
        showSnackbar('Teklif seçildi ve onaylandı.', 'success');
        // Değişikliklerin arayüze yansıması için verileri yeniden çekiyoruz
        setIsLoading(true);
        fetchData();
    } catch (error) {
        showSnackbar(error.response?.data?.message || 'Teklif seçimi sırasında bir hata oluştu.', 'error');
    }
  };

  // --- AI & PDF FONKSİYONLARI (Değişiklik Gerekmiyor) ---
  const handleAiCompare = () => { /* ... Mevcut kodunuz ... */ };
  const handleGenerateProforma = () => { /* ... Mevcut kodunuz ... */ };
  const handleExportPdf = () => { /* ... Mevcut kodunuz ... */ };
  const handleOfferFileImport = async (event) => { /* ... Mevcut kodunuz ... */ };

  // --- RENDER ---
  if (isLoading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  if (!request) return <Alert severity="error">Talep bulunamadı veya yüklenemedi.</Alert>;

  const isOfferSelected = offers.some(o => o.status === 'selected');
  const selectedOffer = offers.find(o => o.status === 'selected');
  // Satıcı ve alıcı firma bilgilerini API'den gelen verilerle bulma
  const sellerCompany = companies.find(c => c.name.includes("ALÜMTAŞ"));
  const buyerCompany = companies.find(c => c.name === selectedOffer?.supplierName);

  return (
    <Box sx={{ p: 3 }}>
        <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleOfferFileImport}
            accept="image/*,application/pdf,.doc,.docx"
        />
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Geri Dön
        </Button>
        
        {isOfferSelected && request.status !== 'proforma_generated' && (
            <Alert
                severity="success"
                action={
                <Button color="inherit" size="small" startIcon={<MailIcon />} onClick={() => setOpenProforma(true)}>
                    Proforma Oluştur ve Gönder
                </Button>
                }
                sx={{ mb: 2 }}
            >
                Teklif seçimi tamamlandı. Şimdi proforma oluşturabilirsiniz.
            </Alert>
        )}

        <Card>
            <CardHeader
                title={`Alınan Teklifler: ${request.talepBasligi}`}
                action={
                    <Box sx={{display: 'flex', gap: 1}}>
                        <Button variant="outlined" startIcon={<CompareArrows />} onClick={handleAiCompare} disabled={isOfferSelected}>
                            AI ile Karşılaştır
                        </Button>
                        <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => fileInputRef.current.click()} disabled={isOfferSelected || isProcessingFile}>
                            {isProcessingFile ? 'İşleniyor...' : 'Dosyadan Aktar'}
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog} disabled={isOfferSelected}>
                            Manuel Ekle
                        </Button>
                    </Box>
                }
            />
            <CardContent>
                {offers.length === 0 ? (
                    <Alert severity="info">Bu talep için henüz bir teklif eklenmedi.</Alert>
                ) : (
                    <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tedarikçi</TableCell>
                                <TableCell>Fiyat</TableCell>
                                <TableCell>Teslim Süresi</TableCell>
                                <TableCell>Durum</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {offers.map(offer => (
                            <TableRow key={offer.id} selected={offer.status === 'selected'} sx={{ backgroundColor: offer.isBestOffer ? 'rgba(232, 245, 233, 0.5)' : 'inherit' }}>
                                <TableCell>{offer.supplierName}</TableCell>
                                <TableCell><Chip icon={<MonetizationOn />} label={`${offer.price} ${offer.currency}`} size="small" /></TableCell>
                                <TableCell><Chip icon={<LocalShipping />} label={offer.deliveryTime || 'Belirtilmedi'} size="small" /></TableCell>
                                <TableCell>
                                    {offer.status === 'selected' && <Chip icon={<EmojiEvents />} label="Seçildi" color="success" size="small" />}
                                    {offer.status === 'rejected' && <Chip label="Reddedildi" color="error" variant="outlined" size="small" />}
                                    {offer.status === 'pending' && <Chip label="Beklemede" color="default" size="small" />}
                                    {offer.isBestOffer && <Chip label="AI Önerisi" color="info" size="small" variant="outlined" sx={{ml: 1}} />}
                                </TableCell>
                                <TableCell align="right">
                                    {!isOfferSelected && (
                                    <Button size="small" variant="contained" color="primary" onClick={() => handleSelectOffer(offer.id)}>
                                        Onayla
                                    </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>

        {/* --- DIALOG'LAR --- */}
        {/* Yeni Teklif Ekleme Dialog'u */}
        <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
            <DialogTitle>Yeni Teklif Ekle</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}><TextField fullWidth label="Tedarikçi Adı *" value={newOffer.supplierName} onChange={e => setNewOffer({...newOffer, supplierName: e.target.value})} /></Grid>
                    <Grid item xs={8}><TextField fullWidth label="Fiyat *" type="number" value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: e.target.value})} /></Grid>
                    <Grid item xs={4}><TextField fullWidth label="Para Birimi" value={newOffer.currency} onChange={e => setNewOffer({...newOffer, currency: e.target.value})} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Teslim Süresi" value={newOffer.deliveryTime} onChange={e => setNewOffer({...newOffer, deliveryTime: e.target.value})} /></Grid>
                    <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Notlar" value={newOffer.notes} onChange={e => setNewOffer({...newOffer, notes: e.target.value})} /></Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>İptal</Button>
                <Button onClick={handleAddOffer} variant="contained">Ekle</Button>
            </DialogActions>
        </Dialog>

        {/* Proforma Önizleme Dialog'u (Bu kısım büyük ölçüde aynı kalabilir) */}
        <Dialog open={openProforma} onClose={() => setOpenProforma(false)} fullWidth maxWidth="md">
           {/* ... Sizin Proforma Dialog içeriğiniz ... */}
        </Dialog>
        
        {/* Bildirim (Snackbar) */}
        <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
                {notification.message}
            </Alert>
        </Snackbar>
    </Box>
  );
};

export default OfferManagement;