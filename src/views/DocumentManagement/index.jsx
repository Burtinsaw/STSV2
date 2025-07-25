// src/views/DocumentManagement/index.jsx - Evrak Yönetim Sistemi
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  LinearProgress,
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  LocalShipping as ShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const DocumentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    category: '',
    companyId: '',
    requestNumber: '',
    description: '',
    files: []
  });

  // Folder form state
  const [folderForm, setFolderForm] = useState({
    name: '',
    category: '',
    companyId: '',
    requestNumber: ''
  });

  // Ana kategoriler
  const categories = [
    { value: 'talepler', label: 'Talepler', icon: <AssignmentIcon />, color: 'primary' },
    { value: 'satinalma', label: 'Satın Alma', icon: <ShoppingCartIcon />, color: 'secondary' },
    { value: 'lojistik', label: 'Lojistik', icon: <ShippingIcon />, color: 'success' },
    { value: 'sirket', label: 'Şirket Yönetimi', icon: <BusinessIcon />, color: 'warning' },
    { value: 'diger', label: 'Diğer', icon: <DescriptionIcon />, color: 'info' }
  ];

  // Dosya türü ikonları
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconStyle = { fontSize: 20 };
    
    switch (extension) {
      case 'pdf':
        return <FileIcon style={{ ...iconStyle, color: '#d32f2f' }} />;
      case 'doc':
      case 'docx':
        return <FileIcon style={{ ...iconStyle, color: '#1976d2' }} />;
      case 'xls':
      case 'xlsx':
        return <FileIcon style={{ ...iconStyle, color: '#388e3c' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileIcon style={{ ...iconStyle, color: '#f57c00' }} />;
      default:
        return <FileIcon style={iconStyle} />;
    }
  };

  // Dosya boyutu formatla
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Şirket listesini yükle
  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Şirket listesi yüklenirken hata:', error);
    }
  };

  // Dosyaları listele
  const loadFiles = async (path = '/') => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/documents/list?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      
      if (data.success) {
        setFolders(data.data.folders || []);
        setFiles(data.data.files || []);
        setCurrentPath(path);
      } else {
        throw new Error(data.message);
      }
      
    } catch (error) {
      console.error('Dosya listeleme hatası:', error);
      showAlert('error', 'Dosyalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Dosya yükleme işlemi
  const handleFileUpload = async () => {
    try {
      if (!uploadForm.category) {
        showAlert('error', 'Kategori seçimi zorunludur');
        return;
      }
      
      if (uploadForm.files.length === 0) {
        showAlert('error', 'En az bir dosya seçmelisiniz');
        return;
      }
      
      setLoading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('category', uploadForm.category);
      formData.append('companyId', uploadForm.companyId);
      formData.append('requestNumber', uploadForm.requestNumber);
      formData.append('description', uploadForm.description);
      
      uploadForm.files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('success', data.message);
        setOpenUploadDialog(false);
        setUploadForm({
          category: '',
          companyId: '',
          requestNumber: '',
          description: '',
          files: []
        });
        loadFiles(currentPath);
      } else {
        throw new Error(data.message);
      }
      
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      showAlert('error', 'Dosya yükleme sırasında hata oluştu');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Klasör oluştur
  const handleCreateFolder = async () => {
    try {
      if (!folderForm.name) {
        showAlert('error', 'Klasör adı zorunludur');
        return;
      }
      
      setLoading(true);
      
      const response = await fetch('/api/documents/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: currentPath,
          name: folderForm.name
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'Klasör başarıyla oluşturuldu');
        setOpenFolderDialog(false);
        setFolderForm({ name: '', category: '', companyId: '', requestNumber: '' });
        loadFiles(currentPath);
      } else {
        throw new Error(data.message);
      }
      
    } catch (error) {
      console.error('Klasör oluşturma hatası:', error);
      showAlert('error', 'Klasör oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Dosya indir
  const downloadFile = async (file) => {
    try {
      const response = await fetch(`/api/documents/download?path=${encodeURIComponent(file.path)}`);
      const data = await response.json();
      
      if (data.success) {
        const link = document.createElement('a');
        link.href = data.data.downloadUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('success', 'Dosya indiriliyor...');
      } else {
        throw new Error(data.message);
      }
      
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      showAlert('error', 'Dosya indirilemedi');
    }
  };

  // Dosya sil
  const deleteFile = async (file) => {
    try {
      if (!window.confirm(`"${file.name}" dosyasını silmek istediğinizden emin misiniz?`)) {
        return;
      }
      
      const response = await fetch('/api/documents/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: file.path })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'Dosya başarıyla silindi');
        loadFiles(currentPath);
      } else {
        throw new Error(data.message);
      }
      
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      showAlert('error', 'Dosya silinirken hata oluştu');
    }
  };

  // Alert göster
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: 'success', message: '' });
    }, 5000);
  };

  // Breadcrumb oluştur
  const getBreadcrumbs = () => {
    const pathParts = currentPath.split('/').filter(part => part);
    const breadcrumbs = [{ name: 'Ana Dizin', path: '/' }];
    
    let currentBreadcrumbPath = '';
    pathParts.forEach(part => {
      currentBreadcrumbPath += `/${part}`;
      breadcrumbs.push({ name: part, path: currentBreadcrumbPath });
    });
    
    return breadcrumbs;
  };

  // Component mount
  useEffect(() => {
    loadCompanies();
    loadFiles('/');
  }, []);

  // Filtrelenmiş dosyalar
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                📁 Evrak Yönetimi
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Yandex Disk entegrasyonu ile dosya yönetimi
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => loadFiles(currentPath)}
                  disabled={loading}
                >
                  Yenile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FolderIcon />}
                  onClick={() => setOpenFolderDialog(true)}
                >
                  Klasör Oluştur
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => setOpenUploadDialog(true)}
                >
                  Dosya Yükle
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Arama ve Breadcrumb */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Dosya veya klasör ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Breadcrumbs>
                {getBreadcrumbs().map((breadcrumb, index) => (
                  <Link
                    key={index}
                    component="button"
                    variant="body2"
                    onClick={() => loadFiles(breadcrumb.path)}
                    sx={{ textDecoration: 'none' }}
                  >
                    {breadcrumb.name}
                  </Link>
                ))}
              </Breadcrumbs>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Kategori Kartları */}
      {currentPath === '/' && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={category.value}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { elevation: 4 }
                }}
                onClick={() => loadFiles(`/${category.value}`)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ color: `${category.color}.main`, mb: 1 }}>
                    {React.cloneElement(category.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography variant="h6" component="h3">
                    {category.label}
                  </Typography>
                  <Chip 
                    label="Klasör" 
                    color={category.color} 
                    size="small" 
                    sx={{ mt: 1 }} 
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dosya ve Klasör Listesi */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📂 {currentPath === '/' ? 'Ana Dizin' : currentPath}
          </Typography>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Klasörler */}
          {filteredFolders.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Klasörler ({filteredFolders.length})
              </Typography>
              <List dense>
                {filteredFolders.map((folder) => (
                  <ListItem
                    key={folder.path}
                    button
                    onClick={() => loadFiles(folder.path)}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1 
                    }}
                  >
                    <ListItemIcon>
                      <FolderIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={folder.name}
                      secondary={`Oluşturulma: ${new Date(folder.created).toLocaleDateString('tr-TR')}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Klasör" color="primary" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Dosyalar */}
          {filteredFiles.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Dosyalar ({filteredFiles.length})
              </Typography>
              <List dense>
                {filteredFiles.map((file) => (
                  <ListItem
                    key={file.path}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1 
                    }}
                  >
                    <ListItemIcon>
                      {getFileIcon(file.name)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Boyut: {formatFileSize(file.size)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Değiştirilme: {new Date(file.modified).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="İndir">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => downloadFile(file)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteFile(file)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : !loading && filteredFolders.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                {searchTerm ? 'Arama kriterine uygun dosya bulunamadı' : 'Bu klasörde henüz dosya bulunmuyor'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dosya Yükleme Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📤 Dosya Yükle
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Kategori *</InputLabel>
                  <Select
                    value={uploadForm.category}
                    label="Kategori *"
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {category.icon}
                          {category.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Şirket</InputLabel>
                  <Select
                    value={uploadForm.companyId}
                    label="Şirket"
                    onChange={(e) => setUploadForm({ ...uploadForm, companyId: e.target.value })}
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.code} - {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Talep Numarası"
                  value={uploadForm.requestNumber}
                  onChange={(e) => setUploadForm({ ...uploadForm, requestNumber: e.target.value })}
                  margin="normal"
                  placeholder="Örn: REQ-2024-001"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Dosya Seç
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => setUploadForm({ ...uploadForm, files: Array.from(e.target.files) })}
                  />
                </Button>
                {uploadForm.files.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Seçilen Dosyalar ({uploadForm.files.length}):
                    </Typography>
                    {uploadForm.files.map((file, index) => (
                      <Chip
                        key={index}
                        label={`${file.name} (${formatFileSize(file.size)})`}
                        onDelete={() => {
                          const newFiles = uploadForm.files.filter((_, i) => i !== index);
                          setUploadForm({ ...uploadForm, files: newFiles });
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
            
            {uploadProgress > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Yükleme İlerlemesi: %{uploadProgress}
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleFileUpload}
            disabled={loading || !uploadForm.category || uploadForm.files.length === 0}
          >
            Yükle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Klasör Oluşturma Dialog */}
      <Dialog open={openFolderDialog} onClose={() => setOpenFolderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          📁 Yeni Klasör Oluştur
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Klasör Adı *"
              value={folderForm.name}
              onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
              margin="normal"
              placeholder="Örn: Proje Belgeleri"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFolderDialog(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateFolder}
            disabled={loading || !folderForm.name}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManagement;
