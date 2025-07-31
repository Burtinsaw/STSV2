import React, { useState, useRef, useEffect } from 'react';
import {
  Grid, Card, CardContent, CardHeader, Typography, Button, TextField, Box, Paper,
  Chip, CircularProgress, List, ListItem, ListItemText, LinearProgress, Avatar,
  Divider, IconButton, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Checkbox
} from '@mui/material';
import {
  CloudUpload as UploadIcon, Send as SendIcon, Add as AddIcon, DeleteOutline as DeleteIcon,
  ShoppingCartOutlined as ShoppingCartIcon, DescriptionOutlined as FileIcon, PersonOutlined as UserIcon,
  VisibilityOutlined as EyeIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon,
  AutoAwesome as AIIcon, Translate as TranslateIcon, AddCircleOutline as ManualAddIcon,
  TaskOutlined as TaskIcon, WidgetsOutlined as WidgetsIcon, Approval as ApprovalIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { Toaster, toast } from 'sonner';

// Servisler
import requestService from 'services/requestService';

// Diğer kütüphaneler...
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';

// Simülasyonlar
const useAuth = () => ({ user: { id: 1, name: 'Hüseyin Uzun', department: 'IT Departmanı' } });
const mockCompanies = [{ name: 'Amazon DE' }, { name: 'Alibaba' }, { name: 'Mouser Electronics' }];

// =================================================================
// GERÇEK DOKÜMAN İŞLEME SERVİSİ (Değişiklik yok)
// =================================================================
class RealDocumentService {
    constructor() {
        this.geminiApiKey = import.meta.env?.VITE_GEMINI_API_KEY || '';
        this.googleApiKey = import.meta.env?.VITE_GOOGLE_API_KEY || '';
        pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    }
    async detectLanguage(text) { if (!this.googleApiKey) { return 'tr'; } try { const response = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?key=${this.googleApiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: text.substring(0, 1000) }) }); if (!response.ok) throw new Error("Dil algılama API hatası."); const data = await response.json(); return data.data.detections[0][0].language; } catch (error) { console.error("Dil algılama hatası:", error); return 'tr'; } }
    async translateText(text, targetLang, sourceLang) { if (!sourceLang || sourceLang === targetLang) return text; if (!this.googleApiKey) { toast.error("Çeviri için Google API anahtarı bulunamadı."); return text; } try { const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.googleApiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: text, target: targetLang, source: sourceLang }) }); if (!response.ok) throw new Error("Çeviri API hatası."); const data = await response.json(); return data.data.translations[0].translatedText; } catch (error) { console.error("Çeviri hatası:", error); throw error; } }
    async extractProductsWithAI(text) { if (!this.geminiApiKey) { toast.warning("Gemini API anahtarı bulunamadı, pattern matching kullanılıyor."); return this.extractProductsWithPattern(text); } try { const prompt = `Aşağıdaki metinden ürünleri JSON formatında bir array olarak çıkar. Sadece JSON array'i döndür. Gerekli alanlar: "name", "quantity", "unit", "brand", "articleNumber". Metin: \n\n${text}`; const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }); if (!response.ok) throw new Error(`Gemini API hatası: ${response.status}`); const data = await response.json(); const content = data.candidates[0].content.parts[0].text; const jsonMatch = content.match(/\[[\s\S]*\]/); return jsonMatch ? JSON.parse(jsonMatch[0]) : []; } catch (error) { console.error('❌ Gemini hatası:', error); return this.extractProductsWithPattern(text); } }
    extractProductsWithPattern(text) { const products = []; const lines = text.split('\n'); const patterns = [ /(\d+)\s*[xXхХ]\s*(.+)/, /(.+?)\s*-\s*(\d+)\s*(adet|pcs|шт|tane|kutu)/i, /^\s*\d+[.)-]?\s*(.+?)(?:\s*,\s*|\s+)(\d+)\s*(adet|pcs|шт|tane|kutu)/i ]; lines.forEach(line => { for (const pattern of patterns) { const match = line.match(pattern); if (match) { let name, quantity, unit; if (pattern.source.includes('xXхХ')) { quantity = parseInt(match[1], 10); name = match[2].trim(); unit = 'adet'; } else if (pattern.source.includes('-')) { name = match[1].trim(); quantity = parseInt(match[2], 10); unit = match[3] || 'adet'; } else { name = match[1].trim(); quantity = parseInt(match[2], 10); unit = match[3] || 'adet'; } if (name && quantity) { products.push({ name, quantity, unit, source: 'pattern' }); break; } } } }); return products.map((p) => ({ ...p, id: `${Date.now()}-${Math.random()}` })); }
    async processFile(file) { if (file.type.startsWith('image/')) return Tesseract.recognize(file, 'tur+eng').then(res => res.data.text); if (file.name.endsWith('.pdf')) { const ab = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data: ab }).promise; let text = ''; for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const content = await page.getTextContent(); text += content.items.map(item => item.str).join(' ') + '\n'; } return text; } if (file.name.endsWith('.docx')) return mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() }).then(res => res.value); if (file.name.endsWith('.xlsx')) { const ab = await file.arrayBuffer(); const wb = XLSX.read(ab, { type: 'array' }); const ws = wb.Sheets[wb.SheetNames[0]]; return XLSX.utils.sheet_to_json(ws, { header: 1 }).map(row => row.join('\t')).join('\n'); } return file.text(); }
}
const documentService = new RealDocumentService();

