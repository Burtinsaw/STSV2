class RealDocumentService {
  constructor() {
    this.openaiApiKey = import.meta.env?.VITE_OPENAI_API_KEY || '';
    this.geminiApiKey = import.meta.env?.VITE_GEMINI_API_KEY || '';
    this.googleApiKey = import.meta.env?.VITE_GOOGLE_API_KEY || '';
    
    if (import.meta.env?.DEV) {
      console.log('🔑 API Keys durumu:', {
        openai: this.openaiApiKey ? '✅ Var' : '❌ Yok',
        gemini: this.geminiApiKey ? '✅ Var' : '❌ Yok',
        google: this.googleApiKey ? '✅ Var' : '❌ Yok'
      });
    }
  }

  getAIProvider() {
    if (this.geminiApiKey) return 'gemini';
    if (this.openaiApiKey) return 'openai';
    return 'pattern';
  }

  async extractProductsWithGemini(text) {
    try {
      if (!this.geminiApiKey) {
        throw new Error('Gemini API key bulunamadı');
      }

      console.log('🤖 Gemini ile ürün çıkarma...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Aşağıdaki metinden ürünleri JSON formatında çıkar. Sadece JSON array döndür:
              
              Gerekli alanlar:
              - name: Ürün adı (zorunlu)
              - quantity: Miktar (sayı, zorunlu)
              - unit: Birim (zorunlu)
              - brand: Marka
              - model: Model
              - description: Açıklama
              - estimatedPrice: Tahmini fiyat (sayı)
              - currency: Para birimi
              
              Metin:
              ${text}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API hatası: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // JSON parse et
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const products = JSON.parse(jsonMatch[0]);
        console.log('✅ Gemini sonucu:', products.length, 'ürün');
        return products.map((p, i) => ({
          ...p,
          id: i + 1,
          source: 'gemini-ai'
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Gemini hatası:', error);
      throw error;
    }
  }

  async extractProductsWithOpenAI(text) {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key bulunamadı');
      }

      console.log('🧠 OpenAI ile ürün çıkarma...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: `Sen bir ürün çıkarma uzmanısın. Verilen metinden ürün listesi çıkar ve JSON formatında döndür.
            
            Gerekli alanlar:
            - name: Ürün adı (zorunlu)
            - quantity: Miktar (sayı, zorunlu)
            - unit: Birim (zorunlu)
            - brand: Marka
            - model: Model
            - description: Açıklama
            - estimatedPrice: Tahmini fiyat (sayı)
            - currency: Para birimi
            
            Sadece JSON array döndür, başka açıklama yapma.`
          }, {
            role: 'user',
            content: `Bu metinden ürünleri çıkar: ${text}`
          }],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API hatası: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const products = JSON.parse(content);
      
      console.log('✅ OpenAI sonucu:', products.length, 'ürün');
      return products.map((p, i) => ({
        ...p,
        id: i + 1,
        source: 'openai-gpt4'
      }));
    } catch (error) {
      console.error('❌ OpenAI hatası:', error);
      throw error;
    }
  }

  extractProductsWithPattern(text) {
    console.log('🔍 Pattern matching ile ürün çıkarma...');
    
    const products = [];
    const lines = text.split('\n');
    
    const patterns = [
      /(\d+)\s*[x×]\s*(.+?)(?:\s+(\d+(?:[.,]\d+)?)\s*(TL|USD|EUR|₺|\$|€|₽))?/gi,
      /(.+?)\s*[-–]\s*(\d+)\s*(adet|pcs|pieces|units?|шт)(?:\s+(\d+(?:[.,]\d+)?)\s*(TL|USD|EUR|₺|\$|€|₽))?/gi,
      /\d+[.)]\s*(.+?)(?:\s+(\d+)\s*(adet|pcs|шт)?)?(?:\s+(\d+(?:[.,]\d+)?)\s*(TL|USD|EUR|₺|\$|€|₽))?/gi
    ];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.length < 3) return;
      
      patterns.forEach(pattern => {
        const matches = [...trimmedLine.matchAll(pattern)];
        matches.forEach(match => {
          let product;
          if (pattern.source.startsWith(String.raw`(\d+)`)) {
            product = {
              name: match[2]?.trim() || '',
              quantity: parseInt(match[1]) || 1,
              unit: 'adet',
              estimatedPrice: match[3] ? parseFloat(match[3].replace(',', '.')) : 0,
              currency: match[4] || 'TL',
              source: 'pattern-1'
            };
          } else if (pattern.source.includes('[-–]')) {
            product = {
              name: match[1]?.trim() || '',
              quantity: parseInt(match[2]) || 1,
              unit: match[3] || 'adet',
              estimatedPrice: match[4] ? parseFloat(match[4].replace(',', '.')) : 0,
              currency: match[5] || 'TL',
              source: 'pattern-2'
            };
          } else {
            product = {
              name: match[1]?.trim() || '',
              quantity: match[2] ? parseInt(match[2]) : 1,
              unit: match[3] || 'adet',
              estimatedPrice: match[4] ? parseFloat(match[4].replace(',', '.')) : 0,
              currency: match[5] || 'TL',
              source: 'pattern-3'
            };
          }
          
          if (product.name && product.name.length > 2) {
            product.description = trimmedLine;
            product.lineNumber = index + 1;
            products.push(product);
          }
        });
      });
    });
    
    // Benzersiz ürünleri filtrele
    const uniqueProducts = [];
    const seen = new Set();
    products.forEach(product => {
      const key = `${product.name.toLowerCase()}-${product.quantity}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueProducts.push(product);
      }
    });
    
    console.log('✅ Pattern matching sonucu:', uniqueProducts.length, 'ürün');
    return uniqueProducts;
  }

  async detectLanguage(text) {
    try {
      if (this.googleApiKey) {
        console.log('🔍 Google Translate ile dil algılama...');
        
        const response = await fetch('https://translation.googleapis.com/language/translate/v2/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: this.googleApiKey,
            q: text.substring(0, 1000)
          })
        });

        if (response.ok) {
          const data = await response.json();
          const detectedLang = data.data.detections[0][0].language;
          console.log('✅ Algılanan dil:', detectedLang);
          return detectedLang;
        }
      }
    } catch (error) {
      console.warn('⚠️ Google dil algılama hatası:', error);
    }

    // Fallback: Pattern matching ile dil algılama
    const rusChars = /[а-яА-Я]/g;
    const engChars = /[a-zA-Z]/g;
    const trChars = /[çğıöşüÇĞİÖŞÜ]/g;
    
    const rusCount = (text.match(rusChars) || []).length;
    const engCount = (text.match(engChars) || []).length;
    const trCount = (text.match(trChars) || []).length;
    
    if (rusCount > engCount && rusCount > trCount) return 'ru';
    if (trCount > engCount) return 'tr';
    return 'en';
  }

  async translateText(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) return text;
    
    try {
      if (this.googleApiKey) {
        console.log(`🌐 Google Translate ile çeviri: ${sourceLang} → ${targetLang}`);
        
        const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: this.googleApiKey,
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const translatedText = data.data.translations[0].translatedText;
          console.log('✅ Çeviri tamamlandı');
          return translatedText;
        }
      }
    } catch (error) {
      console.error('❌ Google Translate hatası:', error);
    }

    // Fallback: Basit kelime çevirisi
    const translations = {
      'en-tr': {
        'Product List': 'Ürün Listesi',
        'Quantity': 'Miktar',
        'Price': 'Fiyat',
        'Unit': 'Birim',
        'Description': 'Açıklama'
      },
      'ru-tr': {
        'Список товаров': 'Ürün Listesi',
        'Количество': 'Miktar',
        'Цена': 'Fiyat',
        'Единица': 'Birim',
        'Описание': 'Açıklama',
        'Автоматы': 'Otomatlar',
        'SCHNEIDER': 'SCHNEIDER',
        'количество': 'miktar',
        'цена': 'fiyat',
        'рубль': 'ruble',
        'Наименование товара': 'Ürün Adı',
        'Название модели': 'Model Adı',
        'Желаемый производитель': 'İstenen Üretici',
        'Кол-во': 'Miktar',
        'Цена': 'Fiyat'
      }
    };
    
    let translated = text;
    const langPair = `${sourceLang}-${targetLang}`;
    if (translations[langPair]) {
      Object.entries(translations[langPair]).forEach(([key, value]) => {
        translated = translated.replace(new RegExp(key, 'gi'), value);
      });
    }
    
    return translated;
  }

  async parseExcelFile(file) {
    try {
      console.log('📊 Excel parsing başlatılıyor...');
      
      // Dynamically import xlsx library
      const XLSX = await import('xlsx');
      
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log('📊 Excel satır sayısı:', jsonData.length);
      
      const products = [];
      const headers = jsonData[0] || [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        const product = {
          id: i,
          name: row[1] || row[0] || '',
          brand: row[3] || '',
          model: row[2] || '',
          quantity: parseInt(row[4]) || 1,
          unit: 'adet',
          estimatedPrice: parseFloat(row[6]) || 0,
          currency: '₽',
          source: 'excel',
          description: row.join(' - ')
        };
        
        if (product.name && product.name.length > 2) {
          products.push(product);
        }
      }
      
      console.log('✅ Excel\'den çıkarılan ürün sayısı:', products.length);
      
      const text = jsonData.map(row => row.join('\t')).join('\n');
      return { text, products };
    } catch (error) {
      console.error('❌ Excel parsing hatası:', error);
      throw new Error(`Excel dosyası işlenemedi: ${error.message}`);
    }
  }

  async parsePdfFile(file) {
    try {
      console.log('📄 PDF parsing başlatılıyor...');
      
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(' ') + '\n';
      }
      
      console.log('✅ PDF metin çıkarıldı, uzunluk:', text.length);
      return text;
    } catch (error) {
      console.error('❌ PDF parsing hatası:', error);
      return `PDF DOSYASI TESPİT EDİLDİ

Bu bir PDF dosyasıdır. İçeriği okumak için:

1. 📂 PDF dosyasını açın
2. 🔍 Ctrl+A ile tüm içeriği seçin
3. 📋 Ctrl+C ile kopyalayın  
4. 📝 Aşağıdaki çeviri alanına Ctrl+V ile yapıştırın
5. 🔄 "Çevir ve Ürünleri Çıkar" butonuna tıklayın

Alternatif: PDF'i Excel'e dönüştürüp yükleyebilirsiniz.`;
    }
  }

  async parseImageFile(file) {
    try {
      console.log('🖼️ OCR işlemi başlatılıyor...');
      
      // Dynamically import tesseract.js
      const Tesseract = await import('tesseract.js');
      
      const result = await Tesseract.recognize(
        file,
        'tur+eng+rus',
        { logger: m => console.log(m) }
      );
      
      console.log('✅ OCR tamamlandı, metin uzunluğu:', result.data.text.length);
      return result.data.text;
    } catch (error) {
      console.error('❌ OCR hatası:', error);
      return `RESİM DOSYASI TESPİT EDİLDİ

OCR işlemi için Tesseract.js kütüphanesi gerekli.

Manuel işlem:
1. 🖼️ Resmi açın
2. 📝 İçeriği manuel olarak yazın
3. 📋 Aşağıdaki çeviri alanına yapıştırın
4. 🔄 "Çevir ve Ürünleri Çıkar" butonuna tıklayın`;
    }
  }

  async parseWordFile(file) {
    const text = await file.text();
    
    // Binary içerik kontrolü
    if (text.includes('word/') || text.includes('PK') || text.includes('xml')) {
      console.warn('📄 DOCX binary içeriği tespit edildi');
      return `DOCX DOSYASI TESPİT EDİLDİ

Bu bir Word belgesi (.docx) dosyasıdır. İçeriği okumak için:

1. 📂 Word belgesini açın
2. 🔍 Ctrl+A ile tüm içeriği seçin  
3. 📋 Ctrl+C ile kopyalayın
4. 📝 Aşağıdaki çeviri alanına Ctrl+V ile yapıştırın
5. 🔄 "Çevir ve Ürünleri Çıkar" butonuna tıklayın

Bu şekilde içerik AI sistemi ile işlenecektir.`;
    }
    
    return text;
  }

  async processFile(file) {
    try {
      console.log('📁 Dosya işleme başlatılıyor...');
      
      let text = '';
      let products = [];
      
      if (file.type.includes('image')) {
        text = await this.parseImageFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const result = await this.parseExcelFile(file);
        text = result.text;
        products = result.products;
      } else if (file.name.endsWith('.pdf')) {
        text = await this.parsePdfFile(file);
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        text = await this.parseWordFile(file);
      } else {
        text = await file.text();
      }
      
      return { text, products };
    } catch (error) {
      console.error('💥 Dosya işleme hatası:', error);
      throw error;
    }
  }

  async extractProductsWithAI(text, provider = this.getAIProvider()) {
    if (provider === 'gemini' && this.geminiApiKey) {
      return await this.extractProductsWithGemini(text);
    } else if (provider === 'openai' && this.openaiApiKey) {
      return await this.extractProductsWithOpenAI(text);
    } else {
      return this.extractProductsWithPattern(text);
    }
  }
}

// Singleton instance
const realDocumentService = new RealDocumentService();

export default realDocumentService;