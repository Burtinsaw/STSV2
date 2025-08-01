import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Typography, TextField, Button, Switch, FormControlLabel, Divider, Alert,
  Card, CardContent, CardHeader, Select, MenuItem, FormControl, InputLabel,
  IconButton, Chip, Avatar, CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon, Security as SecurityIcon, Notifications as NotificationsIcon,
  Language as LanguageIcon, Business as BusinessIcon, Storage as StorageIcon,
  Save as SaveIcon, Refresh as RefreshIcon, Download as DownloadIcon, Delete as DeleteIcon,
  Visibility, VisibilityOff, Edit as EditIcon, CameraAlt as CameraAltIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from 'contexts/AuthContext';
import axios from 'axios';

const Settings = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const mode = theme.palette.mode;
  const toggleTheme = () => {};
  const fileInputRef = useRef();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState(null);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const [settings, setSettings] = useState({
    language: 'tr', theme: mode, emailNotifications: true,
    messageNotifications: true, systemNotifications: true,
    autoSave: true, dataRetention: 30, cacheSize: 100
  });

  const [companyInfo, setCompanyInfo] = useState({
    name: '', address: '', phone: '', email: '', taxNumber: '', website: ''
  });

  // Profil ve şirket bilgilerini yükle
  const loadSettings = async () => {
    try {
      setLoading(true);
      setSettings(prev => ({ ...prev, theme: mode }));
      setCompanyInfo({
        name: 'Nazy Yapı İnşaat', address: 'İstanbul, Türkiye', phone: '+90 212 555 0123',
        email: 'info@nazyapi.com', taxNumber: '1234567890', website: 'www.nazyapi.com'
      });
    } catch (error) {
      setError('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Avatar seç
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Sadece resim dosyası yükleyebilirsiniz!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Avatar en fazla 2MB olmalı!');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Avatarı kaydet
  const saveAvatar = async () => {
    if (!avatarFile) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      // API çağrısı (örnek endpoint)
      await axios.post('/api/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Avatar güncellendi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Avatar güncellenemedi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Profil bilgisini güncelle
  const saveProfile = async () => {
    try {
      setLoading(true);
      await axios.post('/api/user/profile', profile);
      setSuccess('Profil güncellendi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Profil güncellenemedi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Şifre değiştir
  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword || passwordData.newPassword.length < 6) {
      setError('Lütfen şifre alanlarını doğru doldurun.');
      return;
    }
    try {
      setLoading(true);
      await axios.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Şifre başarıyla değiştirildi!');
    } catch (error) {
      setError('Şifre değiştirilemedi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Ayarları kaydet
  const saveSettings = async () => {
    try {
      setLoading(true);
      await axios.post('/api/user/settings', settings);
      setSuccess('Ayarlar kaydedildi!');
    } catch (error) {
      setError('Ayarlar kaydedilemedi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Ayarlar
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Profil ve Avatar */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardHeader avatar={<Avatar src={avatarPreview} sx={{ width: 48, height: 48 }} />} title="Profil Bilgileri" />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={avatarPreview} sx={{ width: 64, height: 64, mr: 2 }} />
                <Button
                  variant="outlined"
                  startIcon={<CameraAltIcon />}
                  component="label"
                  disabled={loading}
                >
                  Avatar Yükle
                  <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleAvatarChange} />
                </Button>
                {avatarFile && (
                  <Button variant="contained" sx={{ ml: 2 }} onClick={saveAvatar} disabled={loading}>
                    Kaydet
                  </Button>
                )}
              </Box>
              <TextField fullWidth label="Ad" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth label="Soyad" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth label="E-posta" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth label="Telefon" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} sx={{ mb: 2 }} />
              <Button variant="contained" startIcon={<EditIcon />} onClick={saveProfile} disabled={loading}>
                Bilgileri Güncelle
              </Button>
            </CardContent>
          </Card>

          {/* Şifre Değiştir */}
          <Card>
            <CardHeader avatar={<SecurityIcon />} title="Şifre Değiştir" />
            <CardContent>
              <TextField fullWidth label="Mevcut Şifre" type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                InputProps={{ endAdornment: (
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>) }}
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="Yeni Şifre" type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                InputProps={{ endAdornment: (
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>) }}
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="Yeni Şifre (Tekrar)" type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={changePassword} startIcon={<SaveIcon />} disabled={loading}>
                Şifreyi Güncelle
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ Kolon - Ayarlar ve Şirket Bilgileri */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardHeader avatar={<LanguageIcon />} title="Genel Ayarlar" />
            <CardContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Dil</InputLabel>
                <Select value={settings.language} label="Dil"
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
                  <MenuItem value="tr">Türkçe</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tema</InputLabel>
                <Select
                  value={mode}
                  onChange={(e) => {
                    setSettings({ ...settings, theme: e.target.value });
                    toggleTheme();
                  }}
                  label="Tema"
                >
                  <MenuItem value="light">Açık</MenuItem>
                  <MenuItem value="dark">Koyu</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={settings.autoSave} onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })} />}
                label="Otomatik Kaydet"
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="Veri Saklama Süresi (gün)" type="number"
                value={settings.dataRetention}
                onChange={(e) => setSettings({ ...settings, dataRetention: parseInt(e.target.value || '0', 10) })}
              />
            </CardContent>
          </Card>

                  </Grid>

        {/* Alt Kısım - Sistem İşlemleri */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={saveSettings} disabled={loading}>
              Ayarları Kaydet
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
