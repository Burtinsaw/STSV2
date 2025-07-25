// routes/email.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const emailService = require('../services/emailService');

// Şifre sıfırlama token'ları için geçici depolama (üretimde Redis kullanın)
const resetTokens = new Map();

// Şifre sıfırlama e-postası gönder
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-posta adresi gereklidir'
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

    // Burada normalde veritabanından kullanıcıyı kontrol edersiniz
    // Şimdilik demo için tüm e-postaları kabul ediyoruz
    
    // Sıfırlama token'ı oluştur
    const resetToken = jwt.sign(
      { email: email, timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Token'ı geçici olarak sakla (üretimde veritabanında saklayın)
    resetTokens.set(email, {
      token: resetToken,
      createdAt: Date.now(),
      used: false
    });

    // E-posta gönder
    const emailResult = await emailService.sendPasswordResetEmail(
      email,
      resetToken,
      'Değerli Kullanıcı' // Burada veritabanından kullanıcı adını alabilirsiniz
    );

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Şifre sıfırlama e-postası gönderildi',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'E-posta gönderilirken hata oluştu',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// Şifre sıfırlama token'ını doğrula
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token gereklidir'
      });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Token'ın kullanılıp kullanılmadığını kontrol et
    const storedToken = resetTokens.get(email);
    if (!storedToken || storedToken.token !== token || storedToken.used) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya kullanılmış token'
      });
    }

    // Token geçerli
    res.json({
      success: true,
      message: 'Token geçerli',
      email: email
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Token süresi dolmuş'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Geçersiz token',
      error: error.message
    });
  }
});

// Yeni şifre belirle
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token ve yeni şifre gereklidir'
      });
    }

    // Şifre uzunluğu kontrolü
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Token'ın kullanılıp kullanılmadığını kontrol et
    const storedToken = resetTokens.get(email);
    if (!storedToken || storedToken.token !== token || storedToken.used) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya kullanılmış token'
      });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Burada normalde veritabanında şifreyi güncellersiniz
    console.log(`Şifre güncellendi - E-posta: ${email}, Yeni şifre hash: ${hashedPassword}`);

    // Token'ı kullanılmış olarak işaretle
    storedToken.used = true;
    resetTokens.set(email, storedToken);

    // Başarı bildirimi e-postası gönder
    await emailService.sendNotificationEmail(
      email,
      '✅ Şifreniz Başarıyla Değiştirildi',
      `
        <h3>Şifre Değişikliği Tamamlandı</h3>
        <p>Merhaba,</p>
        <p>Şifreniz başarıyla değiştirildi. Eğer bu işlemi siz yapmadıysanız, lütfen derhal bizimle iletişime geçin.</p>
        <p><strong>Değişiklik Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}</p>
        <p>Güvenliğiniz için:</p>
        <ul>
          <li>Şifrenizi kimseyle paylaşmayın</li>
          <li>Güçlü ve benzersiz şifreler kullanın</li>
          <li>Düzenli olarak şifrenizi değiştirin</li>
        </ul>
      `
    );

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Token süresi dolmuş'
      });
    }

    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// Hoş geldin e-postası gönder
router.post('/send-welcome', async (req, res) => {
  try {
    const { email, userName, tempPassword } = req.body;

    if (!email || !userName) {
      return res.status(400).json({
        success: false,
        message: 'E-posta ve kullanıcı adı gereklidir'
      });
    }

    const emailResult = await emailService.sendWelcomeEmail(email, userName, tempPassword);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Hoş geldin e-postası gönderildi',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'E-posta gönderilirken hata oluştu',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Hoş geldin e-postası hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// E-posta bağlantısını test et
router.get('/test-connection', async (req, res) => {
  try {
    const result = await emailService.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'E-posta sunucusu bağlantısı başarılı'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'E-posta sunucusu bağlantı hatası',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bağlantı testi hatası',
      error: error.message
    });
  }
});

module.exports = router;
