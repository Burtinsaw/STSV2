// src/views/Admin/UserManagement/index.jsx - DÜZELTILMIŞ VERSİYON
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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  getUserList, 
  createUser, 
  deleteUser, 
  resetUserPassword, 
  updateUserStatus 
} from '../../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  
  // Yeni kullanıcı formu
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'user',
    department: ''
  });

  // Kullanıcı listesini yükle
  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Kullanıcı listesi yükleniyor...');
      
      const response = await getUserList();
      console.log('📋 API Response:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setUsers(response.data);
        setFilteredUsers(response.data);
        console.log('✅ Kullanıcı listesi yüklendi:', response.data.length, 'kullanıcı');
      } else {
        console.error('❌ Geçersiz API response:', response);
        showAlert('error', 'Kullanıcı listesi formatı hatalı');
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Kullanıcı listesi hatası:', error);
      showAlert('error', error.message || 'Kullanıcılar yüklenirken hata oluştu');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Arama filtresi
  useEffect(() => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => {
      if (!user) return false;
      
      const searchLower = searchTerm.toLowerCase();
      
      // Güvenli string kontrolü
      const firstName = user.firstName ? user.firstName.toLowerCase() : '';
      const lastName = user.lastName ? user.lastName.toLowerCase() : '';
      const username = user.username ? user.username.toLowerCase() : '';
      const email = user.email ? user.email.toLowerCase() : '';
      const department = user.department ? user.department.toLowerCase() : '';
      
      return firstName.includes(searchLower) ||
             lastName.includes(searchLower) ||
             username.includes(searchLower) ||
             email.includes(searchLower) ||
             department.includes(searchLower);
    });
    
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  // Component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Alert göster
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: 'success', message: '' });
    }, 5000);
  };

  // Kullanıcı şifresini sıfırla
  const handleResetPassword = async (userId, userEmail) => {
    try {
      console.log(`🔑 Şifre sıfırlama: ${userId}`);
      
      const response = await resetUserPassword(userId);
      
      if (response && response.success) {
        showAlert('success', `${userEmail} kullanıcısının şifresi sıfırlandı. Geçici şifre: ${response.data.tempPassword}`);
        console.log('✅ Şifre sıfırlandı:', response.data.tempPassword);
      } else {
        showAlert('error', 'Şifre sıfırlanırken hata oluştu');
      }
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      showAlert('error', error.message || 'Şifre sıfırlanırken hata oluştu');
    }
  };

  // Kullanıcı durumunu değiştir
  const handleStatusChange = async (userId, newStatus) => {
    try {
      console.log(`🔄 Durum değiştirme: ${userId} -> ${newStatus}`);
      
      const response = await updateUserStatus(userId, newStatus);
      
      if (response && response.success) {
        // Kullanıcı listesini güncelle
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
        showAlert('success', `Kullanıcı durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak güncellendi`);
      } else {
        showAlert('error', 'Kullanıcı durumu güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      showAlert('error', error.message || 'Kullanıcı durumu güncellenirken hata oluştu');
    }
  };

  // Yeni kullanıcı oluştur
  const handleCreateUser = async () => {
    try {
      console.log('➕ Yeni kullanıcı oluşturuluyor:', newUser);
      
      // Validasyon
      if (!newUser.firstName || !newUser.lastName || !newUser.username || !newUser.email) {
        showAlert('error', 'Tüm zorunlu alanları doldurunuz');
        return;
      }

      const response = await createUser(newUser);
      
      if (response && response.success) {
        showAlert('success', `Kullanıcı oluşturuldu. Geçici şifre: ${response.data.tempPassword}`);
        setOpenDialog(false);
        setNewUser({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          role: 'user',
          department: ''
        });
        loadUsers(); // Listeyi yenile
      } else {
        showAlert('error', 'Kullanıcı oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      showAlert('error', error.message || 'Kullanıcı oluşturulurken hata oluştu');
    }
  };

  // Kullanıcı sil
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`${username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      console.log(`🗑️ Kullanıcı siliniyor: ${userId}`);
      
      const response = await deleteUser(userId);
      
      if (response && response.success) {
        showAlert('success', `${username} kullanıcısı silindi`);
        loadUsers(); // Listeyi yenile
      } else {
        showAlert('error', 'Kullanıcı silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      showAlert('error', error.message || 'Kullanıcı silinirken hata oluştu');
    }
  };

  // Rol rengi
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  // Rol etiketi
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Müdür';
      case 'user': return 'Kullanıcı';
      default: return role;
    }
  };

  // Tarih formatla
  const formatDate = (date) => {
    if (!date) return 'Hiç giriş yapmamış';
    try {
      return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Alert */}
      {alert.show && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlert({ show: false, type: 'success', message: '' })}
        >
          {alert.message}
        </Alert>
      )}

      {/* Başlık ve Kontroller */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h1" gutterBottom>
                👥 Kullanıcı Yönetimi
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sistem kullanıcılarını yönetin, şifrelerini sıfırlayın ve yeni kullanıcılar ekleyin.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadUsers}
                  disabled={loading}
                >
                  Yenile
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  Yeni Kullanıcı
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Arama */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Kullanıcı ara (ad, soyad, kullanıcı adı, e-posta, departman)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ maxWidth: 500 }}
          />
        </CardContent>
      </Card>

      {/* Kullanıcı Tablosu */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Kullanıcı Listesi ({filteredUsers.length} kullanıcı)
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Kullanıcılar yükleniyor...</Typography>
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                {searchTerm ? 'Arama kriterine uygun kullanıcı bulunamadı' : 'Henüz kullanıcı bulunmuyor'}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Kullanıcı</strong></TableCell>
                    <TableCell><strong>E-posta</strong></TableCell>
                    <TableCell><strong>Rol</strong></TableCell>
                    <TableCell><strong>Departman</strong></TableCell>
                    <TableCell><strong>Durum</strong></TableCell>
                    <TableCell><strong>Son Giriş</strong></TableCell>
                    <TableCell align="center"><strong>İşlemler</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.department || 'Belirtilmemiş'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.status === 'active'}
                          onChange={(e) => handleStatusChange(user.id, e.target.checked ? 'active' : 'inactive')}
                          color="primary"
                          size="small"
                        />
                        <Typography variant="caption" display="block">
                          {user.status === 'active' ? 'Aktif' : 'Pasif'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(user.lastLogin)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Şifre Sıfırla">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleResetPassword(user.id, user.email)}
                            >
                              <VpnKeyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {user.role !== 'admin' && (
                            <Tooltip title="Kullanıcı Sil">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Yeni Kullanıcı Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          ➕ Yeni Kullanıcı Ekle
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Ad *"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Soyad *"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Kullanıcı Adı *"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="E-posta *"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={newUser.role}
                    label="Rol"
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <MenuItem value="user">Kullanıcı</MenuItem>
                    <MenuItem value="manager">Müdür</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Departman"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            İptal
          </Button>
          <Button variant="contained" onClick={handleCreateUser}>
            Kullanıcı Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

