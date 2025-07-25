// Translation Service - Google Translate API entegrasyonu
class TranslationService {
  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.googleApiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
    this.openaiApiBase = import.meta.env.VITE_OPENAI_API_BASE || 'https://api.openai.com/v1';
    this.translationHistory = this.loadTranslationHistory();
  }

  // Ana çeviri fonksiyonu
  async translateText(text, sourceLanguage = 'auto', targetLanguage = 'tr') {
    try {
      console.log('Çeviri başlatılıyor:', { sourceLanguage, targetLanguage, textLength: text.length });

      // Boş metin kontrolü
      if (!text || text.trim().length === 0) {
        throw new Error('Çevrilecek metin boş');
      }

      // Aynı dil kontrolü
      if (sourceLanguage === targetLanguage) {
        return {
          success: true,
          translatedText: text,
          sourceLanguage,
          targetLanguage,
          method: 'same_language'
        };
      }

      // Cache kontrolü
      const cacheKey = this.getCacheKey(text, sourceLanguage, targetLanguage);
      const cachedTranslation = this.getCachedTranslation(cacheKey);
      
      if (cachedTranslation) {
        console.log('Cache\'den çeviri alındı');
        return cachedTranslation;
      }

      // Çeviri API'si seçimi
      let translationResult;
      
      if (this.googleApiKey) {
        console.log('Google Translate API kullanılıyor');
        translationResult = await this.translateWithGoogle(text, sourceLanguage, targetLanguage);
      } else if (this.openaiApiKey) {
        console.log('OpenAI API kullanılıyor');
        translationResult = await this.translateWithOpenAI(text, sourceLanguage, targetLanguage);
      } else {
        console.warn('API key bulunamadı, basit çeviri kullanılıyor');
        translationResult = await this.translateWithFallback(text, sourceLanguage, targetLanguage);
      }

      // Cache'e kaydet
      this.cacheTranslation(cacheKey, translationResult);
      
      // Geçmişe ekle
      this.addToHistory({
        originalText: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        translatedText: translationResult.translatedText.substring(0, 100) + (translationResult.translatedText.length > 100 ? '...' : ''),
        sourceLanguage,
        targetLanguage,
        timestamp: new Date().toISOString(),
        method: translationResult.method
      });

      return translationResult;

    } catch (error) {
      console.error('Çeviri hatası:', error);
      
      // Fallback çeviri
      return this.translateWithFallback(text, sourceLanguage, targetLanguage);
    }
  }

  // Google Translate API ile çeviri (GERÇEK)
  async translateWithGoogle(text, sourceLanguage, targetLanguage) {
    try {
      // Dil kodlarını Google formatına çevir
      const sourceLang = sourceLanguage === 'auto' ? '' : this.convertToGoogleLangCode(sourceLanguage);
      const targetLang = this.convertToGoogleLangCode(targetLanguage);

      const url = `https://translation.googleapis.com/language/translate/v2?key=${this.googleApiKey}`;
      
      const requestBody = {
        q: text,
        target: targetLang,
        format: 'text'
      };

      // Kaynak dil belirtilmişse ekle
      if (sourceLang) {
        requestBody.source = sourceLang;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Translate API hatası: ${response.status} - ${errorData.error?.message || 'Bilinmeyen hata'}`);
      }

      const result = await response.json();
      const translation = result.data?.translations?.[0];

      if (!translation) {
        throw new Error('Çeviri yanıtı alınamadı');
      }

      console.log('Google Translate ile çeviri tamamlandı');

      return {
        success: true,
        translatedText: translation.translatedText,
        sourceLanguage: translation.detectedSourceLanguage || sourceLanguage,
        targetLanguage,
        method: 'google_translate',
        confidence: 0.9
      };

    } catch (error) {
      console.error('Google Translate hatası:', error);
      throw error;
    }
  }

  // OpenAI API ile çeviri (GERÇEK)
  async translateWithOpenAI(text, sourceLanguage, targetLanguage) {
    try {
      const prompt = this.buildTranslationPrompt(text, sourceLanguage, targetLanguage);
      
      const response = await fetch(`${this.openaiApiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Sen profesyonel bir çevirmensin. Verilen metni doğru ve akıcı şekilde çevirirsin.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: Math.min(4000, text.length * 2)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API hatası: ${response.status} - ${errorData.error?.message || 'Bilinmeyen hata'}`);
      }

      const result = await response.json();
      const translatedText = result.choices[0]?.message?.content;

      if (!translatedText) {
        throw new Error('Çeviri yanıtı alınamadı');
      }

      console.log('OpenAI ile çeviri tamamlandı');

      return {
        success: true,
        translatedText: translatedText.trim(),
        sourceLanguage,
        targetLanguage,
        method: 'openai_api',
        confidence: 0.95
      };

    } catch (error) {
      console.error('OpenAI çeviri hatası:', error);
      throw error;
    }
  }

  // Fallback çeviri sistemi
  async translateWithFallback(text, sourceLanguage, targetLanguage) {
    console.log('Fallback çeviri kullanılıyor');

    // Basit kelime değiştirme tablosu
    const translations = this.getBasicTranslations();
    
    let translatedText = text;
    
    // Kaynak dil tespiti
    const detectedLanguage = this.detectLanguage(text);
    const actualSourceLang = sourceLanguage === 'auto' ? detectedLanguage : sourceLanguage;

    // Basit kelime çevirisi
    if (translations[actualSourceLang] && translations[actualSourceLang][targetLanguage]) {
      const wordMap = translations[actualSourceLang][targetLanguage];
      
      Object.entries(wordMap).forEach(([original, translated]) => {
        const regex = new RegExp(`\\b${original}\\b`, 'gi');
        translatedText = translatedText.replace(regex, translated);
      });
    }

    // Eğer çeviri yapılmadıysa, dil bilgisi ekle
    if (translatedText === text) {
      translatedText = `[${this.getLanguageName(actualSourceLang)} → ${this.getLanguageName(targetLanguage)}]\n${text}`;
    }

    return {
      success: true,
      translatedText,
      sourceLanguage: actualSourceLang,
      targetLanguage,
      method: 'fallback_basic',
      confidence: 0.3,
      note: 'Basit çeviri kullanıldı. Daha iyi sonuçlar için Google Translate API key gerekli.'
    };
  }

  // Google dil kodları çevirisi
  convertToGoogleLangCode(code) {
    const langMap = {
      'auto': '',
      'tr': 'tr',
      'en': 'en',
      'ru': 'ru',
      'de': 'de',
      'fr': 'fr',
      'ar': 'ar',
      'es': 'es',
      'it': 'it',
      'pt': 'pt',
      'zh': 'zh',
      'ja': 'ja',
      'ko': 'ko'
    };
    return langMap[code] || code;
  }

  // Dil tespiti
  detectLanguage(text) {
    const patterns = {
      'en': /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi,
      'ru': /[а-яё]/gi,
      'tr': /[çğıöşü]/gi,
      'de': /\b(der|die|das|und|oder|aber|in|auf|zu|für|von|mit)\b/gi,
      'fr': /\b(le|la|les|et|ou|mais|dans|sur|à|pour|de|avec)\b/gi
    };

    let maxMatches = 0;
    let detectedLang = 'en';

    Object.entries(patterns).forEach(([lang, pattern]) => {
      const matches = (text.match(pattern) || []).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedLang = lang;
      }
    });

    console.log('Tespit edilen dil:', detectedLang, 'eşleşme:', maxMatches);
    return detectedLang;
  }

  // Çeviri prompt'u oluştur
  buildTranslationPrompt(text, sourceLanguage, targetLanguage) {
    const sourceLangName = this.getLanguageName(sourceLanguage);
    const targetLangName = this.getLanguageName(targetLanguage);

    return `
Aşağıdaki metni ${sourceLangName} dilinden ${targetLangName} diline çevir.

Çeviri kuralları:
- Doğal ve akıcı çeviri yap
- Teknik terimleri koruyarak çevir
- Sayıları ve özel isimleri olduğu gibi bırak
- Sadece çeviriyi döndür, açıklama ekleme

Çevrilecek metin:
${text}
`;
  }

  // Basit çeviri tablosu
  getBasicTranslations() {
    return {
      'en': {
        'tr': {
          'request': 'talep',
          'product': 'ürün',
          'price': 'fiyat',
          'quantity': 'miktar',
          'description': 'açıklama',
          'item': 'öğe',
          'material': 'malzeme',
          'office': 'ofis',
          'computer': 'bilgisayar',
          'paper': 'kağıt',
          'pen': 'kalem',
          'chair': 'sandalye',
          'table': 'masa',
          'equipment': 'ekipman',
          'software': 'yazılım',
          'hardware': 'donanım',
          'service': 'hizmet',
          'delivery': 'teslimat',
          'urgent': 'acil',
          'high': 'yüksek',
          'medium': 'orta',
          'low': 'düşük',
          'approved': 'onaylandı',
          'pending': 'bekliyor',
          'rejected': 'reddedildi'
        }
      },
      'ru': {
        'tr': {
          'запрос': 'talep',
          'заявка': 'talep',
          'продукт': 'ürün',
          'товар': 'mal',
          'наименование': 'ad',
          'название': 'isim',
          'модель': 'model',
          'производитель': 'üretici',
          'цена': 'fiyat',
          'стоимость': 'maliyet',
          'количество': 'miktar',
          'описание': 'açıklama',
          'материал': 'malzeme',
          'офис': 'ofis',
          'компьютер': 'bilgisayar',
          'бумага': 'kağıt',
          'ручка': 'kalem',
          'стул': 'sandalye',
          'стол': 'masa',
          'оборудование': 'ekipman',
          'программное обеспечение': 'yazılım',
          'аппаратное обеспечение': 'donanım',
          'услуга': 'hizmet',
          'доставка': 'teslimat',
          'срочно': 'acil',
          'высокий': 'yüksek',
          'средний': 'orta',
          'низкий': 'düşük',
          'одобрено': 'onaylandı',
          'ожидание': 'bekliyor',
          'отклонено': 'reddedildi',
          'автоматы': 'otomatlar',
          'автомат': 'otomat',
          'шт': 'adet',
          'штук': 'adet',
          'желаемый': 'istenen',
          'сроки': 'süreler',
          'поставки': 'teslimat',
          'склад': 'depo',
          'клиента': 'müşteri'
        }
      }
    };
  }

  // Dil adları
  getLanguageName(code) {
    const names = {
      'auto': 'Otomatik',
      'tr': 'Türkçe',
      'en': 'İngilizce',
      'ru': 'Rusça',
      'de': 'Almanca',
      'fr': 'Fransızca',
      'ar': 'Arapça',
      'es': 'İspanyolca',
      'it': 'İtalyanca',
      'pt': 'Portekizce',
      'zh': 'Çince',
      'ja': 'Japonca',
      'ko': 'Korece'
    };
    return names[code] || code;
  }

  // Cache işlemleri
  getCacheKey(text, sourceLang, targetLang) {
    const textHash = this.simpleHash(text);
    return `${sourceLang}_${targetLang}_${textHash}`;
  }

  getCachedTranslation(key) {
    try {
      const cached = localStorage.getItem(`translation_${key}`);
      if (cached) {
        const data = JSON.parse(cached);
        // 24 saat cache
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data.result;
        }
      }
    } catch (error) {
      console.error('Cache okuma hatası:', error);
    }
    return null;
  }

  cacheTranslation(key, result) {
    try {
      const cacheData = {
        result,
        timestamp: Date.now()
      };
      localStorage.setItem(`translation_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache yazma hatası:', error);
    }
  }

  // Geçmiş işlemleri
  loadTranslationHistory() {
    try {
      const history = localStorage.getItem('translation_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Geçmiş yükleme hatası:', error);
      return [];
    }
  }

  addToHistory(translation) {
    try {
      this.translationHistory.unshift(translation);
      // Son 50 çeviriyi sakla
      this.translationHistory = this.translationHistory.slice(0, 50);
      localStorage.setItem('translation_history', JSON.stringify(this.translationHistory));
    } catch (error) {
      console.error('Geçmişe ekleme hatası:', error);
    }
  }

  getTranslationHistory() {
    return this.translationHistory;
  }

  clearTranslationHistory() {
    this.translationHistory = [];
    localStorage.removeItem('translation_history');
  }

  // Yardımcı fonksiyonlar
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer'a çevir
    }
    return Math.abs(hash).toString(36);
  }

  // Desteklenen diller
  getSupportedLanguages() {
    return [
      { code: 'auto', name: 'Otomatik Tespit' },
      { code: 'tr', name: 'Türkçe' },
      { code: 'en', name: 'İngilizce' },
      { code: 'ru', name: 'Rusça' },
      { code: 'de', name: 'Almanca' },
      { code: 'fr', name: 'Fransızca' },
      { code: 'ar', name: 'Arapça' },
      { code: 'es', name: 'İspanyolca' },
      { code: 'it', name: 'İtalyanca' },
      { code: 'pt', name: 'Portekizce' },
      { code: 'zh', name: 'Çince' },
      { code: 'ja', name: 'Japonca' },
      { code: 'ko', name: 'Korece' }
    ];
  }

  // Toplu çeviri
  async translateBatch(texts, sourceLanguage = 'auto', targetLanguage = 'tr') {
    const results = [];
    
    for (const text of texts) {
      try {
        const result = await this.translateText(text, sourceLanguage, targetLanguage);
        results.push(result);
        
        // API rate limiting için kısa bekleme
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          originalText: text
        });
      }
    }
    
    return results;
  }
}

export default new TranslationService();

