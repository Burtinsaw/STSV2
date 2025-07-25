// src/services/api.js
import axiosInstance from '../utils/axios';

// ==================== AUTH SERVICES ====================
export const authAPI = {
  // Giriş yap
  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },

  // Çıkış yap
  logout: async () => {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  },

  // Kullanıcı bilgilerini al
  getProfile: async () => {
    const response = await axiosInstance.get('/api/auth/profile');
    return response.data;
  },

  // Şifre değiştir
  changePassword: async (passwordData) => {
    const response = await axiosInstance.post('/api/auth/change-password', passwordData);
    return response.data;
  }
};

// ==================== DASHBOARD SERVICES ====================
export const dashboardAPI = {
  // Dashboard istatistiklerini al
  getStats: async () => {
    const response = await axiosInstance.get('/api/dashboard/stats');
    return response.data;
  },

  // Son aktiviteleri al
  getRecentActivities: async () => {
    const response = await axiosInstance.get('/api/dashboard/activities');
    return response.data;
  },

  // Grafik verilerini al
  getChartData: async (chartType) => {
    const response = await axiosInstance.get(`/api/dashboard/charts/${chartType}`);
    return response.data;
  }
};

// ==================== EMAIL SERVICES ====================

// Şifre sıfırlama e-postası gönder
export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await axiosInstance.post('/api/email/forgot-password', {
      email: email
    });
    
    return {
      success: true,
      message: response.data.message,
      messageId: response.data.messageId,
      // Development modunda geçici şifreyi göster
      tempPassword: response.data.tempPassword
    };
    
  } catch (error) {
    console.error('Şifre sıfırlama e-postası hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'E-posta gönderilirken hata oluştu'
    };
  }
};

// Hoş geldin e-postası gönder
export const sendWelcomeEmail = async (email, firstName, tempPassword) => {
  try {
    const response = await axiosInstance.post('/api/email/send-welcome', {
      email: email,
      firstName: firstName,
      tempPassword: tempPassword
    });
    
    return {
      success: true,
      message: response.data.message,
      messageId: response.data.messageId
    };
    
  } catch (error) {
    console.error('Hoş geldin e-postası hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'E-posta gönderilirken hata oluştu'
    };
  }
};

// E-posta bağlantı testi
export const testEmailConnection = async () => {
  try {
    const response = await axiosInstance.get('/api/email/test-connection');
    
    return {
      success: true,
      message: response.data.message,
      timestamp: response.data.timestamp
    };
    
  } catch (error) {
    console.error('E-posta bağlantı testi hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Bağlantı testi başarısız'
    };
  }
};

// Bildirim e-postası gönder
export const sendNotificationEmail = async (email, title, message, actionUrl = null) => {
  try {
    const response = await axiosInstance.post('/api/email/send-notification', {
      email: email,
      title: title,
      message: message,
      actionUrl: actionUrl
    });
    
    return {
      success: true,
      message: response.data.message,
      messageId: response.data.messageId
    };
    
  } catch (error) {
    console.error('Bildirim e-postası hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'E-posta gönderilirken hata oluştu'
    };
  }
};

// ==================== KULLANICI YÖNETİMİ SERVICES ====================

// Kullanıcı listesini al
export const getUserList = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/users');
    return response.data;
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    throw error.response?.data || { message: 'Kullanıcı listesi alınırken hata oluştu' };
  }
};

// Kullanıcı şifresini sıfırla (Admin)
export const resetUserPassword = async (userId) => {
  try {
    const response = await axiosInstance.post(`/api/admin/users/${userId}/reset-password`);
    return response.data;
  } catch (error) {
    console.error('Kullanıcı şifre sıfırlama hatası:', error);
    throw error.response?.data || { message: 'Şifre sıfırlanırken hata oluştu' };
  }
};

// Kullanıcı durumunu güncelle
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/users/${userId}/status`, {
      status: status
    });
    return response.data;
  } catch (error) {
    console.error('Kullanıcı durum güncelleme hatası:', error);
    throw error.response?.data || { message: 'Kullanıcı durumu güncellenirken hata oluştu' };
  }
};

// Yeni kullanıcı oluştur
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/api/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    throw error.response?.data || { message: 'Kullanıcı oluşturulurken hata oluştu' };
  }
};

// Kullanıcı sil
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    throw error.response?.data || { message: 'Kullanıcı silinirken hata oluştu' };
  }
};

