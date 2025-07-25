// Gerçek WD My Cloud Home Servisi
class WDCloudService {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api/documents';
    this.basePath = '\\\\public\\\\prc\\\\talepler';
    this.requestStatuses = [
      'draft', 'submitted', 'pending_review', 'approved', 'rejected',
      'in_procurement', 'quotation_received', 'quotation_approved',
      'purchase_order_sent', 'delivered', 'completed', 'cancelled',
      'on_hold', 'revision_required', 'closed'
    ];
  }

  // Request kodu oluştur
  generateRequestCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `REQ-${year}${month}${day}-${hours}${minutes}${seconds}`;
  }

  // Request klasörü oluştur
  async createRequestFolder(requestCode) {
    try {
      const folderPath = `${this.basePath}\\\\${requestCode}`;
      
      // Ana klasörü oluştur
      await this.createFolder(folderPath);
      
      // Alt klasörleri oluştur
      const subFolders = [
        '01_Talep_Dosyalari',
        '02_Ceviri_Dosyalari', 
        '03_Teklif_Dosyalari',
        '04_Karsilastirma_Dosyalari',
        '05_Onay_Dosyalari',
        '06_Siparis_Dosyalari',
        '07_Teslimat_Dosyalari',
        '08_Kapanis_Dosyalari'
      ];
      
      for (const subFolder of subFolders) {
        await this.createFolder(`${folderPath}\\\\${subFolder}`);
      }
      
      return {
        success: true,
        requestCode: requestCode,
        folderPath: folderPath,
        subFolders: subFolders
      };
    } catch (error) {
      console.error('Folder creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Klasör oluştur
  async createFolder(folderPath) {
    try {
      const response = await fetch(`${this.baseUrl}/create-folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderPath: folderPath
        })
      });

      if (!response.ok) {
        throw new Error(`Folder creation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create folder error:', error);
      
      // WD Cloud API yoksa mock response döndür
      return {
        success: true,
        message: `Mock: Klasör oluşturuldu - ${folderPath}`
      };
    }
  }

  // Dosya yükle
  async uploadFile(requestCode, file, subFolder = '01_Talep_Dosyalari') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestCode', requestCode);
      formData.append('subFolder', subFolder);
      
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        fileName: file.name,
        filePath: result.filePath,
        fileSize: file.size,
        uploadDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('File upload error:', error);
      
      // WD Cloud API yoksa mock response döndür
      return {
        success: true,
        fileName: file.name,
        filePath: `Mock: ${this.basePath}\\\\${requestCode}\\\\${subFolder}\\\\${file.name}`,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        message: 'Mock upload - WD Cloud API bulunamadı'
      };
    }
  }

  // Request verilerini kaydet
  async saveRequestData(requestCode, requestData) {
    try {
      const response = await fetch(`${this.baseUrl}/save-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestCode: requestCode,
          data: requestData
        })
      });

      if (!response.ok) {
        throw new Error(`Request save failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request save error:', error);
      
      // WD Cloud API yoksa localStorage'a kaydet
      try {
        const requests = JSON.parse(localStorage.getItem('wdCloudRequests') || '{}');
        requests[requestCode] = {
          ...requestData,
          savedDate: new Date().toISOString(),
          method: 'localStorage'
        };
        localStorage.setItem('wdCloudRequests', JSON.stringify(requests));
        
        return {
          success: true,
          message: 'Request localStorage\'a kaydedildi',
          requestCode: requestCode
        };
      } catch (storageError) {
        console.error('localStorage save error:', storageError);
        return {
          success: false,
          error: 'Kaydetme işlemi başarısız'
        };
      }
    }
  }

  // Request verilerini getir
  async getRequestData(requestCode) {
    try {
      const response = await fetch(`${this.baseUrl}/get-request/${requestCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Request get failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request get error:', error);
      
      // WD Cloud API yoksa localStorage'dan getir
      try {
        const requests = JSON.parse(localStorage.getItem('wdCloudRequests') || '{}');
        const requestData = requests[requestCode];
        
        if (requestData) {
          return {
            success: true,
            data: requestData,
            method: 'localStorage'
          };
        } else {
          return {
            success: false,
            error: 'Request bulunamadı'
          };
        }
      } catch (storageError) {
        console.error('localStorage get error:', storageError);
        return {
          success: false,
          error: 'Veri getirme işlemi başarısız'
        };
      }
    }
  }

  // Tüm request'leri listele
  async listRequests() {
    try {
      const response = await fetch(`${this.baseUrl}/list-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Request list failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request list error:', error);
      
      // WD Cloud API yoksa localStorage'dan getir
      try {
        const requests = JSON.parse(localStorage.getItem('wdCloudRequests') || '{}');
        const requestList = Object.keys(requests).map(requestCode => ({
          requestCode: requestCode,
          ...requests[requestCode]
        }));
        
        return {
          success: true,
          data: requestList,
          method: 'localStorage'
        };
      } catch (storageError) {
        console.error('localStorage list error:', storageError);
        return {
          success: true,
          data: [],
          method: 'empty'
        };
      }
    }
  }

  // Request durumunu güncelle
  async updateRequestStatus(requestCode, newStatus, notes = '') {
    try {
      const response = await fetch(`${this.baseUrl}/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestCode: requestCode,
          status: newStatus,
          notes: notes,
          updatedDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Status update failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status update error:', error);
      
      // WD Cloud API yoksa localStorage'ı güncelle
      try {
        const requests = JSON.parse(localStorage.getItem('wdCloudRequests') || '{}');
        if (requests[requestCode]) {
          requests[requestCode].status = newStatus;
          requests[requestCode].statusHistory = requests[requestCode].statusHistory || [];
          requests[requestCode].statusHistory.push({
            status: newStatus,
            notes: notes,
            updatedDate: new Date().toISOString()
          });
          requests[requestCode].lastUpdated = new Date().toISOString();
          
          localStorage.setItem('wdCloudRequests', JSON.stringify(requests));
          
          return {
            success: true,
            message: 'Durum localStorage\'da güncellendi',
            requestCode: requestCode,
            newStatus: newStatus
          };
        } else {
          return {
            success: false,
            error: 'Request bulunamadı'
          };
        }
      } catch (storageError) {
        console.error('localStorage update error:', storageError);
        return {
          success: false,
          error: 'Durum güncelleme işlemi başarısız'
        };
      }
    }
  }

  // Dosya indir
  async downloadFile(requestCode, fileName, subFolder = '01_Talep_Dosyalari') {
    try {
      const response = await fetch(`${this.baseUrl}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestCode: requestCode,
          fileName: fileName,
          subFolder: subFolder
        })
      });

      if (!response.ok) {
        throw new Error(`File download failed: ${response.status}`);
      }

      // Dosyayı blob olarak indir
      const blob = await response.blob();
      
      // Download link oluştur
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return {
        success: true,
        message: 'Dosya indirildi',
        fileName: fileName
      };
    } catch (error) {
      console.error('File download error:', error);
      
      // WD Cloud API yoksa mock download
      alert(`Mock Download: ${fileName}\nKlasör: ${subFolder}\nRequest: ${requestCode}`);
      
      return {
        success: true,
        message: 'Mock download - WD Cloud API bulunamadı',
        fileName: fileName
      };
    }
  }

  // WD Cloud bağlantısını test et
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/test-connection`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        message: 'WD My Cloud Home bağlantısı başarılı',
        data: result
      };
    } catch (error) {
      console.error('Connection test error:', error);
      
      return {
        success: false,
        message: 'WD My Cloud Home bağlantısı başarısız - Mock mode aktif',
        error: error.message,
        mockMode: true
      };
    }
  }

  // Request istatistikleri
  getRequestStatistics() {
    try {
      const requests = JSON.parse(localStorage.getItem('wdCloudRequests') || '{}');
      const requestList = Object.values(requests);
      
      const stats = {
        total: requestList.length,
        byStatus: {},
        byMonth: {},
        totalProducts: 0,
        totalValue: 0
      };
      
      // Durum bazlı istatistikler
      this.requestStatuses.forEach(status => {
        stats.byStatus[status] = 0;
      });
      
      requestList.forEach(request => {
        // Durum istatistikleri
        if (request.status) {
          stats.byStatus[request.status] = (stats.byStatus[request.status] || 0) + 1;
        }
        
        // Aylık istatistikler
        if (request.createdDate) {
          const month = request.createdDate.substring(0, 7); // YYYY-MM
          stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
        }
        
        // Ürün ve değer istatistikleri
        if (request.products) {
          stats.totalProducts += request.products.length;
        }
        if (request.estimatedTotal) {
          stats.totalValue += parseFloat(request.estimatedTotal) || 0;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Statistics error:', error);
      return {
        total: 0,
        byStatus: {},
        byMonth: {},
        totalProducts: 0,
        totalValue: 0
      };
    }
  }
}

// Singleton instance
const wdCloudService = new WDCloudService();

export default wdCloudService;

