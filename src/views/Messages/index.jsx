import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Button,
  Divider,
  IconButton,
  Badge,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const Messages = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Kullanıcıları yükle
  const loadUsers = async () => {
    try {
      console.log('👥 Kullanıcılar yükleniyor...');
      setLoading(true);
      const response = await axios.get('/api/messages/users');
      
      // Veri kontrolü
      const userData = response.data;
      if (Array.isArray(userData)) {
        setUsers(userData);
        console.log('✅ Kullanıcılar yüklendi:', userData.length);
        
        // Her kullanıcı için okunmamış mesaj sayısını yükle
        if (userData.length > 0) {
          loadUnreadCounts(userData);
        }
      } else {
        console.error('❌ Kullanıcı verisi array değil:', userData);
        setUsers([]);
        setError('Kullanıcı verisi geçersiz format');
      }
    } catch (error) {
      console.error('❌ Kullanıcı yükleme hatası:', error);
      setUsers([]);
      setError('Kullanıcılar yüklenirken hata oluştu: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Okunmamış mesaj sayılarını yükle
  const loadUnreadCounts = async (userList) => {
    try {
      if (!Array.isArray(userList) || userList.length === 0) {
        console.log('⚠️ Kullanıcı listesi boş, okunmamış sayı yüklenmiyor');
        return;
      }

      console.log('🔔 Okunmamış mesaj sayıları yükleniyor...');
      
      // Toplam okunmamış mesaj sayısını al
      const response = await axios.get('/api/messages/unread-count');
      const totalUnread = response.data.count || 0;
      
      console.log('✅ Toplam okunmamış mesaj:', totalUnread);
      
      // Basit implementasyon: tüm kullanıcılar için eşit dağıt
      const counts = {};
      if (totalUnread > 0) {
        const perUser = Math.max(1, Math.floor(totalUnread / userList.length));
        userList.forEach((user, index) => {
          counts[user.id] = index === 0 ? totalUnread - (perUser * (userList.length - 1)) : perUser;
        });
      } else {
        userList.forEach(user => {
          counts[user.id] = 0;
        });
      }
      
      setUnreadCounts(counts);
    } catch (error) {
      console.error('❌ Okunmamış sayı yükleme hatası:', error);
      setUnreadCounts({});
    }
  };

  // Mesajları yükle
  const loadMessages = async (userId) => {
    if (!userId) return;
    
    try {
      console.log('💬 Mesajlar yükleniyor:', userId);
      setLoading(true);
      const response = await axios.get(`/api/messages/chat/${userId}`);
      
      const messageData = response.data;
      if (Array.isArray(messageData)) {
        setMessages(messageData);
        console.log('✅ Mesajlar yüklendi:', messageData.length);
        
        // Okunmamış sayıyı sıfırla
        setUnreadCounts(prev => ({
          ...prev,
          [userId]: 0
        }));
        
        setTimeout(scrollToBottom, 100);
      } else {
        console.error('❌ Mesaj verisi array değil:', messageData);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Mesaj yükleme hatası:', error);
      setMessages([]);
      setError('Mesajlar yüklenirken hata oluştu: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Mesaj gönder
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      console.log('📤 Mesaj gönderiliyor...');
      setLoading(true);
      
      await axios.post('/api/messages/send', {
        receiverId: selectedUser.id,
        content: newMessage
      });

      setNewMessage('');
      setSuccess('Mesaj gönderildi!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Mesajları yeniden yükle
      setTimeout(() => loadMessages(selectedUser.id), 500);
    } catch (error) {
      console.error('❌ Mesaj gönderme hatası:', error);
      setError('Mesaj gönderilemedi: ' + (error.response?.data?.error || error.message));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Dosya gönder
  const sendFile = async (file) => {
    if (!file || !selectedUser) return;

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan büyük olamaz!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      console.log('📎 Dosya gönderiliyor:', file.name);
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiverId', selectedUser.id);

      await axios.post('/api/messages/send-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(`Dosya gönderildi: ${file.name}`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Mesajları yeniden yükle
      setTimeout(() => loadMessages(selectedUser.id), 500);
    } catch (error) {
      console.error('❌ Dosya gönderme hatası:', error);
      setError('Dosya gönderilemedi: ' + (error.response?.data?.error || error.message));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Dosya seç
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      sendFile(file);
    }
    // Input'u temizle
    event.target.value = '';
  };

  // Dosya indir
  const downloadFile = async (messageId, fileName) => {
    try {
      console.log('📥 Dosya indiriliyor:', fileName);
      const response = await axios.get(`/api/messages/download/${messageId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Dosya indirildi: ${fileName}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Dosya indirme hatası:', error);
      setError('Dosya indirilemedi: ' + (error.response?.data?.error || error.message));
      setTimeout(() => setError(''), 3000);
    }
  };

  // Kullanıcı seç
  const selectUser = (user) => {
    setSelectedUser(user);
    setMessages([]); // Önceki mesajları temizle
    loadMessages(user.id);
  };

  // Enter tuşu ile mesaj gönder
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Zaman formatla
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString('tr-TR', { 
          weekday: 'short',
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString('tr-TR', { 
          day: '2-digit', 
          month: '2-digit',
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    } catch (error) {
      console.error('❌ Zaman formatlama hatası:', error);
      return 'Bilinmiyor';
    }
  };

  // Mesajları yenile
  const refreshMessages = () => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
    }
    loadUsers();
  };

  // Component mount
  useEffect(() => {
    loadUsers();
    
    // 30 saniyede bir okunmamış sayıları güncelle
    const interval = setInterval(() => {
      if (users.length > 0) {
        loadUnreadCounts(users);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Seçili kullanıcı değiştiğinde mesajları güncelle
  useEffect(() => {
    if (selectedUser) {
      const interval = setInterval(() => {
        loadMessages(selectedUser.id);
      }, 10000); // 10 saniyede bir güncelle
      
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex' }}>
      {/* Sol Panel - Kullanıcı Listesi */}
      <Paper 
        sx={{ 
          width: 300, 
          borderRadius: 2,
          mr: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MessageIcon sx={{ mr: 1 }} />
              Mesajlaşma
            </Box>
            <IconButton 
              size="small" 
              sx={{ color: 'white' }}
              onClick={refreshMessages}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ m: 1 }}>
            {error}
          </Alert>
        )}
        
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {loading && users.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <ListItem
                key={user.id}
                button
                onClick={() => selectUser(user)}
                selected={selectedUser?.id === user.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: theme.palette.divider,
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.light + '20'
                  },
                  '&:hover': {
                    bgcolor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemAvatar>
                  <Badge 
                    badgeContent={unreadCounts[user.id] || 0} 
                    color="error"
                    max={99}
                  >
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <PersonIcon />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {user.email}
                      </Typography>
                      {unreadCounts[user.id] > 0 && (
                        <Chip 
                          label={`${unreadCounts[user.id]} yeni`}
                          size="small"
                          color="error"
                          sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Kullanıcı bulunamadı
              </Typography>
              <Button 
                size="small" 
                onClick={loadUsers} 
                sx={{ mt: 1 }}
                disabled={loading}
              >
                Yeniden Dene
              </Button>
            </Box>
          )}
        </List>
      </Paper>

      {/* Sağ Panel - Sohbet Alanı */}
      <Paper 
        sx={{ 
          flex: 1, 
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {selectedUser ? (
          <>
            {/* Sohbet Başlığı */}
            <Box sx={{ p: 2, bgcolor: theme.palette.grey[100], borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.username}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {selectedUser.email}
              </Typography>
            </Box>

            {/* Mesaj Alanı */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {loading && messages.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender?.id === selectedUser.id ? 'flex-start' : 'flex-end',
                          mb: 1
                        }}
                      >
                        <Card
                          sx={{
                            maxWidth: '70%',
                            bgcolor: message.sender?.id === selectedUser.id 
                              ? theme.palette.grey[100] 
                              : theme.palette.primary.main,
                            color: message.sender?.id === selectedUser.id 
                              ? theme.palette.text.primary 
                              : 'white'
                          }}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            {message.messageType === 'file' ? (
                              <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  📎 {message.fileName || 'Dosya'}
                                </Typography>
                                <Button
                                  size="small"
                                  startIcon={<DownloadIcon />}
                                  onClick={() => downloadFile(message.id, message.fileName)}
                                  sx={{ 
                                    color: message.sender?.id === selectedUser.id 
                                      ? theme.palette.primary.main 
                                      : 'white'
                                  }}
                                >
                                  İndir
                                </Button>
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {message.content || 'Mesaj içeriği yok'}
                              </Typography>
                            )}
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                mt: 0.5,
                                opacity: 0.7,
                                fontSize: '0.7rem'
                              }}
                            >
                              <TimeIcon sx={{ fontSize: '0.7rem', mr: 0.5 }} />
                              {formatTime(message.createdAt)}
                              {message.isRead && message.sender?.id !== selectedUser.id && ' ✓✓'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        Henüz mesaj yok. İlk mesajı gönderin!
                      </Typography>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Mesaj Gönderme Alanı */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 1 }}>
                  {success}
                </Alert>
              )}
              
              <Grid container spacing={1} alignItems="flex-end">
                <Grid item>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  />
                  <IconButton
                    color="primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    title="Dosya Ekle"
                  >
                    <AttachFileIcon />
                  </IconButton>
                </Grid>
                <Grid item xs>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Mesajınızı yazın... (Enter ile gönder)"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    endIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                    onClick={sendMessage}
                    disabled={loading || !newMessage.trim()}
                  >
                    Gönder
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column'
            }}
          >
            <MessageIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
              Mesajlaşmaya başlamak için bir kullanıcı seçin
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sol panelden mesajlaşmak istediğiniz kişiyi seçin
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Messages;

