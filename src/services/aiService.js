// AI Service - Gemini/ChatGPT entegrasyonu için yardımcı fonksiyonlar

class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    this.baseURL = 'https://api.openai.com/v1';
  }

  // Çeviri servisi
  async translateText(text, fromLang = 'en', toLang = 'tr') {
    try {
      const prompt = `Translate the following text from ${fromLang} to ${toLang}. Only return the translated text, no explanations:

${text}`;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      const data = await response.json();
      return {
        success: true,
        translatedText: data.choices[0].message.content.trim(),
        originalText: text
      };
    } catch (error) {
      console.error('Translation error:', error);
      return {
        success: false,
        error: 'Çeviri işlemi başarısız oldu',
        originalText: text
      };
    }
  }

  // Teklif analizi servisi
  async analyzeQuotations(quotations, requestDetails) {
    try {
      const quotationData = quotations.map(q => ({
        supplier: q.supplier,
        totalPrice: q.totalPrice,
        deliveryTime: q.deliveryTime,
        paymentTerms: q.paymentTerms,
        rating: q.rating,
        previousOrders: q.previousOrders,
        onTimeDelivery: q.onTimeDelivery
      }));

      const prompt = `Analyze the following quotations for a procurement request and provide a detailed analysis in Turkish:

Request: ${requestDetails.title}
Priority: ${requestDetails.priority}

Quotations:
${JSON.stringify(quotationData, null, 2)}

Please provide:
1. Recommended supplier with reasoning
2. Price analysis (lowest, highest, average, potential savings)
3. Delivery time analysis
4. Supplier reliability analysis
5. Identified risks
6. Opportunities for negotiation

Format the response as a JSON object with the following structure:
{
  "recommendation": "supplier name",
  "reasoning": "detailed reasoning",
  "priceAnalysis": {
    "lowest": "supplier (price)",
    "highest": "supplier (price)",
    "average": "average price",
    "savings": "potential savings"
  },
  "deliveryAnalysis": {
    "fastest": "supplier (days)",
    "slowest": "supplier (days)",
    "average": "average days"
  },
  "supplierAnalysis": {
    "mostReliable": "supplier (reliability metric)",
    "mostExperienced": "supplier (experience metric)",
    "bestRated": "supplier (rating)"
  },
  "risks": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"]
}`;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      const data = await response.json();
      const analysisText = data.choices[0].message.content.trim();
      
      // JSON parse etmeye çalış
      try {
        const analysis = JSON.parse(analysisText);
        return {
          success: true,
          analysis: analysis
        };
      } catch (parseError) {
        // JSON parse edilemezse, metin olarak döndür
        return {
          success: true,
          analysis: {
            recommendation: 'Analiz tamamlandı',
            reasoning: analysisText,
            priceAnalysis: {},
            deliveryAnalysis: {},
            supplierAnalysis: {},
            risks: [],
            opportunities: []
          }
        };
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      return {
        success: false,
        error: 'AI analizi başarısız oldu'
      };
    }
  }

  // Email içeriği oluşturma servisi
  async generateEmailContent(requestDetails, selectedQuotation, analysis) {
    try {
      const prompt = `Generate a professional email in Turkish to inform the requester about the quotation analysis results:

Request Details:
- Title: ${requestDetails.title}
- Requested by: ${requestDetails.requestedBy}

Selected Quotation:
- Supplier: ${selectedQuotation.supplier}
- Total Price: ${selectedQuotation.totalPrice} TRY
- Delivery Time: ${selectedQuotation.deliveryTime} days
- Payment Terms: ${selectedQuotation.paymentTerms}

AI Analysis Summary:
${analysis.reasoning}

The email should:
1. Be formal and professional
2. Summarize the analysis results
3. Request approval for the recommended quotation
4. Include next steps
5. Be in Turkish

Format as a complete email with subject and body.`;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.5
        })
      });

      const data = await response.json();
      return {
        success: true,
        emailContent: data.choices[0].message.content.trim()
      };
    } catch (error) {
      console.error('Email generation error:', error);
      return {
        success: false,
        error: 'Email oluşturma başarısız oldu'
      };
    }
  }

  // Fallback servisleri (API anahtarı yoksa)
  async mockTranslateText(text, fromLang = 'en', toLang = 'tr') {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      translatedText: `[ÇEVİRİ] ${text}`,
      originalText: text
    };
  }

  async mockAnalyzeQuotations(quotations, requestDetails) {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const lowestPrice = Math.min(...quotations.map(q => q.totalPrice));
    const highestPrice = Math.max(...quotations.map(q => q.totalPrice));
    const averagePrice = quotations.reduce((sum, q) => sum + q.totalPrice, 0) / quotations.length;
    
    const fastestDelivery = Math.min(...quotations.map(q => q.deliveryTime));
    const slowestDelivery = Math.max(...quotations.map(q => q.deliveryTime));
    const averageDelivery = quotations.reduce((sum, q) => sum + q.deliveryTime, 0) / quotations.length;
    
    const bestRatedSupplier = quotations.reduce((best, current) => 
      current.rating > best.rating ? current : best
    );
    
    const lowestPriceSupplier = quotations.find(q => q.totalPrice === lowestPrice);
    const fastestSupplier = quotations.find(q => q.deliveryTime === fastestDelivery);
    
    return {
      success: true,
      analysis: {
        recommendation: lowestPriceSupplier.supplier,
        reasoning: 'En uygun fiyat/performans oranı sunan teklif',
        priceAnalysis: {
          lowest: `${lowestPriceSupplier.supplier} (₺${lowestPrice.toLocaleString()})`,
          highest: `${quotations.find(q => q.totalPrice === highestPrice).supplier} (₺${highestPrice.toLocaleString()})`,
          average: `₺${Math.round(averagePrice).toLocaleString()}`,
          savings: `₺${(highestPrice - lowestPrice).toLocaleString()} (${Math.round(((highestPrice - lowestPrice) / highestPrice) * 100)}%)`
        },
        deliveryAnalysis: {
          fastest: `${fastestSupplier.supplier} (${fastestDelivery} gün)`,
          slowest: `${quotations.find(q => q.deliveryTime === slowestDelivery).supplier} (${slowestDelivery} gün)`,
          average: `${Math.round(averageDelivery)} gün`
        },
        supplierAnalysis: {
          mostReliable: `${quotations.reduce((best, current) => current.onTimeDelivery > best.onTimeDelivery ? current : best).supplier} (${Math.max(...quotations.map(q => q.onTimeDelivery))}% zamanında teslimat)`,
          mostExperienced: `${quotations.reduce((best, current) => current.previousOrders > best.previousOrders ? current : best).supplier} (${Math.max(...quotations.map(q => q.previousOrders))} önceki sipariş)`,
          bestRated: `${bestRatedSupplier.supplier} (${bestRatedSupplier.rating}/5)`
        },
        risks: [
          'Teslimat sürelerindeki farklılıklar dikkate alınmalı',
          'Ödeme koşulları nakit akışını etkileyebilir'
        ],
        opportunities: [
          'Toplu alım indirimi için görüşme yapılabilir',
          'Uzun vadeli anlaşma ile daha iyi koşullar elde edilebilir'
        ]
      }
    };
  }

  async mockGenerateEmailContent(requestDetails, selectedQuotation, analysis) {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const emailContent = `Konu: ${requestDetails.title} - Teklif Değerlendirme Sonucu

Sayın ${requestDetails.requestedBy},

${requestDetails.title} talebiniz için gelen teklifler AI destekli sistem ile değerlendirilmiştir.

DEĞERLENDIRME SONUCU:
• Önerilen Tedarikçi: ${selectedQuotation.supplier}
• Toplam Tutar: ₺${selectedQuotation.totalPrice.toLocaleString()}
• Teslimat Süresi: ${selectedQuotation.deliveryTime} gün
• Ödeme Koşulları: ${selectedQuotation.paymentTerms}

ANALIZ ÖZETİ:
${analysis.reasoning}

SONRAKI ADIMLAR:
1. Bu teklifi onaylıyorsanız, lütfen sisteme giriş yaparak onayınızı verin
2. Değişiklik talep ediyorsanız, gerekçenizi belirtin
3. Sorularınız için satınalma departmanı ile iletişime geçin

Onayınızı en geç 3 iş günü içinde bekliyoruz.

Saygılarımla,
Satınalma Departmanı`;

    return {
      success: true,
      emailContent: emailContent
    };
  }
}

// Singleton instance
const aiService = new AIService();

export default aiService;

