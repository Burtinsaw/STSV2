// src/utils/axios.js
import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 saniye timeout
  withCredentials: true, // Cookie'leri gönder
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request interceptor - Her istekte token ekle - ✅ GÜVENLİ HALE GETİRİLDİ
axiosInstance.interceptors.request.use(
  (config) => {
    // Hem localStorage hem sessionStorage'dan token al
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Token eklendi: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.log(`📡 Token yok: ${config.method?.toUpperCase()} ${config.url}`);
    }

    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi - ✅ GELİŞTİRİLDİ
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    
    // Response data'yı logla (development modunda)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Response Data:', response.data);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);

    // Response varsa detayları logla
    if (error.response) {
      console.error(`❌ Status: ${error.response.status}`);
      console.error(`❌ Data:`, error.response.data);
      console.error(`❌ URL: ${error.config?.url}`);
    }

    // 401 Unauthorized - Token geçersiz veya yok
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - Token geçersiz, storage temizleniyor');
      
      // Storage'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Login sayfasına yönlendir (sadece login sayfasında değilse)
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Login sayfasına yönlendiriliyor');
        window.location.href = '/login';
      }
    }

    // 403 Forbidden - Yetki yok
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden - Bu işlem için yetkiniz yok');
      
      // Kullanıcıya bildirim göster (toast, alert vs.)
      if (window.showNotification) {
        window.showNotification('Bu işlem için yetkiniz yok!', 'error');
      }
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 404 Not Found - Endpoint bulunamadı');
    }

    // 500 Server Error
    if (error.response?.status >= 500) {
      console.error('🔥 500+ Server Error - Sunucu hatası');
      
      // Kullanıcıya bildirim göster
      if (window.showNotification) {
        window.showNotification('Sunucu hatası! Lütfen daha sonra tekrar deneyin.', 'error');
      }
    }

    // Network Error
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout - İstek zaman aşımına uğradı');
      
      if (window.showNotification) {
        window.showNotification('İstek zaman aşımına uğradı!', 'error');
      }
    }

    // Network Error
    if (error.message === 'Network Error') {
      console.error('🌐 Network Error - Ağ bağlantısı sorunu');
      
      if (window.showNotification) {
        window.showNotification('Ağ bağlantısı sorunu!', 'error');
      }
    }

    return Promise.reject(error);
  }
);

// ✅ YENİ EKLENEN - Token yenileme fonksiyonu
export const refreshAuthToken = async () => {
  try {
    const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!currentToken) {
      throw new Error('Token bulunamadı');
    }

    // Token doğrulama endpoint'ini çağır
    const response = await axiosInstance.get('/api/auth/verify-token');
    
    if (response.data.success) {
      console.log('✅ Token hala geçerli');
      return true;
    } else {
      throw new Error('Token geçersiz');
    }
  } catch (error) {
    console.error('❌ Token yenileme hatası:', error);
    
    // Token'ları temizle
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    return false;
  }
};

// ✅ YENİ EKLENEN - Manuel logout fonksiyonu
export const clearAuthData = () => {
  console.log('🧹 Auth data temizleniyor...');
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
  // Axios header'ından da token'ı kaldır
  delete axiosInstance.defaults.headers.common['Authorization'];
  
  console.log('✅ Auth data temizlendi');
};

export default axiosInstance;

