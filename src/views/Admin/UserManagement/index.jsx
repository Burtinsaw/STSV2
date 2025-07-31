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
  Button,
  Chip,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// GERÇEK API FONKSİYONLARI
// Bu import yolunun projenizdeki 'api.js' dosyasına doğru olduğundan emin olun.
import * as api from 'services/api';

// Yeni Departman ve Rol Listeleri
const departments = ['Satınalma', 'Lojistik', 'Finans', 'Yönetici', 'IT', 'Operasyon'];
const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Yönetici' },
    { value: 'purchasing_manager', label: 'Satınalma Müdürü' },
    { value: 'purchasing_staff', label: 'Satınalma' },
    { value: 'logistics_manager', label: 'Lojistik Sorumlusu' },
    { value: 'logistics_staff', label: 'Lojistik' },
    { value: 'finance_manager', label: 'Finans Sorumlusu' },
    { value: 'finance_staff', label: 'Finans' },
    { value: 'operator', label: 'Operatör' },
    { value: 'user', label: 'Standart Kullanıcı' }
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, type: 'success', message: '' });
  
  const [userForm, setUserForm] = useState({
    id: null,
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'user',
    department: '',
    companyId: '',
    companyName: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // API'den kullanıcıları çek
      const userResponse = await api.getUserList();
      if (userResponse.success && Array.isArray(userResponse.data)) {
        setUsers(userResponse.data);
        setFilteredUsers(userResponse.data);
      } else {
        showSnackbar('error', 'Kullanıcı listesi alınamadı veya format hatalı.');
      }

      // Firmaları localStorage'dan çek
      const storedCompanies = JSON.parse(localStorage.getItem('companies') || '[]');
      setCompanies(storedCompanies);

    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      showSnackbar('error', error.message || 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
        (user.firstName?.toLowerCase() || '').includes(searchLower) ||
        (user.lastName?.toLowerCase() || '').includes(searchLower) ||
        (user.username?.toLowerCase() || '').includes(searchLower) ||
        (user.email?.toLowerCase() || '').includes(searchLower) ||
        (user.department?.toLowerCase() || '').includes(searchLower)
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const showSnackbar = (type, message) => {
    setSnackbar({ show: true, type, message });
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
        setIsEditing(true);
        setUserForm(user);
    } else {
        setIsEditing(false);
        setUserForm({ id: null, firstName: '', lastName: '', username: '', email: '', role: 'user', department: '', companyId: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveUser = async () => {
    if (!userForm.firstName || !userForm.lastName || !userForm.username || !userForm.email) {
        showSnackbar('error', 'Ad, Soyad, Kullanıcı Adı ve E-posta alanları zorunludur.');
        return;
    }

    try {
        let response;
        if (isEditing) {
            response = await api.updateUser(userForm.id, userForm);
            showSnackbar('success', 'Kullanıcı başarıyla güncellendi.');
        } else {
            response = await api.createUser(userForm);
            showSnackbar('success', `Kullanıcı oluşturuldu. Geçici şifre: ${response.data.tempPassword}`);
        }
        
        if (response.success) {
            loadData(); // Listeyi yenile
            handleCloseDialog();
        } else {
            showSnackbar('error', response.message || 'İşlem sırasında bir hata oluştu.');
        }
    } catch (error) {
        showSnackbar('error', error.message || 'İşlem sırasında bir hata oluştu.');
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
        try {
            const response = await api.deleteUser(userId);
            if (response.success) {
                showSnackbar('warning', 'Kullanıcı silindi.');
                loadData();
            } else {
                showSnackbar('error', response.message || 'Kullanıcı silinirken bir hata oluştu.');
            }
        } catch (error) {
            showSnackbar('error', error.message || 'Kullanıcı silinirken bir hata oluştu.');
        }
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
        const response = await api.updateUserStatus(userId, newStatus ? 'active' : 'inactive');
        if (response.success) {
            showSnackbar('info', `Kullanıcı durumu güncellendi.`);
            setUsers(users.map(u => u.id === userId ? {...u, status: newStatus ? 'active' : 'inactive'} : u));
        } else {
            showSnackbar('error', response.message || 'Durum güncellenirken bir hata oluştu.');
        }
    } catch (error) {
        showSnackbar('error', error.message || 'Durum güncellenirken bir hata oluştu.');
    }
  };

  const handleResetPassword = async (userId) => {
      try {
          const response = await api.resetUserPassword(userId);
          if(response.success) {
              showSnackbar('success', `Şifre sıfırlandı. Yeni şifre: ${response.data.tempPassword}`);
          } else {
              showSnackbar('error', response.message || 'Şifre sıfırlanamadı.');
          }
      } catch (error) {
          showSnackbar('error', error.message || 'Şifre sıfırlanırken bir hata oluştu.');
      }
  };

  const getRoleLabel = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };
  
  const getRoleColor = (roleValue) => {
    const roleColors = {
        admin: 'error',
        manager: 'warning',
        purchasing_manager: 'secondary',
        logistics_manager: 'secondary',
        finance_manager: 'secondary',
        user: 'primary',
    };
    return roleColors[roleValue] || 'default';
  };

  const formatDate = (date) => date ? format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: tr }) : 'Hiç giriş yapmadı';

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar open={snackbar.show} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, show: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={() => setSnackbar({ ...snackbar, show: false })} severity={snackbar.type} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
      </Snackbar>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h1">Kullanıcı Yönetimi</Typography>
              <Typography variant="body2" color="textSecondary">Sistem kullanıcılarını ve rollerini yönetin.</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>Yenile</Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Yeni Kullanıcı</Button>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            sx={{ maxWidth: 500 }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Departman</TableCell>
                  <TableCell>Şirket</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Son Giriş</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
                ) : filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{user.firstName} {user.lastName}</Typography>
                      <Typography variant="caption" color="textSecondary">@{user.username}</Typography>
                    </TableCell>
                    <TableCell><Chip label={getRoleLabel(user.role)} color={getRoleColor(user.role)} size="small" /></TableCell>
                    <TableCell>{user.department || 'N/A'}</TableCell>
                    <TableCell>
                        <Tooltip title={user.companyName || 'Atanmamış'}>
                            <Chip icon={<BusinessIcon />} label={user.companyName ? (user.companyName.length > 20 ? user.companyName.substring(0, 20) + '...' : user.companyName) : 'Atanmamış'} size="small" variant="outlined" />
                        </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Switch checked={user.status === 'active'} onChange={(e) => handleStatusChange(user.id, e.target.checked)} />
                    </TableCell>
                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleOpenDialog(user)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Şifre Sıfırla"><IconButton size="small" color="primary" onClick={() => handleResetPassword(user.id)}><VpnKeyIcon /></IconButton></Tooltip>
                      <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={6}><TextField fullWidth label="Ad *" value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Soyad *" value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Kullanıcı Adı *" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="E-posta *" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></Grid>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel>Atanacak Şirket</InputLabel>
                    <Select value={userForm.companyId || ''} label="Atanacak Şirket" onChange={(e) => setUserForm({ ...userForm, companyId: e.target.value, companyName: companies.find(c=>c.id === e.target.value)?.name })}>
                        <MenuItem value=""><em>Hiçbiri</em></MenuItem>
                        {companies.map(company => (
                            <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select value={userForm.role} label="Rol" onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  {roles.map(role => (
                      <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select value={userForm.department} label="Departman" onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}>
                  {departments.map(dep => (
                      <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button variant="contained" onClick={handleSaveUser}>{isEditing ? 'Güncelle' : 'Oluştur'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
