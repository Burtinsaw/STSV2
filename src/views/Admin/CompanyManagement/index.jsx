import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Avatar, Chip, IconButton, Drawer, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Tooltip, SpeedDial, SpeedDialAction, SpeedDialIcon, Divider, Tabs, Tab, useTheme, FormControl, MenuItem, Select
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Email as EmailIcon, Phone as PhoneIcon, Business as BusinessIcon, CloudUpload as UploadIcon, Save as SaveIcon, Cancel as CancelIcon
} from '@mui/icons-material';
import { Toaster, toast } from 'sonner';
import companyService from 'services/companyService';

const COMPANY_TYPES = [
  { value: 'all', label: 'Tümü' },
  { value: 'customer', label: 'Müşteri' },
  { value: 'supplier', label: 'Tedarikçi' },
  { value: 'carrier', label: 'Nakliyeci' },
  { value: 'main', label: 'Ana Firma' }
];

const emptyCompany = {
  name: '',
  code: '',
  type: 'customer',
  address: '',
  emails: [''],
  phones: [''],
  taxOffice: '',
  taxNumber: '',
  logo: '',
  inn: '',
  kpp: '',
  ogrn: '',
  vat: '',
  uscc: ''
};

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef();
  const theme = useTheme();
  const [drawerTab, setDrawerTab] = useState(0);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = () => {
    setLoading(true);
    companyService.getAllCompanies()
      .then(response => {
        const formatted = response.data.map(c => ({
          ...c,
          type: c.type || 'customer',
          emails: c.email ? c.email.split(',').filter(e => e) : [''],
          phones: c.phone ? c.phone.split(',').filter(p => p) : [''],
          logo: c.logo_url || ''
        }));
        setCompanies(formatted);
      })
      .catch(() => toast.error('Firmalar yüklenemedi.'))
      .finally(() => setLoading(false));
  };

  // Filtreleme ve arama
  const filteredCompanies = companies.filter(c => {
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.emails?.some(e => e.toLowerCase().includes(search.toLowerCase())) ||
      c.phones?.some(p => p.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Kart tıklanınca detay paneli aç
  const handleCardClick = (company) => {
    setSelectedCompany(company);
    setDrawerOpen(true);
  };

  // Şirket düzenleme/ekleme dialogu
  const handleOpenEditDialog = (company = null) => {
    setEditingCompany(company ? { ...company } : { ...emptyCompany });
    setLogoPreview(company?.logo || '');
    setEditDialogOpen(true);
  };
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingCompany(null);
    setLogoPreview('');
  };

  // Logo yükleme
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
      setEditingCompany(prev => ({ ...prev, logo: file }));
    }
  };

  // Dinamik e-posta/telefon
  const handleAddEmail = () => setEditingCompany(prev => ({ ...prev, emails: [...prev.emails, ''] }));
  const handleRemoveEmail = (idx) => setEditingCompany(prev => ({ ...prev, emails: prev.emails.filter((_, i) => i !== idx) }));
  const handleEmailChange = (idx, value) => setEditingCompany(prev => {
    const emails = [...prev.emails]; emails[idx] = value; return { ...prev, emails };
  });
  const handleAddPhone = () => setEditingCompany(prev => ({ ...prev, phones: [...prev.phones, ''] }));
  const handleRemovePhone = (idx) => setEditingCompany(prev => ({ ...prev, phones: prev.phones.filter((_, i) => i !== idx) }));
  const handlePhoneChange = (idx, value) => setEditingCompany(prev => {
    const phones = [...prev.phones]; phones[idx] = value; return { ...prev, phones };
  });

  // Kayıt işlemleri
  const handleSave = async () => {
    if (!editingCompany.name) return toast.error('Firma adı zorunlu!');
    // Firma kodu otomatik atanacak
    let code = editingCompany.code;
    if (!editingCompany.id) {
      const codes = companies.map(c => c.code).filter(Boolean);
      let maxNum = 0;
      codes.forEach(c => {
        const match = c && c.match(/^COMP(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      code = `COMP${(maxNum + 1).toString().padStart(3, '0')}`;
    }
    const payload = {
      ...editingCompany,
      code,
      email: editingCompany.emails.filter(e => e).join(','),
      phone: editingCompany.phones.filter(p => p).join(','),
      logo_url: logoPreview,
    };
    let promise;
    if (editingCompany.id) {
      promise = companyService.updateCompany(editingCompany.id, payload);
    } else {
      promise = companyService.createCompany(payload);
    }
    toast.promise(promise, {
      loading: 'Kaydediliyor...',
      success: () => {
        fetchCompanies();
        handleCloseEditDialog();
        if (payload.type && payload.type !== filterType && payload.type !== 'all') {
          setFilterType(payload.type);
        }
        return 'Firma kaydedildi!';
      },
      error: (err) => `Hata: ${err.response?.data?.message || err.message}`
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu firmayı silmek istediğinize emin misiniz?')) {
      toast.promise(companyService.deleteCompany(id), {
        loading: 'Siliniyor...',
        success: () => { fetchCompanies(); return 'Firma silindi.'; },
        error: (err) => `Silinemedi: ${err.response?.data?.message || err.message}`
      });
    }
  };

  // Şirket türünü doğrudan değiştir
  const handleTypeChange = (id, newType) => {
    const company = companies.find(c => c.id === id);
    if (!company) return;
    const payload = {
      name: company.name,
      type: newType,
      email: company.emails?.filter(e => e).join(',') || '',
      phone: company.phones?.filter(p => p).join(',') || '',
      address: company.address || '',
      taxOffice: company.taxOffice || '',
      taxNumber: company.taxNumber || '',
      inn: company.inn || '',
      kpp: company.kpp || '',
      ogrn: company.ogrn || '',
      vat: company.vat || '',
      uscc: company.uscc || '',
      logo_url: company.logo || ''
    };
    if (company.code) payload.code = company.code;
    toast.promise(companyService.updateCompany(id, payload), {
      loading: 'Güncelleniyor...',
      success: () => {
        fetchCompanies();
        if (newType && newType !== filterType && newType !== 'all') {
          setFilterType(newType);
        }
        return 'Firma türü güncellendi.';
      },
      error: (err) => `Hata: ${err.response?.data?.message || err.message}`
    });
  };

  // Kategori chipleri
  const renderTypeChips = () => (
    <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {COMPANY_TYPES.map(t => (
        <Chip
          key={t.value}
          label={t.label}
          color={filterType === t.value ? 'primary' : 'default'}
          onClick={() => setFilterType(t.value)}
          clickable
        />
      ))}
    </Box>
  );

  // Şirket kartı - Türü doğrudan değiştirmek için Select içeren Chip
  const renderCompanyCard = (company) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
      <Card sx={{ position: 'relative', minHeight: 220, boxShadow: 3, borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 8, borderColor: theme.palette.primary.main } }} onClick={() => handleCardClick(company)}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar src={company.logo} sx={{ width: 56, height: 56, mr: 2, border: '2px solid #eee' }} />
            <Box>
              <Typography variant="h6" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-line', maxHeight: 56, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {company.name}
              </Typography>
              <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
                <Select
                  value={company.type}
                  onChange={(e) => handleTypeChange(company.id, e.target.value)}
                  sx={{ fontSize: '0.75rem', height: 28, '& .MuiSelect-select': { py: 0.5 } }}
                  MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                >
                  {COMPANY_TYPES.filter(t => t.value !== 'all').map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" noWrap>{company.address}</Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {company.emails?.filter(Boolean).map((e, i) => (
              <Chip key={i} icon={<EmailIcon />} label={e} size="small" />
            ))}
            {company.phones?.filter(Boolean).map((p, i) => (
              <Chip key={i} icon={<PhoneIcon />} label={p} size="small" />
            ))}
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', mt: 1 }}>
          <Tooltip title="Düzenle">
            <IconButton onClick={e => { e.stopPropagation(); handleOpenEditDialog(company); }}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sil">
            <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(company.id); }}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  );

  // Drawer detay paneli
  const renderDrawer = () => (
    <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box sx={{ width: { xs: '100vw', sm: 400 }, p: 3, maxWidth: 500 }}>
        {selectedCompany && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar src={selectedCompany.logo} sx={{ width: 64, height: 64, mr: 2 }} />
              <Box>
                <Typography variant="h5">{selectedCompany.name}</Typography>
                <Chip
                  label={COMPANY_TYPES.find(t => t.value === selectedCompany.type)?.label || selectedCompany.type}
                  size="small"
                  color="secondary"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
            <Tabs value={drawerTab} onChange={(_, v) => setDrawerTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
              <Tab label="Genel" />
              <Tab label="İletişim" />
              <Tab label="Uluslararası" />
            </Tabs>
            {drawerTab === 0 && (
              <Box>
                <Typography variant="subtitle2">Firma Kodu: {selectedCompany.code}</Typography>
                <Typography variant="subtitle2">Adres: {selectedCompany.address}</Typography>
                <Typography variant="subtitle2">Vergi Dairesi: {selectedCompany.taxOffice}</Typography>
                <Typography variant="subtitle2">Vergi No: {selectedCompany.taxNumber}</Typography>
              </Box>
            )}
            {drawerTab === 1 && (
              <Box>
                <Typography variant="subtitle2">E-posta:</Typography>
                {selectedCompany.emails?.map((e, i) => (
                  <Chip key={i} icon={<EmailIcon />} label={e} sx={{ m: 0.5 }} />
                ))}
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Telefon:</Typography>
                {selectedCompany.phones?.map((p, i) => (
                  <Chip key={i} icon={<PhoneIcon />} label={p} sx={{ m: 0.5 }} />
                ))}
              </Box>
            )}
            {drawerTab === 2 && (
              <Box>
                <Typography variant="subtitle2">INN: {selectedCompany.inn}</Typography>
                <Typography variant="subtitle2">KPP: {selectedCompany.kpp}</Typography>
                <Typography variant="subtitle2">OGRN: {selectedCompany.ogrn}</Typography>
                <Typography variant="subtitle2">VAT: {selectedCompany.vat}</Typography>
                <Typography variant="subtitle2">USCC: {selectedCompany.uscc}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Button
              variant="contained"
              fullWidth
              onClick={() => { setDrawerOpen(false); handleOpenEditDialog(selectedCompany); }}
              startIcon={<EditIcon />}
            >
              Düzenle
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );

  // Şirket ekle/düzenle dialogu
  const renderEditDialog = () => (
    <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
      <DialogTitle>{editingCompany?.id ? 'Şirketi Düzenle' : 'Yeni Şirket Ekle'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={logoPreview} sx={{ width: 64, height: 64, mr: 2 }} />
          <Button variant="outlined" startIcon={<UploadIcon />} component="label">
            Logo Yükle
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleLogoChange} />
          </Button>
        </Box>
        <TextField
          margin="dense"
          label="Firma Adı"
          fullWidth
          value={editingCompany?.name || ''}
          onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })}
        />
        <FormControl fullWidth margin="dense">
          <TextField
            select
            label="Şirket Türü"
            value={editingCompany?.type || 'customer'}
            onChange={e => setEditingCompany({ ...editingCompany, type: e.target.value })}
            fullWidth
          >
            {COMPANY_TYPES.filter(t => t.value !== 'all').map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>
        </FormControl>
        <TextField
          margin="dense"
          label="Adres"
          fullWidth
          value={editingCompany?.address || ''}
          onChange={e => setEditingCompany({ ...editingCompany, address: e.target.value })}
        />
        <Divider sx={{ my: 2 }}>E-posta Adresleri</Divider>
        {editingCompany?.emails?.map((email, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              fullWidth
              margin="dense"
              label={`E-posta ${idx + 1}`}
              value={email}
              onChange={e => handleEmailChange(idx, e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
            />
            <IconButton onClick={() => handleRemoveEmail(idx)} disabled={editingCompany.emails.length === 1}>
              <CancelIcon />
            </IconButton>
          </Box>
        ))}
        <Button onClick={handleAddEmail} startIcon={<AddIcon />} size="small">E-posta Ekle</Button>
        <Divider sx={{ my: 2 }}>Telefonlar</Divider>
        {editingCompany?.phones?.map((phone, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              fullWidth
              margin="dense"
              label={`Telefon ${idx + 1}`}
              value={phone}
              onChange={e => handlePhoneChange(idx, e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
            />
            <IconButton onClick={() => handleRemovePhone(idx)} disabled={editingCompany.phones.length === 1}>
              <CancelIcon />
            </IconButton>
          </Box>
        ))}
        <Button onClick={handleAddPhone} startIcon={<AddIcon />} size="small">Telefon Ekle</Button>
        <Divider sx={{ my: 2 }}>Vergi ve Uluslararası Bilgiler</Divider>
        <TextField
          margin="dense"
          label="Vergi Dairesi"
          fullWidth
          value={editingCompany?.taxOffice || ''}
          onChange={e => setEditingCompany({ ...editingCompany, taxOffice: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Vergi No / TC Kimlik No"
          fullWidth
          value={editingCompany?.taxNumber || ''}
          onChange={e => setEditingCompany({ ...editingCompany, taxNumber: e.target.value })}
        />
        <TextField
          margin="dense"
          label="INN (Rusya)"
          fullWidth
          value={editingCompany?.inn || ''}
          onChange={e => setEditingCompany({ ...editingCompany, inn: e.target.value })}
        />
        <TextField
          margin="dense"
          label="KPP (Rusya)"
          fullWidth
          value={editingCompany?.kpp || ''}
          onChange={e => setEditingCompany({ ...editingCompany, kpp: e.target.value })}
        />
        <TextField
          margin="dense"
          label="OGRN (Rusya)"
          fullWidth
          value={editingCompany?.ogrn || ''}
          onChange={e => setEditingCompany({ ...editingCompany, ogrn: e.target.value })}
        />
        <TextField
          margin="dense"
          label="VAT (AB)"
          fullWidth
          value={editingCompany?.vat || ''}
          onChange={e => setEditingCompany({ ...editingCompany, vat: e.target.value })}
        />
        <TextField
          margin="dense"
          label="USCC (Çin)"
          fullWidth
          value={editingCompany?.uscc || ''}
          onChange={e => setEditingCompany({ ...editingCompany, uscc: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseEditDialog}>İptal</Button>
        <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>Kaydet</Button>
      </DialogActions>
    </Dialog>
  );

  // FAB
  const renderFAB = () => (
    <SpeedDial
      ariaLabel="Yeni Şirket Ekle"
      sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200 }}
      icon={<SpeedDialIcon openIcon={<AddIcon />} />}
      onClick={() => handleOpenEditDialog()}
    >
      <SpeedDialAction icon={<AddIcon />} tooltipTitle="Yeni Şirket Ekle" onClick={() => handleOpenEditDialog()} />
    </SpeedDial>
  );

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <Toaster richColors position="top-right" />
      <Typography variant="h4" sx={{ mb: 2 }}>Şirket Yönetimi</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <TextField
          placeholder="Şirket adı, kodu, e-posta, telefon..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
        />
        {renderTypeChips()}
      </Box>
      <Grid container spacing={3}>
        {filteredCompanies.map(renderCompanyCard)}
      </Grid>
      {renderDrawer()}
      {renderEditDialog()}
      {renderFAB()}
    </Box>
  );
};

export default CompanyManagement;
