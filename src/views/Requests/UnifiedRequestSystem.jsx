import React, { useState, useRef, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  Switch,
  FormControlLabel,
  Snackbar,
  LinearProgress,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Translate as TranslateIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AutoAwesome as AIIcon,
  Language as LanguageIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  TableChart as ExcelIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon
} from '@mui/icons-material';

// Gerçek belge işleme servisi (Önceki mesajlarda olduğu gibi)
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
        source: 'openai-ai'
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
    // Gerçek Google Translate API
    try {
      console.log('🔍 GERÇEK dil algılama başlatılıyor...');
      if (!this.googleApiKey) {
        throw new Error('Google API key bulunamadı');
      }
      
      const response = await fetch('https://translation.googleapis.com/language/translate/v2/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: this.googleApiKey,
          q: text.substring(0, 1000) // İlk 1000 karakter
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const detectedLang = data.data.detections[0][0].language;
        console.log('✅ GERÇEK algılanan dil:', detectedLang);
        return detectedLang;
      } else {
        throw new Error(`Google Detect API hatası: ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ GERÇEK dil algılama hatası, fallback kullanılıyor:', error);
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
  }

  async translateText(text, sourceLang, targetLang = 'tr') {
    if (sourceLang === targetLang) {
      console.log('✅ Aynı dil, çeviri gerekmiyor');
      return text;
    }
    
    // Gerçek Google Translate API
    try {
      console.log(`🌐 GERÇEK çeviri: ${sourceLang} → ${targetLang}`);
      if (!this.googleApiKey) {
        throw new Error('Google API key bulunamadı');
      }
      
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
        console.log('✅ GERÇEK çeviri tamamlandı');
        return translatedText;
      } else {
        throw new Error(`Google Translate API hatası: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ GERÇEK çeviri hatası:', error);
      // Fallback: Basit kelime çevirisi
      const translations = {
        'ru-tr': {
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
  }

  async parseExcelFile(file) {
    try {
      console.log('📊 GERÇEK Excel parsing başlatılıyor...');
      // Dynamically import xlsx library
      const XLSX = await import('xlsx');
      
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('📊 Excel satır sayısı:', jsonData.length);
      
      // Metin olarak birleştir
      const text = jsonData.map(row => row.join('\t')).join('\n');
      
      // Ürünleri çıkar
      const products = [];
      const headers = jsonData[0] || [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        const product = {
          id: i,
          name: row[1] || row[0] || '', // İkinci veya birinci kolon
          brand: row[3] || '', // Dördüncü kolon (üretici)
          model: row[2] || '', // Üçüncü kolon (model)
          quantity: parseInt(row[4]) || 1, // Beşinci kolon (miktar)
          unit: 'adet',
          estimatedPrice: parseFloat(row[6]) || 0, // Yedinci kolon (fiyat)
          currency: '₺',
          source: 'excel',
          description: row.join(' - ')
        };
        
        if (product.name && product.name.length > 2) {
          products.push(product);
        }
      }
      
      return { text, products };
    } catch (error) {
      console.error('❌ Excel parsing hatası:', error);
      throw new Error(`Excel dosyası işlenemedi: ${error.message}`);
    }
  }

  async parsePdfFile(file) {
    try {
      console.log('📄 GERÇEK PDF parsing başlatılıyor...');
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({  arrayBuffer }).promise;
      
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
      console.log('🖼️ GERÇEK OCR işlemi başlatılıyor...');
      // Dynamically import tesseract.js
      const Tesseract = await import('tesseract.js');
      
      const result = await Tesseract.recognize(
        file,
        'tur+eng+rus',
        { logger: m => console.log(m) }
      );
      
      console.log('✅ GERÇEK OCR tamamlandı, metin uzunluğu:', result.data.text.length);
      return result.data.text;
    } catch (error) {
      console.error('❌ GERÇEK OCR hatası:', error);
      return `RESİM DOSYASI TESPİT EDİLDİ
OCR işlemi için Tesseract.js kütüphanesi gerekli.

Manuel işlem:
1. 🖼️ Resmi açın
2. 📝 İçeriği manuel olarak yazın
3. 📋 Aşağıdaki çeviri alanına yapıştırın
4. 🔄 "Çevir ve Ürünleri Çıkar" butonuna tıklayın`;
    }
  }

  async processFile(file) {
    try {
      console.log('📁 GERÇEK dosya işleme başlatılıyor...');
      console.log('📄 Dosya bilgileri:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
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
      } else {
        text = await file.text();
      }
      
      return { text, products };
    } catch (error) {
      console.error('💥 GERÇEK dosya işleme hatası:', error);
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
const documentService = new RealDocumentService();

// Ana component
const UnifiedRequestSystem = () => {
  // === STATELER ===
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedProducts, setExtractedProducts] = useState([]); // Çıkarılan tüm ürünler
  const [selectedProducts, setSelectedProducts] = useState([]); // Talebe eklenecek ürünler
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('tr');
  const [requestData, setRequestData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    companyName: '',
    department: ''
  });
  const [editDialog, setEditDialog] = useState({ open: false, product: null, index: -1, isForSelected: false }); // isForSelected: Düzenlenen ürün selectedProducts'tan mı?
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [aiProvider, setAiProvider] = useState(documentService.getAIProvider());
  const [useAI, setUseAI] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [apiStatus, setApiStatus] = useState({});
  const fileInputRef = useRef(null);

  // === EFFECTS ===
  // API durumu kontrolü
  useEffect(() => {
    const status = {
      openai: !!import.meta.env?.VITE_OPENAI_API_KEY,
      gemini: !!import.meta.env?.VITE_GEMINI_API_KEY,
      google: !!import.meta.env?.VITE_GOOGLE_API_KEY
    };
    setApiStatus(status);
    setAiProvider(documentService.getAIProvider());
  }, []);

  // === FONKSİYONLAR ===
  // Bildirim gösterme
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  // Dosya yükleme ve işleme
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploadedFile(file);
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      console.log('🔄 GERÇEK dosya işleme başlatılıyor...');
      showNotification('Dosya işleniyor...', 'info');
      
      // Gerçek dosya işleme
      const result = await documentService.processFile(file);
      setTranslatedText(result.text);
      setProcessingProgress(50);
      
      // Dil algılama
      const detectedLang = await documentService.detectLanguage(result.text);
      setDetectedLanguage(detectedLang);
      if (sourceLanguage === 'auto') {
        setSourceLanguage(detectedLang);
      }
      
      // OTOMATİK ÇEVİRİ
      let processedText = result.text;
      if (detectedLang !== targetLanguage) {
        console.log('🔄 Otomatik çeviri yapılıyor...');
        processedText = await documentService.translateText(
          result.text, 
          detectedLang, 
          targetLanguage
        );
        setTranslatedText(processedText);
      }
      
      let products = [];
      
      // AI ile ürün çıkarma
      if (useAI && aiProvider !== 'pattern' && result.products.length === 0) {
        try {
          products = await documentService.extractProductsWithAI(processedText, aiProvider);
          products = products.map((p, i) => ({
            ...p,
            id: Date.now() + i, // Benzersiz ID
            selected: false,
            source: `ai-${aiProvider}`
          }));
        } catch (error) {
          console.error('AI hatası, pattern matching kullanılıyor:', error);
          showNotification('AI hatası oluştu, pattern matching kullanılıyor', 'warning');
          products = documentService.extractProductsWithPattern(processedText);
          products = products.map((p, i) => ({
            ...p,
            id: Date.now() + i,
            selected: false
          }));
        }
      } else if (result.products.length > 0) {
        // Excel'den gelen ürünleri kullan
        products = result.products.map((p, i) => ({
          ...p,
          id: Date.now() + i,
          selected: false
        }));
      } else {
        // Pattern matching
        products = documentService.extractProductsWithPattern(processedText);
        products = products.map((p, i) => ({
          ...p,
          id: Date.now() + i,
          selected: false
        }));
      }
      
      setExtractedProducts(products);
      setProcessingProgress(100);
      showNotification('Dosya başarıyla işlendi ve çevrildi', 'success');
    } catch (error) {
      console.error('💥 GERÇEK dosya işleme hatası:', error);
      showNotification(`Dosya işlenirken hata oluştu: ${error.message}`, 'error');
    } finally {
      console.log('🏁 GERÇEK dosya işleme tamamlandı');
      setIsProcessing(false);
    }
  };

  // Manuel çeviri (isteğe bağlı)
  const handleTranslation = async () => {
    if (!translatedText.trim()) return;
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      showNotification('Çeviri işlemi başlatılıyor...', 'info');
      setProcessingProgress(30);
      
      // Gerçek çeviri işlemi
      const sourceLang = sourceLanguage === 'auto' ? detectedLanguage : sourceLanguage;
      const translated = await documentService.translateText(
        translatedText, 
        sourceLang, 
        targetLanguage
      );
      
      setTranslatedText(translated);
      setProcessingProgress(60);
      
      // Çevrilen metinden ürün çıkarma
      let products = [];
      
      if (useAI && aiProvider !== 'pattern') {
        try {
          products = await documentService.extractProductsWithAI(translated, aiProvider);
          products = products.map((p, i) => ({
            ...p,
            id: Date.now() + i,
            selected: false,
            source: `ai-${aiProvider}`
          }));
        } catch (error) {
          console.error('AI hatası, pattern matching kullanılıyor:', error);
          showNotification('AI hatası oluştu, pattern matching kullanılıyor', 'warning');
          products = documentService.extractProductsWithPattern(translated);
          products = products.map((p, i) => ({
            ...p,
            id: Date.now() + i,
            selected: false
          }));
        }
      } else {
        products = documentService.extractProductsWithPattern(translated);
        products = products.map((p, i) => ({
          ...p,
          id: Date.now() + i,
          selected: false
        }));
      }
      
      setExtractedProducts(products);
      setProcessingProgress(100);
      
      showNotification('Çeviri ve ürün çıkarma tamamlandı', 'success');
    } catch (error) {
      console.error('Çeviri hatası:', error);
      showNotification('Çeviri işleminde hata oluştu', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Ürün seçimi (extractedProducts'tan)
  const toggleProductSelection = (productId) => {
    setExtractedProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, selected: !product.selected }
          : product
      )
    );
  };

  // Seçili ürünleri talebe ekle (extractedProducts'tan -> selectedProducts)
  const addSelectedProducts = () => {
    const selected = extractedProducts.filter(p => p.selected);
    if (selected.length === 0) {
      showNotification('Lütfen en az bir ürün seçin', 'warning');
      return;
    }
    
    // Seçilen ürünleri selectedProducts'a ekle (selected: false yap)
    setSelectedProducts(prev => [
      ...prev,
      ...selected.map(p => ({ ...p, selected: false }))
    ]);
    
    // extractedProducts'tan seçimi kaldır
    setExtractedProducts(prev => prev.map(p => ({ ...p, selected: false })));
    showNotification(`${selected.length} ürün talebe eklendi`, 'success');
  };

  // Ürün düzenleme (Hem extractedProducts hem de selectedProducts için)
  const handleEditProduct = (product, isForSelected = false) => {
    setEditDialog({ 
      open: true, 
      product: { ...product }, 
      index: product.id, 
      isForSelected: isForSelected 
    });
  };

  // Ürün güncelleme
  const handleUpdateProduct = () => {
    const { product, index, isForSelected } = editDialog;
    if (!product.name || !product.quantity || !product.unit) {
      showNotification('Lütfen gerekli alanları doldurun', 'warning');
      return;
    }
    
    if (isForSelected) {
      // selectedProducts listesinde güncelle
      setSelectedProducts(prev => 
        prev.map(p => p.id === index ? product : p)
      );
    } else {
      // extractedProducts listesinde güncelle
      setExtractedProducts(prev => 
        prev.map(p => p.id === index ? product : p)
      );
    }
    
    setEditDialog({ open: false, product: null, index: -1, isForSelected: false });
    showNotification('Ürün güncellendi', 'success');
  };

  // Ürün silme (selectedProducts'tan)
  const handleDeleteProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    showNotification('Ürün silindi', 'info');
  };

  // Talep gönderme
  const handleSubmitRequest = async () => {
    if (!requestData.title.trim()) {
      showNotification('Lütfen talep başlığı girin', 'warning');
      return;
    }
    
    if (selectedProducts.length === 0) {
      showNotification('Lütfen en az bir ürün seçin', 'warning');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Talep gönderme simülasyonu
      const requestPayload = {
        ...requestData,
        products: selectedProducts,
        requestDate: new Date().toISOString(),
        status: 'pending'
      };
      
      console.log('📤 Talep gönderiliyor:', requestPayload);
      
      // localStorage'a kaydet (veya gerçek API çağrısı)
      const existingRequests = JSON.parse(localStorage.getItem('purchaseRequests') || '[]');
      existingRequests.push(requestPayload);
      localStorage.setItem('purchaseRequests', JSON.stringify(existingRequests));
      
      // 2 saniye bekle (API simülasyonu)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification('Talep başarıyla gönderildi!', 'success');
      
      // Formu temizle
      setRequestData({
        title: '',
        description: '',
        priority: 'medium',
        requesterName: '',
        requesterEmail: '',
        requesterPhone: '',
        companyName: '',
        department: ''
      });
      setSelectedProducts([]);
      setExtractedProducts([]);
      setUploadedFile(null);
      setTranslatedText('');
      setDetectedLanguage('');
    } catch (error) {
      console.error('Talep gönderme hatası:', error);
      showNotification('Talep gönderilirken hata oluştu', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Dosya simgesi
  const getFileIcon = (file) => {
    if (!file) return <UploadIcon />;
    
    if (file.type.includes('image')) {
      return <ImageIcon />;
    } else if (file.name.endsWith('.pdf')) {
      return <PdfIcon />;
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      return <ExcelIcon />;
    } else {
      return <DocumentIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tek Sayfalı Talep Oluşturma Sistemi
          </Typography>
          <Chip 
            icon={<AIIcon />} 
            label={aiProvider === 'gemini' ? 'Gemini AI' : aiProvider === 'openai' ? 'OpenAI' : 'Pattern Matching'} 
            color="primary" 
            variant="outlined" 
          />
        </Toolbar>
      </AppBar>

      {/* API Durumu Uyarısı */}
      {!apiStatus.openai && !apiStatus.gemini && (
        <Alert 
          severity="warning" 
          sx={{ mt: 2, mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              href="https://github.com/your-repo/docs#api-keys"
              target="_blank"
            >
              Kurulum
            </Button>
          }
        >
          <AlertTitle>API Anahtarları Bulunamadı</AlertTitle>
          AI özellikleri devre dışı. .env dosyasına API anahtarlarınızı ekleyin.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Sol Panel - Dosya İşleme, Ürün Yönetimi */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader title="Dosya İşleme & Ürün Yönetimi" />
            <CardContent>
              
              {/* === DOSYA YÜKLEME === */}
              <Box sx={{ mb: 3 }}>
                <input
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="file-upload-unified"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload-unified">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'İşleniyor...' : 'Dosya Yükle (Excel, PDF, Resim)'}
                  </Button>
                </label>
                
                {uploadedFile && (
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getFileIcon(uploadedFile)}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {uploadedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                    <Chip 
                      label={detectedLanguage || 'Bilinmiyor'} 
                      icon={<LanguageIcon />} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <IconButton size="small" onClick={() => setUploadedFile(null)}>
                      <CloseIcon />
                    </IconButton>
                  </Paper>
                )}
              </Box>

              {/* === AYARLAR === */}
              <Box sx={{ mb: 3 }}>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>AI Sağlayıcı</InputLabel>
                        <Select
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value)}
                          disabled={(!apiStatus.gemini && !apiStatus.openai) || isProcessing}
                        >
                          <MenuItem value="gemini" disabled={!apiStatus.gemini}>
                            Gemini AI {apiStatus.gemini ? '✅' : '❌'}
                          </MenuItem>
                          <MenuItem value="openai" disabled={!apiStatus.openai}>
                            OpenAI {apiStatus.openai ? '✅' : '❌'}
                          </MenuItem>
                          <MenuItem value="pattern">Pattern Matching</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Hedef Dil</InputLabel>
                        <Select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          disabled={isProcessing}
                        >
                          <MenuItem value="tr">Türkçe</MenuItem>
                          <MenuItem value="en">İngilizce</MenuItem>
                          <MenuItem value="ru">Rusça</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={useAI} 
                            onChange={(e) => setUseAI(e.target.checked)}
                            color="primary"
                            disabled={isProcessing}
                          />
                        }
                        label="AI Kullan"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* === İŞLEME DURUMU === */}
              {isProcessing && (
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        İşlem devam ediyor...
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={processingProgress} 
                        sx={{ mt: 1 }} 
                      />
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* === ÇIKARILAN ÜRÜNLER === */}
              {extractedProducts.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardHeader 
                    title={`Çıkarılan Ürünler (${extractedProducts.length})`}
                    action={
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlaylistAddCheckIcon />}
                        onClick={addSelectedProducts}
                        disabled={!extractedProducts.some(p => p.selected)}
                      >
                        Seçilenleri Ekle
                      </Button>
                    }
                  />
                  <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Grid container spacing={2}>
                      {extractedProducts.map((product) => (
                        <Grid item xs={12} sm={6} key={product.id}>
                          <Paper 
                            sx={{ 
                              p: 2, 
                              cursor: 'pointer',
                              border: product.selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                              '&:hover': { boxShadow: 2 },
                              position: 'relative'
                            }}
                            onClick={() => toggleProductSelection(product.id)}
                          >
                            <Chip 
                              label={product.source?.replace('ai-', '').replace('pattern-', 'Pattern')} 
                              size="small" 
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8,
                                bgcolor: product.source?.includes('ai') ? '#e3f2fd' : '#f3e5f5'
                              }} 
                            />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                  {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {product.quantity} {product.unit}
                                </Typography>
                                {product.estimatedPrice > 0 && (
                                  <Typography variant="body2" color="text.secondary">
                                    ~{product.estimatedPrice} {product.currency}
                                  </Typography>
                                )}
                              </Box>
                              <Box>
                                {product.selected && (
                                  <CheckIcon color="primary" sx={{ mr: 1 }} />
                                )}
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => { e.stopPropagation(); handleEditProduct(product, false); }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* === SEÇİLEN ÜRÜNLER (TALEBE EKLENECEK) === */}
              {selectedProducts.length > 0 && (
                <Card>
                  <CardHeader 
                    title={`Talebe Eklenecek Ürünler (${selectedProducts.length})`}
                  />
                  <CardContent>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Ürün Adı</TableCell>
                            <TableCell>Miktar</TableCell>
                            <TableCell>Fiyat</TableCell>
                            <TableCell>İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {product.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {product.brand} {product.model}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {product.quantity} {product.unit}
                              </TableCell>
                              <TableCell>
                                {product.estimatedPrice > 0 ? `${product.estimatedPrice} ${product.currency}` : '-'}
                              </TableCell>
                              <TableCell>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditProduct(product, true)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ Panel - Talep Formu */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title="Talep Bilgileri" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Talep Başlığı *"
                    value={requestData.title}
                    onChange={(e) => setRequestData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Açıklama"
                    value={requestData.description}
                    onChange={(e) => setRequestData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Öncelik</InputLabel>
                    <Select
                      value={requestData.priority}
                      onChange={(e) => setRequestData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <MenuItem value="low">Düşük</MenuItem>
                      <MenuItem value="medium">Orta</MenuItem>
                      <MenuItem value="high">Yüksek</MenuItem>
                      <MenuItem value="urgent">Acil</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Departman"
                    value={requestData.department}
                    onChange={(e) => setRequestData(prev => ({ ...prev, department: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Talep Eden Bilgileri
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Ad Soyad"
                    value={requestData.requesterName}
                    onChange={(e) => setRequestData(prev => ({ ...prev, requesterName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Şirket"
                    value={requestData.companyName}
                    onChange={(e) => setRequestData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    type="email"
                    value={requestData.requesterEmail}
                    onChange={(e) => setRequestData(prev => ({ ...prev, requesterEmail: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={requestData.requesterPhone}
                    onChange={(e) => setRequestData(prev => ({ ...prev, requesterPhone: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SendIcon />}
                      onClick={handleSubmitRequest}
                      disabled={isProcessing || !requestData.title.trim() || selectedProducts.length === 0}
                      sx={{ minWidth: 200 }}
                    >
                      {isProcessing ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Gönderiliyor...
                        </>
                      ) : (
                        'Talebi Gönder'
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* === ÜRÜN DÜZENLEME DİYALOGU === */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, product: null, index: -1, isForSelected: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ürün Düzenle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ürün Adı *"
                value={editDialog.product?.name || ''}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  product: { ...prev.product, name: e.target.value }
                }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Marka"
                value={editDialog.product?.brand || ''}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  product: { ...prev.product, brand: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Model"
                value={editDialog.product?.model || ''}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  product: { ...prev.product, model: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Miktar *"
                type="number"
                value={editDialog.product?.quantity || ''}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  product: { ...prev.product, quantity: parseInt(e.target.value) || 0 }
                }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Birim *"
                value={editDialog.product?.unit || ''}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  product: { ...prev.product, unit: e.target.value }
                }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tahmini Fiyat"
                type="number"
                value={editDialog.product?.estimatedPrice || ''}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  product: { ...prev.product, estimatedPrice: parseFloat(e.target.value) || 0 }
                }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Para Birimi"
                value={editDialog.product?.currency || 'TL'}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  product: { ...prev.product, currency: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Açıklama"
                value={editDialog.product?.description || ''}
                onChange={(e) => setEditDialog(prev => ({
                  ...prev,
                  product: { ...prev.product, description: e.target.value }
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, product: null, index: -1, isForSelected: false })}
          >
            İptal
          </Button>
          <Button onClick={handleUpdateProduct} variant="contained">
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* === BİLDİRİM === */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UnifiedRequestSystem;