// Styled Components (Değişiklik yok)
const StepCard = styled(Paper, { shouldForwardProp: (prop) => prop !== 'active', })(({ theme, active }) => ({ cursor: 'pointer', padding: theme.spacing(1.5, 2), transition: 'all 0.2s ease-in-out', border: '2px solid', borderColor: active ? theme.palette.primary.main : 'transparent', backgroundColor: active ? theme.palette.primary.lighter : theme.palette.background.default, '&:hover': { borderColor: theme.palette.primary.light, backgroundColor: theme.palette.action.hover }, display: 'flex', alignItems: 'center', gap: theme.spacing(2), marginBottom: theme.spacing(2), borderRadius: theme.shape.borderRadius * 2, }));
const OptionCard = styled(Card)(({ theme, selected }) => ({ cursor: 'pointer', height: '100%', textAlign: 'center', padding: theme.spacing(2), transition: 'all 0.2s ease-in-out', border: '2px solid', borderColor: selected ? theme.palette.primary.main : theme.palette.divider, backgroundColor: selected ? theme.palette.primary.lighter : theme.palette.background.paper, '&:hover': { borderColor: theme.palette.primary.main, boxShadow: theme.shadows[3] }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: theme.shape.borderRadius * 2, }));
const Dropzone = styled(Paper)(({ theme }) => ({ padding: theme.spacing(4), border: `2px dashed ${theme.palette.divider}`, textAlign: 'center', cursor: 'pointer', backgroundColor: theme.palette.background.default, borderRadius: theme.shape.borderRadius * 2, '&:hover': { borderColor: theme.palette.primary.main, backgroundColor: theme.palette.action.hover } }));


