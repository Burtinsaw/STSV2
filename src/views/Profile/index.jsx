import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Business as BusinessIcon,
  Storage as StorageIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from 'contexts/AuthContext';
import axios from 'axios';

const Settings = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // State yönetimi
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Şifre değiştirme
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sistem ayarları
  const [settings, setSettings] = useState({
    language: 'tr',
    theme: 'light',
    emailNotifications: true,
    messageNotifications: true,
    systemNotifications: true,
    autoSave: true,
    dataRetention: 30,
    cacheSize: 100
  });

  // Şirket bilgileri
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxNumber: '',
    website: ''
  });

  // Ayarları yükle
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Mock data - gerçek API'den gelecek
      setSettings({
        language: 'tr',
        theme: 'light',
        emailNotifications: true,
        messageNotifications: true,
        systemNotifications: true,
        autoSave: true,
        dataRetention: 30,
        cacheSize: 100
      });

      setCompanyInfo({
        name: 'Nazy Yapı İnşaat',
        address: 'İstanbul, Türkiye',
        phone: '+90 212 555 0123',
        email: 'info@nazyapi.com',
        taxNumber: '1234567890',
        website: 'www.nazyapi.com'
      });

      console.log('✅ Ayarlar yüklendi');
    } catch (error) {
      console.error('❌ Ayar yükleme hatası:', error);
      setError('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Şifre değiştir
  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError('Mevcut şifre ve yeni şifre gerekli');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalı');
      return;
    }

    try {
      setLoading(true);
      
      // API çağrısı
      await axios.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setSuccess('Şifre başarıyla değiştirildi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Şifre değiştirme hatası:', error);
      setError('Şifre değiştirilemedi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Ayarları kaydet
  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // API çağrısı
      await axios.post('/api/user/settings', settings);
      
      setSuccess('Ayarlar başarıyla kaydedildi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Ayar kaydetme hatası:', error);
      setError('Ayarlar kaydedilemedi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Cache temizle
  const clearCache = async () => {
    try {
      setLoading(true);
      
      // API çağrısı
      await axios.post('/api/system/clear-cache');
      
      setSuccess('Cache başarıyla temizlendi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Cache temizleme hatası:', error);
      setError('Cache temizlenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Veri dışa aktar
  const exportData = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/user/export-data', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Veriler başarıyla dışa aktarıldı!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Veri dışa aktarma hatası:', error);
      setError('Veriler dışa aktarılamadı');
    } finally {
      setLoading(false);
    }
  };

  // Component mount
  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Başlık */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SettingsIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
          Ayarlar
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Sistem ayarlarınızı ve kişisel tercihlerinizi yönetin
        </Typography>
      </Box>

      {/* Bildirimler */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sol Kolon */}
        <Grid item xs={12} md={6}>
          {/* Şifre Değiştirme */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={<SecurityIcon color="primary" />}
              title="Şifre Değiştirme"
              subheader="Hesap güvenliğiniz için düzenli olarak şifrenizi değiştirin"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mevcut Şifre"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Yeni Şifre"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Yeni Şifre Tekrar"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={changePassword}
                    disabled={loading}
                    startIcon={<SaveIcon />}
                  >
                    Şifreyi Değiştir
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Bildirim Ayarları */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={<NotificationsIcon color="primary" />}
              title="Bildirim Ayarları"
              subheader="Hangi bildirimleri almak istediğinizi seçin"
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="E-posta Bildirimleri" 
                    secondary="Önemli güncellemeler için e-posta alın"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Mesaj Bildirimleri" 
                    secondary="Yeni mesajlar için bildirim alın"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.messageNotifications}
                      onChange={(e) => setSettings({...settings, messageNotifications: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sistem Bildirimleri" 
                    secondary="Sistem güncellemeleri için bildirim alın"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.systemNotifications}
                      onChange={(e) => setSettings({...settings, systemNotifications: e.target.checked})}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ Kolon */}
        <Grid item xs={12} md={6}>
          {/* Genel Ayarlar */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={<LanguageIcon color="primary" />}
              title="Genel Ayarlar"
              subheader="Dil, tema ve sistem tercihleri"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Dil</InputLabel>
                    <Select
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                      label="Dil"
                    >
                      <MenuItem value="tr">🇹🇷 Türkçe</MenuItem>
                      <MenuItem value="en">🇺🇸 English</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tema</InputLabel>
                    <Select
                      value={settings.theme}
                      onChange={(e) => setSettings({...settings, theme: e.target.value})}
                      label="Tema"
                    >
                      <MenuItem value="light">☀️ Açık Tema</MenuItem>
                      <MenuItem value="dark">🌙 Koyu Tema</MenuItem>
                      <MenuItem value="auto">🔄 Otomatik</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSave}
                        onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
                      />
                    }
                    label="Otomatik Kaydetme"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Veri Saklama Süresi (Gün)"
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => setSettings({...settings, dataRetention: parseInt(e.target.value)})}
                    inputProps={{ min: 1, max: 365 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Şirket Bilgileri */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={<BusinessIcon color="primary" />}
              title="Şirket Bilgileri"
              subheader="Şirketinizin genel bilgileri"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Şirket Adı"
                    value={companyInfo.name}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adres"
                    value={companyInfo.address}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={companyInfo.phone}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    value={companyInfo.email}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Vergi Numarası"
                    value={companyInfo.taxNumber}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={companyInfo.website}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Alt Kısım - Sistem İşlemleri */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<StorageIcon color="primary" />}
              title="Sistem İşlemleri"
              subheader="Veri yönetimi ve sistem bakımı"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={saveSettings}
                    disabled={loading}
                  >
                    Ayarları Kaydet
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadSettings}
                    disabled={loading}
                  >
                    Ayarları Yenile
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportData}
                    disabled={loading}
                  >
                    Veri Dışa Aktar
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<DeleteIcon />}
                    onClick={clearCache}
                    disabled={loading}
                  >
                    Cache Temizle
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Sistem Bilgileri */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label={`Kullanıcı: ${user?.username || 'Bilinmiyor'}`} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Rol: ${user?.role || 'Bilinmiyor'}`} 
                  color="secondary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Dil: ${settings.language === 'tr' ? 'Türkçe' : 'English'}`} 
                  variant="outlined" 
                />
                <Chip 
                  label={`Tema: ${settings.theme === 'light' ? 'Açık' : settings.theme === 'dark' ? 'Koyu' : 'Otomatik'}`} 
                  variant="outlined" 
                />
                <Chip 
                  label={`Cache: ${settings.cacheSize}MB`} 
                  variant="outlined" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;

