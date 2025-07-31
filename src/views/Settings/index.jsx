import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, TextField, Button, Switch, FormControlLabel, Divider, Alert,
  Card, CardContent, CardHeader, Select, MenuItem, FormControl, InputLabel,
  IconButton, Chip, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import {
  Settings as SettingsIcon, Security as SecurityIcon, Notifications as NotificationsIcon,
  Language as LanguageIcon, Business as BusinessIcon, Storage as StorageIcon,
  Save as SaveIcon, Refresh as RefreshIcon, Download as DownloadIcon, Delete as DeleteIcon,
  Visibility, VisibilityOff
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from 'contexts/AuthContext';
import { useThemeMode } from 'contexts/ThemeContext';
import axios from 'axios';

const Settings = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  const loadSettings = async () => {
    try {
      setLoading(true);
      setSettings(prev => ({ ...prev, theme: mode }));
      setCompanyInfo({
        name: 'Nazy Yapı İnşaat', address: 'İstanbul, Türkiye', phone: '+90 212 555 0123',
        email: 'info@nazyapi.com', taxNumber: '1234567890', website: 'www.nazyapi.com'
      });
    } catch (error) {
      console.error('Ayar yükleme hatası:', error);
      setError('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
        <Grid item xs={12} md={6}>
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

        <Grid item xs={12} md={6}>
          <Card>
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

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={saveSettings} disabled={loading}>
              Ayarları Kaydet
export default Settings;