const UnifiedRequestSystem = () => {
    const theme = useTheme();
    const { user } = useAuth();
    
    const [activeStep, setActiveStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [requestData, setRequestData] = useState({
        customTalepId: '',
        title: '',
        description: '',
        externalCompanyName: '', 
        externalRequesterName: '', 
    });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [companies, setCompanies] = useState(mockCompanies);
    const [extractedProducts, setExtractedProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('ai-upload');
    const [manualProduct, setManualProduct] = useState({ name: '', quantity: 1, unit: 'adet', brand: '', articleNumber: '' });
    const [manualProductList, setManualProductList] = useState([]);
    const [translateData, setTranslateData] = useState({ originalText: '', translatedText: '', targetLang: 'tr' });
    const [editProduct, setEditProduct] = useState(null);
    const fileInputRef = useRef(null);

    const steps = ['Ürün Ekleme', 'Talep Bilgileri', 'Kişi Bilgileri', 'Önizleme & Gönder'];
    const stepIcons = { 0: <TaskIcon />, 1: <FileIcon />, 2: <UserIcon />, 3: <EyeIcon /> };
    const stepSubtitles = { 0: 'AI ile ürün çıkarın veya manuel ekleyin', 1: 'Talep için başlık ve açıklama girin', 2: 'Yurtdışı firma bilgilerini belirtin', 3: 'Tüm bilgileri kontrol edip onaya gönderin' };

    useEffect(() => {
    //   requestService.getCompanies()
    //     .then(response => setCompanies(response.data))
    //     .catch(error => {
    //         console.error("Firmalar çekilemedi:", error);
    //         toast.error("Müşteri listesi yüklenemedi.");
    //     });
    }, []);

    const handleDataChange = (field, value) => setRequestData(prev => ({ ...prev, [field]: value }));

    const processTextWithAI = async (text) => {
        setIsProcessing(true); setExtractedProducts([]);
        try {
            const products = await documentService.extractProductsWithAI(text);
            setExtractedProducts(products.map(p => ({...p, id: `${Date.now()}-${Math.random()}`, selected: true })));
            toast.success(`${products.length} ürün başarıyla bulundu!`);
        } catch (error) { console.error(error); toast.error("İşlem sırasında bir hata oluştu."); } 
        finally { setIsProcessing(false); }
    };

    const handleFileProcessing = async (file) => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const textContent = await documentService.processFile(file);
            if (activeTab === 'translate') {
                setTranslateData(prev => ({ ...prev, originalText: textContent }));
                toast.success("Dosya içeriği çeviri alanına aktarıldı.");
            } else {
                await processTextWithAI(textContent);
            }
        } catch (error) { console.error(error); toast.error("Dosya okunurken bir hata oluştu."); }
        finally { setIsProcessing(false); }
    };

    const handleTranslate = async () => {
        if (!translateData.originalText.trim()) return;
        setIsProcessing(true);
        try {
            const detectedLang = await documentService.detectLanguage(translateData.originalText);
            const translated = await documentService.translateText(translateData.originalText, translateData.targetLang, detectedLang);
            setTranslateData(prev => ({ ...prev, translatedText: translated }));
            toast.success("Metin başarıyla çevrildi.");
        } catch (error) { toast.error("Çeviri sırasında hata oluştu."); }
        finally { setIsProcessing(false); }
    };

    const handleAddManualProductToList = () => {
        if (!manualProduct.name.trim()) return;
        setManualProductList(prev => [...prev, { ...manualProduct, id: Date.now() }]);
        setManualProduct({ name: '', quantity: 1, unit: 'adet', brand: '', articleNumber: '' });
    };

    const addManualListToCart = () => {
        setSelectedProducts(prev => [...prev, ...manualProductList]);
        setManualProductList([]);
        toast.success(`${manualProductList.length} ürün sepete eklendi.`);
    };

    const addExtractedToCart = () => {
        const selected = extractedProducts.filter(p => p.selected);
        if (selected.length === 0) {
            toast.warning("Lütfen sepete eklemek için en az bir ürün seçin.");
            return;
        }
        setSelectedProducts(prev => [...prev, ...selected]);
        setExtractedProducts([]);
        toast.success(`${selected.length} ürün sepete eklendi.`);
    };

    const handleSubmitRequest = async () => {
        setIsProcessing(true);
        const finalPayload = { 
            ...requestData, 
            internalRequester: user, 
            products: selectedProducts,
        };

        try {
            const response = await requestService.createRequest(finalPayload);
            toast.success(`Talep başarıyla oluşturuldu! Veritabanı ID: ${response.data.id}`);
            setActiveStep(0);
            setSelectedProducts([]);
            setRequestData({ customTalepId: '', title: '', description: '', externalCompanyName: '', externalRequesterName: '' });
        } catch (error) {
            console.error("Talep gönderme hatası:", error);
            toast.error(error.response?.data?.message || "Talep oluşturulurken bir hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNext = () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setActiveStep(prev => Math.max(prev - 1, 0));
    const handleStepClick = (index) => setActiveStep(index);

    const handleSelectAllProducts = (event) => {
        const isChecked = event.target.checked;
        setExtractedProducts(prev => prev.map(p => ({ ...p, selected: isChecked })));
    };

    const handleSelectProduct = (productId) => {
        setExtractedProducts(prev => prev.map(p => p.id === productId ? { ...p, selected: !p.selected } : p));
    };

    const handleEditProductChange = (field, value) => {
        setEditProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveEditedProduct = () => {
        setExtractedProducts(prev => prev.map(p => p.id === editProduct.id ? editProduct : p));
        setEditProduct(null);
        toast.success("Ürün bilgileri güncellendi.");
    };

    const isStepValid = (step) => {
        switch (step) {
            case 0: return selectedProducts.length > 0;
            case 1: return requestData.title.trim() !== '' && requestData.customTalepId.trim() !== '';
            case 2: return requestData.externalCompanyName.trim() !== '';
            default: return true;
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0: // Ürün Ekleme
                return (
                    // Bu bölümün içeriği bir önceki versiyonla aynı, değişiklik yok.
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}><OptionCard selected={activeTab === 'ai-upload'} onClick={() => setActiveTab('ai-upload')}><AIIcon color="primary" sx={{ fontSize: 32, mb: 1 }} /><Typography variant="subtitle1">AI Dosya İşleme</Typography><Typography variant="caption" color="text.secondary">Otomatik ürün çıkarımı</Typography></OptionCard></Grid>
                            <Grid item xs={12} sm={4}><OptionCard selected={activeTab === 'manual'} onClick={() => setActiveTab('manual')}><ManualAddIcon color="secondary" sx={{ fontSize: 32, mb: 1 }} /><Typography variant="subtitle1">Manuel Ekleme</Typography><Typography variant="caption" color="text.secondary">Elle ürün girişi</Typography></OptionCard></Grid>
                            <Grid item xs={12} sm={4}><OptionCard selected={activeTab === 'translate'} onClick={() => setActiveTab('translate')}><TranslateIcon color="success" sx={{ fontSize: 32, mb: 1 }} /><Typography variant="subtitle1">Çevir & İşle</Typography><Typography variant="caption" color="text.secondary">Metin çevirisi</Typography></OptionCard></Grid>
                        </Grid>
                        <Box mt={3}>
                            {activeTab === 'ai-upload' && <Dropzone onClick={() => fileInputRef.current.click()}><input ref={fileInputRef} type="file" hidden onChange={(e) => handleFileProcessing(e.target.files[0])} /><UploadIcon sx={{ fontSize: 48, color: 'grey.500' }} /><Typography variant="h6">Dosyanızı Sürükleyin veya Seçin</Typography><Typography variant="body2" color="text.secondary">PDF, Word, Excel veya Resim</Typography></Dropzone>}
                            {activeTab === 'manual' && <Paper variant="outlined" sx={{ p: 2 }}><Grid container spacing={2} alignItems="center"><Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Ürün Adı" value={manualProduct.name} onChange={e => setManualProduct({...manualProduct, name: e.target.value})} /></Grid><Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Marka" value={manualProduct.brand} onChange={e => setManualProduct({...manualProduct, brand: e.target.value})} /></Grid><Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Artikel No" value={manualProduct.articleNumber} onChange={e => setManualProduct({...manualProduct, articleNumber: e.target.value})} /></Grid><Grid item xs={6} sm={3}><TextField fullWidth size="small" label="Miktar" type="number" value={manualProduct.quantity} onChange={e => setManualProduct({...manualProduct, quantity: e.target.value})} /></Grid><Grid item xs={6} sm={3}><TextField fullWidth size="small" label="Birim" value={manualProduct.unit} onChange={e => setManualProduct({...manualProduct, unit: e.target.value})} /></Grid><Grid item xs={12} sm={6}><Button fullWidth variant="contained" onClick={handleAddManualProductToList} sx={{height: '100%'}}><AddIcon /> Listeye Ekle</Button></Grid></Grid>{manualProductList.length > 0 && <Box mt={2}><List dense>{manualProductList.map(p => <ListItem key={p.id}><ListItemText primary={p.name} secondary={`Marka: ${p.brand || '-'}, Artikel: ${p.articleNumber || '-'}, Miktar: ${p.quantity} ${p.unit}`} /></ListItem>)}</List><Button fullWidth variant="outlined" onClick={addManualListToCart}>Listeyi Sepete Ekle</Button></Box>}</Paper>}
                            {activeTab === 'translate' && <Paper variant="outlined" sx={{ p: 2 }}><Grid container spacing={2}><Grid item xs={12}><Button fullWidth variant="outlined" onClick={() => fileInputRef.current.click()}>Çevrilecek Dosyayı Yükle</Button><input ref={fileInputRef} type="file" hidden onChange={(e) => handleFileProcessing(e.target.files[0])} /></Grid><Grid item xs={12}><TextField fullWidth multiline rows={3} label="Orijinal Metin" value={translateData.originalText} onChange={e => setTranslateData({...translateData, originalText: e.target.value})} /></Grid><Grid item xs={12} sm={4}><FormControl fullWidth size="small"><InputLabel>Hedef Dil</InputLabel><Select value={translateData.targetLang} label="Hedef Dil" onChange={e => setTranslateData({...translateData, targetLang: e.target.value})}><MenuItem value="tr">Türkçe</MenuItem><MenuItem value="en">İngilizce</MenuItem></Select></FormControl></Grid><Grid item xs={12} sm={8}><Button fullWidth variant="contained" color="success" onClick={handleTranslate} disabled={isProcessing}>Çevir</Button></Grid><Grid item xs={12}><TextField fullWidth multiline rows={3} label="Çevrilmiş Metin" value={translateData.translatedText} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12}><Button fullWidth variant="contained" onClick={() => processTextWithAI(translateData.translatedText)} disabled={isProcessing || !translateData.translatedText.trim()}>Çeviriden Ürün Çıkar</Button></Grid></Grid></Paper>}
                        </Box>
                        {isProcessing && <Box sx={{ width: '100%', mt: 2 }}><LinearProgress /></Box>}
                        {extractedProducts.length > 0 && <Card sx={{mt: 2}}><CardHeader title="Bulunan Ürünler" action={<Button variant="contained" size="small" onClick={addExtractedToCart} startIcon={<ShoppingCartIcon />}>Seçilenleri Ekle</Button>}/><CardContent><TableContainer><Table size="small"><TableHead><TableRow><TableCell padding="checkbox"><Checkbox indeterminate={extractedProducts.some(p=>p.selected) && !extractedProducts.every(p=>p.selected)} checked={extractedProducts.length > 0 && extractedProducts.every(p=>p.selected)} onChange={handleSelectAllProducts} /></TableCell><TableCell>Ürün Detayları</TableCell><TableCell>Miktar</TableCell><TableCell align="right">İşlemler</TableCell></TableRow></TableHead><TableBody>{extractedProducts.map(p => (<TableRow key={p.id}><TableCell padding="checkbox"><Checkbox checked={p.selected} onChange={() => handleSelectProduct(p.id)} /></TableCell><TableCell><ListItemText primary={p.name} secondary={`Marka: ${p.brand || '-'} / Art. No: ${p.articleNumber || '-'}`} /></TableCell><TableCell>{p.quantity} {p.unit}</TableCell><TableCell align="right"><IconButton size="small" onClick={() => setEditProduct(p)}><EditIcon /></IconButton></TableCell></TableRow>))}</TableBody></Table></TableContainer></CardContent></Card>}
                    </Box>
                );
            case 1: // Talep Bilgileri
                return (
                    <Card>
                        <CardContent>
                            <TextField fullWidth label="Talep Tanımı / Numarası" value={requestData.customTalepId} onChange={e => handleDataChange('customTalepId', e.target.value)} sx={{mb: 2}} helperText="Bu alan, talebin benzersiz numarası olacaktır." required />
                            <TextField fullWidth label="Talep Başlığı" value={requestData.title} onChange={e => handleDataChange('title', e.target.value)} sx={{mb: 2}} required />
                            <TextField fullWidth multiline rows={4} label="Açıklama" value={requestData.description} onChange={e => handleDataChange('description', e.target.value)} />
                        </CardContent>
                    </Card>
                );
            case 2: // Kişi Bilgileri
                return (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Talebi Açan Firma Bilgileri (Yurtdışı)</Typography>
                            <Autocomplete
                                freeSolo
                                options={companies.map((option) => option.name)}
                                value={requestData.externalCompanyName}
                                onChange={(event, newValue) => {
                                    handleDataChange('externalCompanyName', newValue);
                                }}
                                onInputChange={(event, newInputValue) => {
                                    handleDataChange('externalCompanyName', newInputValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Firma Adı (Seçin veya Yeni Yazın)"
                                        sx={{ mb: 2 }}
                                        required
                                    />
                                )}
                            />
                            <TextField fullWidth label="İlgili Kişi" value={requestData.externalRequesterName} onChange={e => handleDataChange('externalRequesterName', e.target.value)} sx={{mb: 3}} />
                            <Divider sx={{mb: 3}} />
                            <Typography variant="h6" gutterBottom>Talebi Sisteme Giren Personel</Typography>
                            <TextField fullWidth label="Adınız Soyadınız" value={user.name} disabled sx={{mb: 2}} />
                            <TextField fullWidth label="Departmanınız" value={user.department} disabled />
                        </CardContent>
                    </Card>
                );
            case 3: // Önizleme
                return (
                    <Card>
                        <CardHeader title="Talep Özeti ve Onay" subheader="Lütfen bilgileri kontrol ettikten sonra onaya gönderin." />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><Typography variant="h6">Talep Bilgileri</Typography><Divider /></Grid>
                                <Grid item xs={4}><Typography color="text.secondary">Talep No:</Typography></Grid><Grid item xs={8}><Typography>{requestData.customTalepId}</Typography></Grid>
                                <Grid item xs={4}><Typography color="text.secondary">Talep Başlığı:</Typography></Grid><Grid item xs={8}><Typography>{requestData.title}</Typography></Grid>
                                <Grid item xs={4}><Typography color="text.secondary">Açıklama:</Typography></Grid><Grid item xs={8}><Typography sx={{whiteSpace: 'pre-wrap'}}>{requestData.description || '-'}</Typography></Grid>
                                <Grid item xs={12} mt={2}><Typography variant="h6">Kişi Bilgileri</Typography><Divider /></Grid>
                                <Grid item xs={4}><Typography color="text.secondary">Talep Sahibi Firma:</Typography></Grid><Grid item xs={8}><Typography>{requestData.externalCompanyName}</Typography></Grid>
                                <Grid item xs={4}><Typography color="text.secondary">İlgili Kişi (Firma):</Typography></Grid><Grid item xs={8}><Typography>{requestData.externalRequesterName}</Typography></Grid>
                                <Grid item xs={4}><Typography color="text.secondary">Sisteme Giren:</Typography></Grid><Grid item xs={8}><Typography>{user.name} ({user.department})</Typography></Grid>
                                <Grid item xs={4}><Typography color="text.secondary">Onaya Gidecek:</Typography></Grid><Grid item xs={8}><Chip icon={<ApprovalIcon />} label="Satınalma Müdürü" color="primary" /></Grid>
                                <Grid item xs={12} mt={2}><Typography variant="h6">Ürünler ({selectedProducts.length})</Typography><Divider /></Grid>
                                <Grid item xs={12}><List dense>{selectedProducts.map(p=><ListItem key={p.id}><ListItemText primary={p.name} secondary={`Marka: ${p.brand || '-'}, Art: ${p.articleNumber || '-'}, Miktar: ${p.quantity} ${p.unit}`} /></ListItem>)}</List></Grid>
                            </Grid>
                            <Button fullWidth variant="contained" sx={{mt: 3}} onClick={handleSubmitRequest} disabled={isProcessing} startIcon={<SendIcon />}>Talebi Onaya Gönder</Button>
                        </CardContent>
                    </Card>
                );
            default: return <Typography>Bu adım henüz oluşturulmadı.</Typography>;
        }
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
            <Toaster richColors position="top-right" />
            <Paper elevation={0} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><AIIcon color="primary" sx={{ fontSize: 32 }} /><Box><Typography variant="h5" fontWeight={600}>AI Talep Sistemi</Typography><Typography variant="subtitle2" color="text.secondary">Akıllı Satın Alma Sihirbazı</Typography></Box></Box>
                <Chip icon={<AIIcon fontSize="small" />} label="Gemini AI Aktif" color="success" variant="outlined" sx={{ fontWeight: 500 }} />
            </Paper>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Card elevation={0} sx={{ borderRadius: 3, p: 1 }}>
                        <CardHeader title="İlerleme Durumu" />
                        <CardContent>
                            {steps.map((label, index) => (
                                <StepCard key={label} active={activeStep === index} onClick={() => handleStepClick(index)}>
                                    <Avatar sx={{ bgcolor: activeStep >= index ? 'primary.main' : 'grey.300', color: 'white' }}>{stepIcons[index]}</Avatar>
                                    <Box><Typography variant="subtitle1" fontWeight={500}>{label}</Typography><Typography variant="caption" color="text.secondary">{stepSubtitles[index]}</Typography></Box>
                                </StepCard>
                            ))}
                            <Box mt={2}><Typography variant="caption" sx={{ display: 'flex', justifyContent: 'space-between' }}><span>İlerleme</span><span>{Math.round((activeStep / (steps.length - 1)) * 100)}%</span></Typography><LinearProgress variant="determinate" value={(activeStep / (steps.length - 1)) * 100} sx={{ height: 8, borderRadius: 4 }} /></Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}><Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>{stepIcons[activeStep]}</Avatar><Box><Typography variant="h5">{steps[activeStep]}</Typography><Typography variant="body2" color="text.secondary">{stepSubtitles[activeStep]}</Typography></Box></Box>
                        {renderStepContent(activeStep)}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowBackIcon />}>Önceki Adım</Button>
                            <Button variant="contained" disabled={!isStepValid(activeStep) || activeStep === steps.length - 1} onClick={handleNext} endIcon={<ArrowForwardIcon />}>Sonraki Adım</Button>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={0} sx={{ borderRadius: 3 }}>
                        <CardHeader title="Sepet Özeti" avatar={<ShoppingCartIcon />} />
                        <CardContent>
                            {selectedProducts.length > 0 ? (
                                <List dense>
                                    {selectedProducts.map(p => (
                                        <ListItem key={p.id} secondaryAction={<IconButton edge="end" onClick={() => setSelectedProducts(prev => prev.filter(prod => prod.id !== p.id))}><DeleteIcon /></IconButton>}>
                                            <ListItemText 
                                                primary={p.name} 
                                                secondary={`Marka: ${p.brand || '-'}, Art: ${p.articleNumber || '-'}, Miktar: ${p.quantity} ${p.unit}`} 
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box textAlign="center" p={3} sx={{ color: 'text.secondary' }}>
                                    <WidgetsIcon sx={{ fontSize: 48, mb: 1 }} />
                                    <Typography>Henüz ürün eklenmedi</Typography>
                                    <Typography variant="caption">İlk adımdan ürün ekleyebilirsiniz</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Ürün Düzenleme Penceresi */}
            <Dialog open={!!editProduct} onClose={() => setEditProduct(null)}>
                <DialogTitle>Ürün Bilgilerini Düzenle</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Ürün Adı" type="text" fullWidth variant="standard" value={editProduct?.name || ''} onChange={(e) => handleEditProductChange('name', e.target.value)} />
                    <TextField margin="dense" label="Marka" type="text" fullWidth variant="standard" value={editProduct?.brand || ''} onChange={(e) => handleEditProductChange('brand', e.target.value)} />
                    <TextField margin="dense" label="Artikel Numarası" type="text" fullWidth variant="standard" value={editProduct?.articleNumber || ''} onChange={(e) => handleEditProductChange('articleNumber', e.target.value)} />
                    <TextField margin="dense" label="Miktar" type="number" fullWidth variant="standard" value={editProduct?.quantity || ''} onChange={(e) => handleEditProductChange('quantity', e.target.value)} />
                    <TextField margin="dense" label="Birim" type="text" fullWidth variant="standard" value={editProduct?.unit || ''} onChange={(e) => handleEditProductChange('unit', e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditProduct(null)}>İptal</Button>
                    <Button onClick={handleSaveEditedProduct}>Kaydet</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UnifiedRequestSystem;
