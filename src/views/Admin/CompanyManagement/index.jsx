import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select,
  MenuItem, Chip, Avatar, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  Divider, List, ListItem, ListItemText, CardActions, Drawer, OutlinedInput,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Business as BusinessIcon,
  AccountBalance as BankIcon, CloudUpload as UploadIcon, PhotoCamera as CameraIcon,
  Visibility as VisibilityIcon, Save as SaveIcon, Cancel as CancelIcon, Article as DocxIcon,
  PictureAsPdf as PdfIcon, AutoAwesome as AiIcon, Email as EmailIcon, Phone as PhoneIcon,
  RemoveCircleOutline as RemoveIcon
} from '@mui/icons-material';
import { Toaster, toast } from 'sonner';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

// VERİTABANI İLE KONUŞACAK YENİ SERVİSİ İMPORT EDİYORUZ
import companyService from 'services/companyService';

// --- YARDIMCI BİLEŞENLER ---
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CompanyManagement = () => {
  // --- STATE TANIMLAMALARI ---
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [drawerTab, setDrawerTab] = useState(0);
  const pdfRef = useRef();
  
  // Orijinal kodunuzdaki diğer state'ler
  const [bankAccounts, setBankAccounts] = useState([]); // Bu veriyi de API'dan çekmek gerekebilir
  const [openBankDialog, setOpenBankDialog] = useState(false);
  const [bankForm, setBankForm] = useState({ id: null, companyId: null, bankName: '', currency: 'TRY', iban: '', accountType: 'Vadesiz Hesap' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // --- useEffect ---
  useEffect(() => {
    fetchCompanies();
    // Banka hesapları için de benzer bir fetch fonksiyonu yazılabilir.
    // fetchBankAccounts();
  }, []);

  // --- FONKSİYONLAR ---
  const fetchCompanies = () => {
    setLoading(true);
    companyService.getAllCompanies()
      .then(response => {
        const formattedCompanies = response.data.map(c => ({ 
            ...c, 
            type: c.type || 'customer',
            emails: c.email ? c.email.split(',').filter(e => e) : [''],
            phones: c.phone ? c.phone.split(',').filter(p => p) : ['']
        }));
        setCompanies(formattedCompanies);
      })
      .catch(error => {
        console.error("Firmalar yüklenirken hata oluştu:", error);
        toast.error("Firmalar veritabanından yüklenemedi.");
      })
      .finally(() => setLoading(false));
  };

  const handleOpenDialog = (company = null) => {
    const emptyForm = { name: '', code: '', type: 'customer', address: '', emails: [''], phones: [''], taxNumber: '', taxOffice: '' };
    setEditingCompany(company || emptyForm);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCompany(null);
  };

  const handleSave = () => {
    if (!editingCompany || !editingCompany.name) {
      return toast.error('Firma adı boş bırakılamaz.');
    }
    
    // E-posta ve telefonları string'e çevirerek backend'e gönder
    const payload = {
        ...editingCompany,
        email: editingCompany.emails.filter(e => e).join(','),
        phone: editingCompany.phones.filter(p => p).join(',')
    };

    const promise = editingCompany.id
      ? companyService.updateCompany(editingCompany.id, payload)
      : companyService.createCompany(payload);

    toast.promise(promise, {
      loading: 'Kaydediliyor...',
      success: () => {
        fetchCompanies();
        handleCloseDialog();
        return `Firma başarıyla ${editingCompany.id ? 'güncellendi' : 'oluşturuldu'}!`;
      },
      error: (err) => `Bir hata oluştu: ${err.response?.data?.message || err.message}`,
    });
  };
  
  const handleDelete = (companyId) => {
    if (window.confirm("Bu firmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
        toast.promise(companyService.deleteCompany(companyId), {
            loading: 'Siliniyor...',
            success: () => {
                fetchCompanies();
                return 'Firma başarıyla silindi.';
            },
            error: (err) => `Silme işlemi başarısız: ${err.response?.data?.message || err.message}`
        });
    }
  };

  const handleTypeChange = (companyId, newType) => {
    const originalCompanies = [...companies];
    const updatedCompanies = companies.map(c => 
      c.id === companyId ? { ...c, type: newType } : c
    );
    setCompanies(updatedCompanies);

    companyService.updateCompany(companyId, { type: newType })
      .then(() => toast.success("Firma türü güncellendi."))
      .catch(() => {
        toast.error("Firma türü güncellenemedi.");
        setCompanies(originalCompanies);
      });
  };

  const handleOpenDetailsDrawer = (entity) => {
    setSelectedEntity(entity);
    setDrawerOpen(true);
  };
  
  const handleExportPdf = () => {
    // ... (Bu fonksiyon orijinal kodunuzla aynı)
  };

  // ... (Diğer tüm orijinal fonksiyonlarınız buraya eklenebilir)

  const renderCompanyTable = (filteredCompanies) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Firma Adı</TableCell>
            <TableCell>Firma Kodu</TableCell>
            <TableCell>Türü</TableCell>
            <TableCell align="right">İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCompanies.map((company) => (
            <TableRow key={company.id} hover>
              <TableCell>
                <Button variant="text" onClick={() => handleOpenDetailsDrawer(company)} sx={{ textTransform: 'none', textAlign: 'left' }}>
                  <Typography variant="subtitle2">{company.name}</Typography>
                </Button>
              </TableCell>
              <TableCell>{company.code || '-'}</TableCell>
              <TableCell sx={{ minWidth: 150 }}>
                <FormControl size="small" fullWidth>
                  <Select value={company.type || 'customer'} onChange={(e) => handleTypeChange(company.id, e.target.value)}>
                    <MenuItem value="customer">Müşteri</MenuItem>
                    <MenuItem value="supplier">Tedarikçi</MenuItem>
                    <MenuItem value="internal">Kendi Şirketim</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleOpenDialog(company)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDelete(company.id)} color="error"><DeleteIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Toaster richColors position="top-right" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Firma Yönetimi</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Yeni Firma Ekle
        </Button>
      </Box>
      
      {loading ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label={`Tüm Firmalar (${companies.length})`} />
              <Tab label={`Müşteriler (${companies.filter(c => c.type === 'customer').length})`} />
              <Tab label={`Tedarikçiler (${companies.filter(c => c.type === 'supplier').length})`} />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>{renderCompanyTable(companies)}</TabPanel>
          <TabPanel value={tabValue} index={1}>{renderCompanyTable(companies.filter(c => c.type === 'customer'))}</TabPanel>
          <TabPanel value={tabValue} index={2}>{renderCompanyTable(companies.filter(c => c.type === 'supplier'))}</TabPanel>
        </Card>
      )}

      {/* Firma Ekleme/Düzenleme Formu */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingCompany?.id ? 'Firma Düzenle' : 'Yeni Firma Ekle'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Firma Adı" type="text" fullWidth value={editingCompany?.name || ''} onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})} />
          <TextField margin="dense" name="code" label="Firma Kodu" type="text" fullWidth value={editingCompany?.code || ''} onChange={(e) => setEditingCompany({...editingCompany, code: e.target.value})} />
          <TextField margin="dense" name="address" label="Adres" type="text" fullWidth value={editingCompany?.address || ''} onChange={(e) => setEditingCompany({...editingCompany, address: e.target.value})} />
          {/* E-posta ve telefon alanları orijinal kodunuzdaki gibi dinamik olabilir */}
          <TextField margin="dense" name="email" label="E-posta" type="email" fullWidth value={editingCompany?.emails?.[0] || ''} onChange={(e) => setEditingCompany({...editingCompany, emails: [e.target.value]})} />
          <TextField margin="dense" name="phone" label="Telefon" type="text" fullWidth value={editingCompany?.phones?.[0] || ''} onChange={(e) => setEditingCompany({...editingCompany, phones: [e.target.value]})} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Firma Türü</InputLabel>
            <Select
              name="type"
              value={editingCompany?.type || 'customer'}
              onChange={(e) => setEditingCompany({...editingCompany, type: e.target.value})}
            >
              <MenuItem value="customer">Müşteri</MenuItem>
              <MenuItem value="supplier">Tedarikçi</MenuItem>
              <MenuItem value="internal">Kendi Şirketim</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSave} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>
      
      {/* Detay Çekmecesi (Orijinal kodunuzdaki gibi) */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: { xs: '100%', sm: 600 }, p: 3 }}>
            {selectedEntity && (
                <>
                <Typography variant="h5" gutterBottom>{selectedEntity.name}</Typography>
                <Divider sx={{ my: 2 }} />
                <Box ref={pdfRef} sx={{p: 2}}>
                    <Typography variant="subtitle1">Cari Kart Detayları</Typography>
                    <Typography variant="body2"><strong>Adres:</strong> {selectedEntity.address}</Typography>
                    <Typography variant="body2"><strong>Vergi No:</strong> {selectedEntity.taxNumber}</Typography>
                    {/* ... diğer tüm detaylar ... */}
                </Box>
                <Button onClick={handleExportPdf} variant="contained" sx={{mt: 2}}>Cari Kart PDF İndir</Button>
                </>
            )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default CompanyManagement;
