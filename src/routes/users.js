// routes/users.js - Admin Kullanıcı Yönetimi Routes
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Mock kullanıcı verileri
const mockUsers = [
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    email: 'admin@company.com',
    role: 'admin',
    department: 'IT',
    status: 'active',
    lastLogin: new Date('2024-07-15T10:30:00'),
    createdAt: new Date('2024-01-01T00:00:00'),
    updatedAt: new Date('2024-07-15T10:30:00')
  },
  {
    id: 2,
    firstName: 'Satın Alma',
    lastName: 'Müdürü',
    username: 'manager1',
    email: 'manager1@bninovasyon.com',
    role: 'manager',
    department: 'Satın Alma',
    status: 'active',
    lastLogin: new Date('2024-07-14T16:45:00'),
    createdAt: new Date('2024-01-15T00:00:00'),
    updatedAt: new Date('2024-07-14T16:45:00')
  },
  {
    id: 3,
    firstName: 'Muhasebe',
    lastName: 'Uzmanı',
    username: 'accountant1',
    email: 'accountant1@bninovasyon.com',
    role: 'user',
    department: 'Muhasebe',
    status: 'active',
    lastLogin: new Date('2024-07-13T14:20:00'),
    createdAt: new Date('2024-02-01T00:00:00'),
    updatedAt: new Date('2024-07-13T14:20:00')
  },
  {
    id: 4,
    firstName: 'İnsan',
    lastName: 'Kaynakları',
    username: 'hr1',
    email: 'hr1@bninovasyon.com',
    role: 'user',
    department: 'İnsan Kaynakları',
    status: 'active',
    lastLogin: new Date('2024-07-12T11:15:00'),
    createdAt: new Date('2024-02-15T00:00:00'),
    updatedAt: new Date('2024-07-12T11:15:00')
  },
  {
    id: 5,
    firstName: 'Depo',
    lastName: 'Sorumlusu',
    username: 'warehouse1',
    email: 'warehouse1@bninovasyon.com',
    role: 'user',
    department: 'Depo',
    status: 'inactive',
    lastLogin: new Date('2024-07-01T09:30:00'),
    createdAt: new Date('2024-03-01T00:00:00'),
    updatedAt: new Date('2024-07-01T09:30:00')
  },
  {
    id: 6,
    firstName: 'Kalite',
    lastName: 'Kontrol',
    username: 'quality1',
    email: 'quality1@bninovasyon.com',
    role: 'user',
    department: 'Kalite Kontrol',
    status: 'active',
    lastLogin: new Date('2024-07-15T08:45:00'),
    createdAt: new Date('2024-03-15T00:00:00'),
    updatedAt: new Date('2024-07-15T08:45:00')
  }
];

// Kullanıcı listesini al
router.get('/', async (req, res) => {
  try {
    console.log('📋 Kullanıcı listesi istendi');
    
    // Şifre alanını kaldır
    const usersWithoutPassword = mockUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      message: 'Kullanıcı listesi başarıyla alındı',
      data: usersWithoutPassword,
      total: usersWithoutPassword.length
    });

  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı listesi alınırken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcı detayını al
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`👤 Kullanıcı detayı istendi: ${userId}`);
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Şifre alanını kaldır
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Kullanıcı detayı başarıyla alındı',
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Kullanıcı detay hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı detayı alınırken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcı şifresini sıfırla (Admin)
router.post('/:id/reset-password', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`🔑 Kullanıcı şifre sıfırlama istendi: ${userId}`);
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Geçici şifre oluştur
    const tempPassword = crypto.randomBytes(3).toString('hex').toUpperCase();
    console.log(`🔑 Geçici şifre oluşturuldu: ${tempPassword} (${user.email} için)`);

    // Mock: Kullanıcının şifresini güncelle (gerçek uygulamada veritabanında yapılır)
    user.password = tempPassword; // Gerçek uygulamada hash'lenmeli
    user.updatedAt = new Date();

    // E-posta gönderme simülasyonu
    console.log(`📧 Geçici şifre e-postası gönderildi: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı şifresi başarıyla sıfırlandı ve geçici şifre e-posta ile gönderildi',
      data: {
        userId: user.id,
        email: user.email,
        tempPassword: tempPassword, // Development modunda göster
        resetTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Kullanıcı şifre sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre sıfırlanırken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcı durumunu güncelle
router.patch('/:id/status', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;
    
    console.log(`🔄 Kullanıcı durum güncelleme istendi: ${userId} -> ${status}`);
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir durum belirtiniz (active/inactive)'
      });
    }

    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Mock: Kullanıcı durumunu güncelle
    user.status = status;
    user.updatedAt = new Date();

    console.log(`✅ Kullanıcı durumu güncellendi: ${user.username} -> ${status}`);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı durumu başarıyla güncellendi',
      data: {
        userId: user.id,
        username: user.username,
        status: user.status,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Kullanıcı durum güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı durumu güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// Yeni kullanıcı oluştur
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, username, email, role, department } = req.body;
    
    console.log('➕ Yeni kullanıcı oluşturma istendi:', { username, email, role });
    
    // Validasyon
    if (!firstName || !lastName || !username || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Tüm zorunlu alanları doldurunuz'
      });
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir e-posta adresi giriniz'
      });
    }

    // Kullanıcı adı ve e-posta benzersizlik kontrolü
    const existingUser = mockUsers.find(u => 
      u.username === username || u.email === email
    );
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor'
      });
    }

    // Geçici şifre oluştur
    const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Yeni kullanıcı oluştur
    const newUser = {
      id: Math.max(...mockUsers.map(u => u.id)) + 1,
      firstName,
      lastName,
      username,
      email,
      password: tempPassword, // Gerçek uygulamada hash'lenmeli
      role: role || 'user',
      department: department || 'Genel',
      status: 'active',
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock: Kullanıcıyı listeye ekle
    mockUsers.push(newUser);

    console.log(`✅ Yeni kullanıcı oluşturuldu: ${newUser.username}`);
    console.log(`🔑 Geçici şifre: ${tempPassword}`);

    // Şifre alanını response'dan kaldır
    const { password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        ...userWithoutPassword,
        tempPassword: tempPassword // Development modunda göster
      }
    });

  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı oluşturulurken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcı sil
router.delete('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`🗑️ Kullanıcı silme istendi: ${userId}`);
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    const user = mockUsers[userIndex];
    
    // Admin kullanıcısını silmeyi engelle
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin kullanıcısı silinemez'
      });
    }

    // Mock: Kullanıcıyı listeden kaldır
    mockUsers.splice(userIndex, 1);

    console.log(`✅ Kullanıcı silindi: ${user.username}`);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi',
      data: {
        deletedUser: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken hata oluştu',
      error: error.message
    });
  }
});

// Kullanıcı güncelle
router.put('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { firstName, lastName, email, role, department } = req.body;
    
    console.log(`📝 Kullanıcı güncelleme istendi: ${userId}`);
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // E-posta benzersizlik kontrolü (kendisi hariç)
    if (email && email !== user.email) {
      const existingUser = mockUsers.find(u => u.email === email && u.id !== userId);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Bu e-posta adresi zaten kullanılıyor'
        });
      }
    }

    // Mock: Kullanıcı bilgilerini güncelle
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    user.updatedAt = new Date();

    console.log(`✅ Kullanıcı güncellendi: ${user.username}`);

    // Şifre alanını kaldır
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;

