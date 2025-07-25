// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Yandex SMTP konfigürasyonu
    this.transporter = nodemailer.createTransporter({
      host: 'smtp.yandex.com',
      port: 465,
      secure: true, // SSL kullan
      auth: {
        user: process.env.YANDEX_EMAIL, // .env dosyasından alınacak
        pass: process.env.YANDEX_APP_PASSWORD // Uygulama şifresi
      }
    });
  }

  // E-posta gönderme fonksiyonu
  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      const mailOptions = {
        from: `"Satın Alma Takip" <${process.env.YANDEX_EMAIL}>`,
        to: to,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('E-posta başarıyla gönderildi:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('E-posta gönderme hatası:', error);
      return { success: false, error: error.message };
    }
  }

  // Şifre sıfırlama e-postası
  async sendPasswordResetEmail(email, resetToken, userName = 'Kullanıcı') {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #5DADE2, #2E86AB); color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; background: #2E86AB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Şifre Sıfırlama</h1>
            <p>Satın Alma Takip Sistemi</p>
          </div>
          <div class="content">
            <h2>Merhaba ${userName},</h2>
            <p>Şifrenizi sıfırlamak için bir talepte bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
            </div>
            
            <p><strong>Önemli:</strong></p>
            <ul>
              <li>Bu bağlantı 1 saat geçerlidir</li>
              <li>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelin</li>
              <li>Güvenliğiniz için bağlantıyı kimseyle paylaşmayın</li>
            </ul>
            
            <p>Sorunuz varsa bizimle iletişime geçebilirsiniz.</p>
            
            <p>İyi çalışmalar,<br>Satın Alma Takip Ekibi</p>
          </div>
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
            <p>© 2024 Satın Alma Takip Sistemi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Şifre Sıfırlama - Satın Alma Takip Sistemi
      
      Merhaba ${userName},
      
      Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
      ${resetUrl}
      
      Bu bağlantı 1 saat geçerlidir.
      
      Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelin.
      
      İyi çalışmalar,
      Satın Alma Takip Ekibi
    `;

    return await this.sendEmail(
      email,
      '🔐 Şifre Sıfırlama - Satın Alma Takip',
      htmlContent,
      textContent
    );
  }

  // Hoş geldin e-postası
  async sendWelcomeEmail(email, userName, tempPassword = null) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #5DADE2, #2E86AB); color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; background: #2E86AB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .credentials { background: #fff; padding: 15px; border-left: 4px solid #2E86AB; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Hoş Geldiniz!</h1>
            <p>Satın Alma Takip Sistemi</p>
          </div>
          <div class="content">
            <h2>Merhaba ${userName},</h2>
            <p>Satın Alma Takip Sistemine hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p>
            
            ${tempPassword ? `
            <div class="credentials">
              <h3>🔑 Giriş Bilgileriniz:</h3>
              <p><strong>E-posta:</strong> ${email}</p>
              <p><strong>Geçici Şifre:</strong> ${tempPassword}</p>
              <p><em>Güvenliğiniz için ilk girişte şifrenizi değiştirmeniz önerilir.</em></p>
            </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Sisteme Giriş Yap</a>
            </div>
            
            <h3>📋 Sistem Özellikleri:</h3>
            <ul>
              <li>Satın alma süreçlerini takip edin</li>
              <li>Tedarikçi yönetimi</li>
              <li>Raporlama ve analiz</li>
              <li>Güvenli veri yönetimi</li>
            </ul>
            
            <p>Herhangi bir sorunuz varsa destek ekibimizle iletişime geçebilirsiniz.</p>
            
            <p>İyi çalışmalar,<br>Satın Alma Takip Ekibi</p>
          </div>
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
            <p>© 2024 Satın Alma Takip Sistemi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(
      email,
      '🎉 Hoş Geldiniz - Satın Alma Takip Sistemi',
      htmlContent
    );
  }

  // Sistem bildirimi e-postası
  async sendNotificationEmail(email, title, message, actionUrl = null) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #5DADE2, #2E86AB); color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; background: #2E86AB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 ${title}</h1>
            <p>Satın Alma Takip Sistemi</p>
          </div>
          <div class="content">
            <div style="background: white; padding: 20px; border-radius: 5px;">
              ${message}
            </div>
            
            ${actionUrl ? `
            <div style="text-align: center;">
              <a href="${actionUrl}" class="button">Detayları Görüntüle</a>
            </div>
            ` : ''}
            
            <p>İyi çalışmalar,<br>Satın Alma Takip Ekibi</p>
          </div>
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
            <p>© 2024 Satın Alma Takip Sistemi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(email, title, htmlContent);
  }

  // Bağlantı testi
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ E-posta sunucusu bağlantısı başarılı');
      return { success: true, message: 'Bağlantı başarılı' };
    } catch (error) {
      console.error('❌ E-posta sunucusu bağlantı hatası:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
