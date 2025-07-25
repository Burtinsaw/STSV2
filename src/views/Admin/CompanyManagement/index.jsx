// src/views/Admin/CompanyManagement/index.jsx - Gerçek DOCX, PDF Şablonları ve Çift Dilli Sözleşme Sistemi
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Badge,
  LinearProgress,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardActions,
  CardMedia,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  PictureAsPdf as PdfIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  PhotoCamera as CameraIcon,
  Image as ImageIcon,
  Description as TemplateIcon,
  Assignment as ContractIcon,
  Email as LoiIcon,
  Gavel as PetitionIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Article as DocxIcon,
  Language as LanguageIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// DOCX kütüphaneleri
import { Document, Packer, Paragraph, TextRun, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const CompanyManagement = () => {
  // State yönetimi
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'details'
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [templateUploading, setTemplateUploading] = useState(false);

  // Şablon yönetimi state'leri
  const [templates, setTemplates] = useState([]);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    id: null,
    name: '',
    category: 'cari_kart',
    description: '',
    file: null,
    fileUrl: null,
    variables: [],
    languages: ['tr'],
    isMultiParty: false,
    isDefault: false,
    templateType: 'docx'
  });

  // İki taraflı sözleşme state'i
  const [contractParties, setContractParties] = useState({
    party1: {
      name: '',
      address: '',
      taxNumber: '',
      representative: '',
      title: '',
      language: 'tr'
    },
    party2: {
      name: '',
      address: '',
      taxNumber: '',
      representative: '',
      title: '',
      language: 'en'
    }
  });

  // Form state
  const [companyForm, setCompanyForm] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    taxOffice: '',
    mersisNumber: '',
    tradeRegistryNumber: '',
    companyType: 'Anonim Şirket',
    totalCapital: '',
    foundedDate: '',
    city: '',
    electronicNotificationAddress: '',
    status: 'active',
    logo: null,
    logoUrl: null
  });

  // Banka hesapları state
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankForm, setBankForm] = useState({
    id: null,
    bankName: '',
    currency: 'TL',
    iban: '',
    accountType: 'Vadesiz Hesap'
  });
  const [openBankDialog, setOpenBankDialog] = useState(false);

  // Şablon kategorileri
  const templateCategories = [
    { value: 'cari_kart', label: 'Cari Kart Tasarımları', icon: <BusinessIcon />, color: 'primary', multiParty: false },
    { value: 'loi', label: 'LOI (Letter of Intent)', icon: <LoiIcon />, color: 'secondary', multiParty: true },
    { value: 'dilekce', label: 'Dilekçe Örnekleri', icon: <PetitionIcon />, color: 'warning', multiParty: false },
    { value: 'sozlesme', label: 'Sözleşme Örnekleri', icon: <ContractIcon />, color: 'success', multiParty: true }
  ];

  // Dil seçenekleri
  const languageOptions = [
    { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  // Türkiye bankaları listesi
  const turkishBanks = [
    'Türkiye Cumhuriyet Merkez Bankası',
    'Türkiye İş Bankası A.Ş.',
    'Türkiye Garanti Bankası A.Ş.',
    'Yapı ve Kredi Bankası A.Ş.',
    'Akbank T.A.Ş.',
    'Türkiye Halk Bankası A.Ş.',
    'Türkiye Ziraat Bankası A.Ş.',
    'Türkiye Vakıflar Bankası T.A.O.',
    'Denizbank A.Ş.',
    'QNB Finansbank A.Ş.',
    'ICBC Turkey Bank A.Ş.',
    'ING Bank A.Ş.',
    'Şekerbank T.A.Ş.',
    'Turkish Bank A.Ş.',
    'Fibabanka A.Ş.',
    'Odeabank A.Ş.',
    'Türk Ekonomi Bankası A.Ş.',
    'Anadolubank A.Ş.',
    'Burgan Bank A.Ş.',
    'Citibank A.Ş.',
    'Deutsche Bank A.Ş.',
    'HSBC Bank A.Ş.',
    'JPMorgan Chase Bank N.A.',
    'Société Générale (SA)',
    'Standard Chartered Bank',
    'Albaraka Türk Katılım Bankası A.Ş.',
    'Kuveyt Türk Katılım Bankası A.Ş.',
    'Türkiye Finans Katılım Bankası A.Ş.',
    'Vakıf Katılım Bankası A.Ş.',
    'Ziraat Katılım Bankası A.Ş.',
    'Emlak Katılım Bankası A.Ş.'
  ];

  // Para birimleri
  const currencies = ['TL', 'USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CNY', 'RUB', 'SAR', 'AED', 'KWD', 'QAR'];

  // Şirket türleri
  const companyTypes = [
    'Anonim Şirket',
    'Limited Şirket',
    'Tek Kişi Şirketi',
    'Kolektif Şirket',
    'Komandit Şirket'
  ];

  // Mock data - BN İnovasyon örneği ve şablonlar
  useEffect(() => {
    const mockCompanies = [
      {
        id: 1,
        name: 'BN İNOVASYON YAPI DIŞ TİCARET ANONİM ŞİRKETİ',
        email: 'info@bninovasyon.com',
        phone: '+90 212 555 0123',
        address: 'Esenyurt, İstanbul',
        taxNumber: '1781779298',
        taxOffice: 'ESENYURT VERGİ DAİRESİ',
        mersisNumber: '0178177929800001',
        tradeRegistryNumber: '1025929',
        companyType: 'TEK PAY SAHİPLİ ANONİM ŞİRKET',
        totalCapital: '1.000.000,00 TL',
        foundedDate: '26-06-2024',
        city: 'İSTANBUL',
        electronicNotificationAddress: '25828-12810-70200',
        status: 'active',
        logo: null,
        logoUrl: null
      }
    ];

    const mockBankAccounts = [
      {
        id: 1,
        companyId: 1,
        bankName: 'Emlak Katılım Bankası A.Ş.',
        currency: 'TL',
        iban: 'TR98 0021 2000 0000 0123 4567 89',
        accountType: 'Vadesiz Hesap'
      },
      {
        id: 2,
        companyId: 1,
        bankName: 'Emlak Katılım Bankası A.Ş.',
        currency: 'USD',
        iban: 'TR98 0021 2000 0000 0987 6543 21',
        accountType: 'Döviz Hesabı'
      },
      {
        id: 3,
        companyId: 1,
        bankName: 'Türkiye İş Bankası A.Ş.',
        currency: 'EUR',
        iban: 'TR64 0006 4000 0000 1111 2222 33',
        accountType: 'Döviz Hesabı'
      },
      {
        id: 4,
        companyId: 1,
        bankName: 'Türkiye Garanti Bankası A.Ş.',
        currency: 'TL',
        iban: 'TR33 0006 2000 0000 5555 6666 77',
        accountType: 'Cari Hesap'
      }
    ];

    // Örnek şablonlar
    const mockTemplates = [
      {
        id: 1,
        name: 'Standart Cari Kart',
        category: 'cari_kart',
        description: 'Klasik mavi tasarımlı cari kart şablonu',
        fileUrl: null,
        variables: ['{{COMPANY_NAME}}', '{{TAX_NUMBER}}', '{{ADDRESS}}', '{{PHONE}}', '{{EMAIL}}'],
        languages: ['tr', 'en'],
        isMultiParty: false,
        isDefault: true,
        templateType: 'docx'
      },
      {
        id: 2,
        name: 'Modern Cari Kart (PDF)',
        category: 'cari_kart',
        description: 'Modern gradient tasarımlı PDF cari kart şablonu',
        fileUrl: null,
        variables: ['{{COMPANY_NAME}}', '{{TAX_NUMBER}}', '{{MERSIS_NUMBER}}', '{{BANK_ACCOUNTS}}'],
        languages: ['tr'],
        isMultiParty: false,
        isDefault: false,
        templateType: 'pdf'
      },
      {
        id: 3,
        name: 'İki Taraflı Tedarikçi Sözleşmesi',
        category: 'sozlesme',
        description: 'İngilizce-Rusça iki taraflı tedarikçi sözleşmesi',
        fileUrl: null,
        variables: ['{{PARTY1_NAME}}', '{{PARTY2_NAME}}', '{{CONTRACT_DATE}}', '{{TERMS}}'],
        languages: ['en', 'ru'],
        isMultiParty: true,
        isDefault: true,
        templateType: 'docx'
      },
      {
        id: 4,
        name: 'Çok Dilli LOI Şablonu',
        category: 'loi',
        description: 'Türkçe-İngilizce-Rusça LOI şablonu',
        fileUrl: null,
        variables: ['{{COMPANY_NAME}}', '{{PARTNER_NAME}}', '{{PROJECT_NAME}}', '{{DATE}}'],
        languages: ['tr', 'en', 'ru'],
        isMultiParty: true,
        isDefault: false,
        templateType: 'docx'
      }
    ];

    setCompanies(mockCompanies);
    setBankAccounts(mockBankAccounts);
    setTemplates(mockTemplates);
  }, []);

  // Gerçek DOCX oluşturma fonksiyonu
  const generateRealDOCX = async (company, template, language = 'tr', parties = null) => {
    setDocxLoading(true);

    try {
      const templateData = prepareTemplateData(company, template, language, parties);
      let doc;

      if (template.isMultiParty && template.category === 'sozlesme') {
        doc = createDualLanguageContract(templateData, template);
      } else {
        doc = createSingleLanguageDoc(templateData, template, language);
      }

      const blob = await Packer.toBlob(doc);
      const fileName = `${company.name}_${template.name}_${language}.docx`;
      saveAs(blob, fileName);

      showSnackbar(`${template.name} şablonu (${language}) DOCX olarak oluşturuldu`, 'success');

    } catch (error) {
      console.error('Gerçek DOCX oluşturma hatası:', error);
      showSnackbar('DOCX dosyası oluşturulurken hata oluştu', 'error');
    } finally {
      setDocxLoading(false);
    }
  };

  // Tek dilli DOCX oluşturma
  const createSingleLanguageDoc = (data, template, language) => {
    const children = [];
    children.push(new Paragraph({ text: template.name, heading: 'Heading1' }));

    template.variables.forEach(variable => {
      const key = variable.replace(/[{}]/g, '');
      const value = data[key] || variable;
      children.push(new Paragraph({ children: [new TextRun({ text: `${key}: `, bold: true }), new TextRun(value)] }));
    });

    return new Document({ sections: [{ children }] });
  };

  // Çift dilli sözleşme DOCX oluşturma
  const createDualLanguageContract = (data, template) => {
    const sections = [];
    const children = [];

    children.push(new Paragraph({ text: `CONTRACT / КОНТРАКТ № ${data.CONTRACT_DATE}`, heading: 'Title', alignment: 'center' }));
    children.push(new Paragraph({ text: ' ' })); // Boşluk

    const table = new DocxTable({
      rows: [
        new DocxTableRow({
          children: [
            new DocxTableCell({
              children: [
                new Paragraph({ text: 'ENGLISH VERSION', bold: true }),
                new Paragraph({ text: `The company «${data.PARTY1_NAME}», Turkey, represented by the General director ${data.PARTY1_REPRESENTATIVE}, hereinafter referred to as SELLER, on the one hand, and LLC «${data.PARTY2_NAME}», Russia, represented by director ${data.PARTY2_REPRESENTATIVE}, hereinafter referred to as the BUYER, on the other hand, have concluded the present Contract as follows:` }),
                new Paragraph({ text: ' ' }),
                new Paragraph({ text: '1. SUBJECT OF THE CONTRACT', bold: true }),
                new Paragraph({ text: 'The SELLER sells, and the BUYER purchases goods (equipment) for delivery to the territory of the Russian Federation.' })
              ],
              width: { size: 4500, type: WidthType.DXA }
            }),
            new DocxTableCell({
              children: [
                new Paragraph({ text: 'РУССКАЯ ВЕРСИЯ', bold: true }),
                new Paragraph({ text: `Компания «${data.PARTY1_NAME}», Турция, в лице Директора ${data.PARTY1_REPRESENTATIVE}, в дальнейшем именуемая ПРОДАВЕЦ, с одной стороны, и ООО «${data.PARTY2_NAME}», Россия, в лице директора ${data.PARTY2_REPRESENTATIVE}, в дальнейшем именуемая ПОКУПАТЕЛЬ, с другой стороны, заключили настоящий Контракт о нижеследующем:` }),
                new Paragraph({ text: ' ' }),
                new Paragraph({ text: '1. ПРЕДМЕТ КОНТРАКТА.', bold: true }),
                new Paragraph({ text: 'ПРОДАВЕЦ продает, а ПОКУПАТЕЛЬ покупает товары (оборудование) для поставки на территорию РФ.' })
              ],
              width: { size: 4500, type: WidthType.DXA }
            })
          ]
        })
      ],
      width: { size: 9000, type: WidthType.DXA }
    });

    children.push(table);

    return new Document({ sections: [{ children }] });
  };

  // Şablon verilerini hazırlama
  const prepareTemplateData = (company, template, language, parties) => {
    const companyBankAccounts = bankAccounts.filter(b => b.companyId === company.id);
    const bankAccountsText = companyBankAccounts.map(account => 
      `${account.bankName} (${account.currency}): ${account.iban}`
    ).join('\n');

    const baseData = {
      COMPANY_NAME: company.name || '',
      TAX_NUMBER: company.taxNumber || '',
      TAX_OFFICE: company.taxOffice || '',
      MERSIS_NUMBER: company.mersisNumber || '',
      TRADE_REGISTRY: company.tradeRegistryNumber || '',
      ADDRESS: company.address || '',
      PHONE: company.phone || '',
      EMAIL: company.email || '',
      CITY: company.city || '',
      COMPANY_TYPE: company.companyType || '',
      TOTAL_CAPITAL: company.totalCapital || '',
      FOUNDED_DATE: company.foundedDate || '',
      BANK_ACCOUNTS: bankAccountsText,
      DATE: new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US'),
      CONTRACT_DATE: new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')
    };

    // İki taraflı sözleşme verileri
    if (template.isMultiParty && parties) {
      baseData.PARTY1_NAME = parties.party1.name || company.name;
      baseData.PARTY1_ADDRESS = parties.party1.address || company.address;
      baseData.PARTY1_TAX_NUMBER = parties.party1.taxNumber || company.taxNumber;
      baseData.PARTY1_REPRESENTATIVE = parties.party1.representative || '';
      baseData.PARTY1_TITLE = parties.party1.title || '';
      
      baseData.PARTY2_NAME = parties.party2.name || '';
      baseData.PARTY2_ADDRESS = parties.party2.address || '';
      baseData.PARTY2_TAX_NUMBER = parties.party2.taxNumber || '';
      baseData.PARTY2_REPRESENTATIVE = parties.party2.representative || '';
      baseData.PARTY2_TITLE = parties.party2.title || '';
    }

    return baseData;
  };

  // Şablon upload fonksiyonu
  const handleTemplateUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Dosya türü kontrolü
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.type)) {
      showSnackbar('Sadece PDF, Word ve TXT dosyaları desteklenir', 'error');
      return;
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showSnackbar('Dosya boyutu 10MB\'dan küçük olmalıdır', 'error');
      return;
    }

    setTemplateUploading(true);

    try {
      // FileReader ile base64'e çevir
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileUrl = e.target.result;
        setTemplateForm({
          ...templateForm,
          file: file,
          fileUrl: fileUrl
        });
        setTemplateUploading(false);
        showSnackbar('Şablon dosyası başarıyla yüklendi', 'success');
      };
      reader.onerror = () => {
        setTemplateUploading(false);
        showSnackbar('Şablon yüklenirken hata oluştu', 'error');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setTemplateUploading(false);
      showSnackbar('Şablon yüklenirken hata oluştu', 'error');
    }
  };

  // Logo upload fonksiyonu
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showSnackbar('Sadece JPG, PNG, GIF ve WebP dosyaları desteklenir', 'error');
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
      return;
    }

    setLogoUploading(true);

    try {
      // FileReader ile base64'e çevir
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target.result;
        setCompanyForm({
          ...companyForm,
          logo: file,
          logoUrl: logoUrl
        });
        setLogoUploading(false);
        showSnackbar('Logo başarıyla yüklendi', 'success');
      };
      reader.onerror = () => {
        setLogoUploading(false);
        showSnackbar('Logo yüklenirken hata oluştu', 'error');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setLogoUploading(false);
      showSnackbar('Logo yüklenirken hata oluştu', 'error');
    }
  };

  // Şablon kaydetme
  const handleSaveTemplate = () => {
    try {
      if (!templateForm.name || !templateForm.category) {
        showSnackbar('Şablon adı ve kategori zorunludur', 'error');
        return;
      }

      if (templateForm.id) {
        setTemplates(templates.map(t => t.id === templateForm.id ? templateForm : t));
        showSnackbar('Şablon güncellendi', 'success');
      } else {
        const newTemplate = {
          ...templateForm,
          id: Date.now()
        };
        setTemplates([...templates, newTemplate]);
        showSnackbar('Şablon eklendi', 'success');
      }
      
      setOpenTemplateDialog(false);
      resetTemplateForm();
    } catch (error) {
      showSnackbar('Bir hata oluştu', 'error');
    }
  };

  // Şirket ekleme/düzenleme
  const handleSaveCompany = () => {
    try {
      if (dialogType === 'add') {
        const newCompany = {
          ...companyForm,
          id: Date.now()
        };
        setCompanies([...companies, newCompany]);
        showSnackbar('Şirket başarıyla eklendi', 'success');
      } else if (dialogType === 'edit') {
        setCompanies(companies.map(c => c.id === companyForm.id ? companyForm : c));
        showSnackbar('Şirket başarıyla güncellendi', 'success');
      }
      
      setOpenDialog(false);
      resetCompanyForm();
    } catch (error) {
      showSnackbar('Bir hata oluştu', 'error');
    }
  };

  // Banka hesabı ekleme/düzenleme
  const handleSaveBankAccount = () => {
    try {
      if (bankForm.id) {
        setBankAccounts(bankAccounts.map(b => b.id === bankForm.id ? bankForm : b));
        showSnackbar('Banka hesabı güncellendi', 'success');
      } else {
        const newBankAccount = {
          ...bankForm,
          id: Date.now(),
          companyId: selectedCompany.id
        };
        setBankAccounts([...bankAccounts, newBankAccount]);
        showSnackbar('Banka hesabı eklendi', 'success');
      }
      
      setOpenBankDialog(false);
      resetBankForm();
    } catch (error) {
      showSnackbar('Bir hata oluştu', 'error');
    }
  };

  // Standart PDF oluşturma fonksiyonu (mevcut)
  const generatePDF = async (company, language = 'tr') => {
    setPdfLoading(true);
    
    try {
      // jsPDF yükleme denemesi
      let jsPDF = null;
      try {
        const jsPDFModule = await import('jspdf');
        jsPDF = jsPDFModule.default;
      } catch (npmError) {
        console.log('jsPDF npm paketi yüklenemedi, CDN deneniyor...');
        if (typeof window !== 'undefined' && window.jsPDF) {
          jsPDF = window.jsPDF.jsPDF || window.jsPDF;
        }
      }

      if (!jsPDF) {
        console.log('jsPDF bulunamadı, metin dosyası oluşturuluyor...');
        return generateTextFile(company, language);
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;

      // Türkçe karakter desteği için özel encoding fonksiyonu
      const turkishToLatin = (text) => {
        if (!text) return '';
        const turkishChars = {
          'ç': 'c', 'Ç': 'C',
          'ğ': 'g', 'Ğ': 'G', 
          'ı': 'i', 'İ': 'I',
          'ö': 'o', 'Ö': 'O',
          'ş': 's', 'Ş': 'S',
          'ü': 'u', 'Ü': 'U'
        };
        
        return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, function(match) {
          return turkishChars[match] || match;
        });
      };

      // Arka plan oluşturma
      try {
        // Mavi gradient arka plan
        doc.setFillColor(240, 248, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Header - Mavi gradient
        doc.setFillColor(25, 118, 210);
        doc.rect(0, 0, pageWidth, 45, 'F');
        
        // Footer - Mavi gradient
        doc.setFillColor(25, 118, 210);
        doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        // Dekoratif şekiller
        doc.setFillColor(255, 255, 255, 0.1);
        doc.triangle(pageWidth - 50, 10, pageWidth - 30, 10, pageWidth - 40, 30, 'F');
        doc.triangle(20, pageHeight - 20, 40, pageHeight - 20, 30, pageHeight - 5, 'F');
        
      } catch (bgError) {
        console.log('Arka plan yüklenemedi, basit tasarım kullanılıyor');
      }

      // Logo alanı (eğer logo varsa)
      if (company.logoUrl) {
        try {
          doc.addImage(company.logoUrl, 'JPEG', 15, 10, 25, 25);
        } catch (logoError) {
          console.log('Logo eklenemedi:', logoError);
        }
      } else {
        // Logo yoksa şirket adının ilk harfi
        doc.setFillColor(255, 255, 255);
        doc.circle(27.5, 22.5, 12.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(25, 118, 210);
        doc.text(company.name.charAt(0), 27.5, 27, { align: 'center' });
      }

      // Başlık
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      const title = language === 'tr' ? 'CARİ KART' : 'CURRENT ACCOUNT CARD';
      doc.text(turkishToLatin(title), pageWidth / 2, 30, { align: 'center' });

      // Şirket adı
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(25, 118, 210);
      
      const companyName = turkishToLatin(company.name || '');
      const nameLines = doc.splitTextToSize(companyName, pageWidth - 40);
      let yPos = 60;
      nameLines.forEach(line => {
        doc.text(line, pageWidth / 2, yPos, { align: 'center' });
        yPos += 7;
      });

      // Çizgi
      yPos += 5;
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 15;

      // İki kolon düzeni
      const leftColX = 20;
      const rightColX = 110;
      let leftYPos = yPos;
      let rightYPos = yPos;

      // Sol kolon - Resmi Bilgiler
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(25, 118, 210);
      doc.text(turkishToLatin(language === 'tr' ? 'RESMİ BİLGİLER' : 'OFFICIAL INFORMATION'), leftColX, leftYPos);
      
      leftYPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      
      const leftColumnData = [
        { label: 'MERSİS No', value: company.mersisNumber },
        { label: language === 'tr' ? 'Vergi Dairesi' : 'Tax Office', value: company.taxOffice },
        { label: language === 'tr' ? 'Vergi No' : 'Tax No', value: company.taxNumber },
        { label: language === 'tr' ? 'Ticaret Sicil No' : 'Trade Registry No', value: company.tradeRegistryNumber },
        { label: language === 'tr' ? 'Şirket Türü' : 'Company Type', value: company.companyType },
        { label: language === 'tr' ? 'Toplam Sermaye' : 'Total Capital', value: company.totalCapital },
        { label: language === 'tr' ? 'Kuruluş Tarihi' : 'Founded Date', value: company.foundedDate }
      ];

      leftColumnData.forEach(item => {
        if (item.value) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(25, 118, 210);
          doc.text(turkishToLatin(`${item.label}:`), leftColX, leftYPos);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const valueLines = doc.splitTextToSize(turkishToLatin(item.value), 80);
          valueLines.forEach((line, index) => {
            doc.text(line, leftColX, leftYPos + 5 + (index * 5));
          });
          leftYPos += 12 + (valueLines.length > 1 ? (valueLines.length - 1) * 5 : 0);
        }
      });

      // Sağ kolon - İletişim Bilgileri
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(25, 118, 210);
      doc.text(turkishToLatin(language === 'tr' ? 'İLETİŞİM BİLGİLERİ' : 'CONTACT INFORMATION'), rightColX, rightYPos);
      
      rightYPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      
      const rightColumnData = [
        { label: 'Email', value: company.email },
        { label: language === 'tr' ? 'Telefon' : 'Phone', value: company.phone },
        { label: language === 'tr' ? 'Şehir' : 'City', value: company.city },
        { label: language === 'tr' ? 'Durum' : 'Status', value: language === 'tr' ? 'Aktif' : 'Active' },
        { label: language === 'tr' ? 'E-Tebligat' : 'E-Notification', value: company.electronicNotificationAddress }
      ];

      rightColumnData.forEach(item => {
        if (item.value) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(25, 118, 210);
          doc.text(turkishToLatin(`${item.label}:`), rightColX, rightYPos);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const valueLines = doc.splitTextToSize(turkishToLatin(item.value), 80);
          valueLines.forEach((line, index) => {
            doc.text(line, rightColX, rightYPos + 5 + (index * 5));
          });
          rightYPos += 12 + (valueLines.length > 1 ? (valueLines.length - 1) * 5 : 0);
        }
      });

      // Adres ayrı olarak (uzun olabilir)
      if (company.address) {
        rightYPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 118, 210);
        doc.text(turkishToLatin(language === 'tr' ? 'Adres:' : 'Address:'), rightColX, rightYPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const addressLines = doc.splitTextToSize(turkishToLatin(company.address), 80);
        addressLines.forEach((line, index) => {
          doc.text(line, rightColX, rightYPos + 5 + (index * 5));
        });
        rightYPos += 10 + (addressLines.length * 5);
      }

      // Banka hesapları tablosu
      const companyBankAccounts = bankAccounts.filter(b => b.companyId === company.id);
      if (companyBankAccounts.length > 0) {
        yPos = Math.max(leftYPos, rightYPos) + 20;
        
        // Çizgi
        doc.setDrawColor(25, 118, 210);
        doc.setLineWidth(0.5);
        doc.line(20, yPos - 10, pageWidth - 20, yPos - 10);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(25, 118, 210);
        doc.text(turkishToLatin(language === 'tr' ? 'BANKA HESAPLARI' : 'BANK ACCOUNTS'), 20, yPos);
        
        yPos += 15;
        
        // Tablo başlıkları
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(25, 118, 210);
        doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
        
        doc.text(turkishToLatin(language === 'tr' ? 'Banka' : 'Bank'), 25, yPos);
        doc.text(turkishToLatin(language === 'tr' ? 'Döviz' : 'Currency'), 90, yPos);
        doc.text('IBAN', 120, yPos);
        
        yPos += 12;
        
        // Tablo verileri
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        companyBankAccounts.forEach((account, index) => {
          // Zebra striping
          if (index % 2 === 0) {
            doc.setFillColor(248, 249, 250);
            doc.rect(20, yPos - 4, pageWidth - 40, 10, 'F');
          }
          
          // Banka adını kısalt
          const bankName = turkishToLatin(account.bankName.replace('A.Ş.', '').replace('T.A.Ş.', '').trim());
          const shortBankName = bankName.length > 20 ? bankName.substring(0, 20) + '...' : bankName;
          
          // IBAN'ı tam göster (satır kaydırma ile)
          const fullIban = account.iban;
          
          doc.text(shortBankName, 25, yPos);
          doc.text(account.currency, 90, yPos);
          
          // IBAN'ı tam göstermek için satır kaydırma
          if (fullIban.length > 25) {
            const ibanPart1 = fullIban.substring(0, 25);
            const ibanPart2 = fullIban.substring(25);
            doc.text(ibanPart1, 120, yPos);
            if (ibanPart2) {
              doc.text(ibanPart2, 120, yPos + 4);
              yPos += 8;
            }
          } else {
            doc.text(fullIban, 120, yPos);
          }
          
          yPos += 12;
        });
      }

      // Footer bilgileri
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      const footerText = turkishToLatin(language === 'tr' ? 
        `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}` :
        `Generated Date: ${new Date().toLocaleDateString('en-US')}`
      );
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // PDF'i kaydet
      const fileName = `${turkishToLatin(company.name || 'cari_kart')}_${language}.pdf`;
      doc.save(fileName);
      
      showSnackbar('PDF başarıyla oluşturuldu', 'success');
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      showSnackbar('PDF oluşturulurken hata oluştu', 'error');
      return generateTextFile(company, language);
    } finally {
      setPdfLoading(false);
    }
  };

  // Metin dosyası oluşturma (fallback)
  const generateTextFile = (company, language) => {
    const content = `
${language === 'tr' ? 'CARİ KART' : 'CURRENT ACCOUNT CARD'}
${'='.repeat(60)}

${company.name}

${language === 'tr' ? 'RESMİ BİLGİLER' : 'OFFICIAL INFORMATION'}:
- MERSİS No: ${company.mersisNumber || ''}
- Vergi Dairesi: ${company.taxOffice || ''}
- Vergi No: ${company.taxNumber || ''}
- Ticaret Sicil No: ${company.tradeRegistryNumber || ''}
- Şirket Türü: ${company.companyType || ''}
- Toplam Sermaye: ${company.totalCapital || ''}
- Kuruluş Tarihi: ${company.foundedDate || ''}

${language === 'tr' ? 'İLETİŞİM BİLGİLERİ' : 'CONTACT INFORMATION'}:
- Email: ${company.email || ''}
- Telefon: ${company.phone || ''}
- Şehir: ${company.city || ''}
- Adres: ${company.address || ''}
- E-Tebligat: ${company.electronicNotificationAddress || ''}

${language === 'tr' ? 'BANKA HESAPLARI' : 'BANK ACCOUNTS'}:
${bankAccounts.filter(b => b.companyId === company.id).map(account => 
  `- ${account.bankName} (${account.currency}): ${account.iban}`
).join('\n')}

${language === 'tr' ? 'Oluşturulma Tarihi' : 'Generated Date'}: ${new Date().toLocaleString('tr-TR')}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.name || 'cari_kart'}_${language}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSnackbar('Metin dosyası oluşturuldu (PDF kütüphanesi bulunamadı)', 'warning');
  };

  // Yardımcı fonksiyonlar
  const resetCompanyForm = () => {
    setCompanyForm({
      id: null,
      name: '',
      email: '',
      phone: '',
      address: '',
      taxNumber: '',
      taxOffice: '',
      mersisNumber: '',
      tradeRegistryNumber: '',
      companyType: 'Anonim Şirket',
      totalCapital: '',
      foundedDate: '',
      city: '',
      electronicNotificationAddress: '',
      status: 'active',
      logo: null,
      logoUrl: null
    });
  };

  const resetBankForm = () => {
    setBankForm({
      id: null,
      bankName: '',
      currency: 'TL',
      iban: '',
      accountType: 'Vadesiz Hesap'
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      id: null,
      name: '',
      category: 'cari_kart',
      description: '',
      file: null,
      fileUrl: null,
      variables: [],
      languages: ['tr'],
      isMultiParty: false,
      isDefault: false,
      templateType: 'docx'
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEditCompany = (company) => {
    setCompanyForm(company);
    setDialogType('edit');
    setOpenDialog(true);
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setDialogType('details');
    setOpenDialog(true);
    setTabValue(0);
  };

  const handleAddBankAccount = () => {
    resetBankForm();
    setOpenBankDialog(true);
  };

  const handleEditBankAccount = (account) => {
    setBankForm(account);
    setOpenBankDialog(true);
  };

  const handleDeleteBankAccount = (accountId) => {
    setBankAccounts(bankAccounts.filter(b => b.id !== accountId));
    showSnackbar('Banka hesabı silindi', 'success');
  };

  const handleEditTemplate = (template) => {
    setTemplateForm(template);
    setOpenTemplateDialog(true);
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    showSnackbar('Şablon silindi', 'success');
  };

  // Tab panel component
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  // Kategori rengini al
  const getCategoryColor = (category) => {
    const categoryInfo = templateCategories.find(c => c.value === category);
    return categoryInfo ? categoryInfo.color : 'default';
  };

  // Kategori iconunu al
  const getCategoryIcon = (category) => {
    const categoryInfo = templateCategories.find(c => c.value === category);
    return categoryInfo ? categoryInfo.icon : <TemplateIcon />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Şirket & Şablon Yönetimi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={() => {
              resetTemplateForm();
              setOpenTemplateDialog(true);
            }}
          >
            Şablon Ekle
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetCompanyForm();
              setDialogType('add');
              setOpenDialog(true);
            }}
          >
            Yeni Şirket
          </Button>
        </Box>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{companies.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Şirket
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BankIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{bankAccounts.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Banka Hesabı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TemplateIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{templates.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Şablon
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DocxIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{templates.filter(t => t.templateType === 'docx').length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    DOCX Şablonu
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Şablon Kategorileri */}
      <Typography variant="h5" sx={{ mb: 2 }}>Şablon Kategorileri</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {templateCategories.map((category) => {
          const categoryTemplates = templates.filter(t => t.category === category.value);
          const defaultTemplate = categoryTemplates.find(t => t.isDefault);
          return (
            <Grid item xs={12} sm={6} md={3} key={category.value}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: `${category.color}.main`, mr: 2 }}>
                      {category.icon}
                    </Box>
                    <Typography variant="h6" component="h3">
                      {category.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {categoryTemplates.length} şablon mevcut
                  </Typography>
                  {defaultTemplate && (
                    <Chip
                      label={`Ana Şablon: ${defaultTemplate.name}`}
                      size="small"
                      color="success"
                      variant="outlined"
                      icon={<CheckCircleIcon />}
                      sx={{ mb: 2 }}
                    />
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {categoryTemplates.slice(0, 2).map((template) => (
                      <Chip
                        key={template.id}
                        label={template.name}
                        size="small"
                        color={template.templateType === 'docx' ? 'info' : 'error'}
                        variant="outlined"
                        icon={template.templateType === 'docx' ? <DocxIcon /> : <PdfIcon />}
                      />
                    ))}
                    {categoryTemplates.length > 2 && (
                      <Chip
                        label={`+${categoryTemplates.length - 2} daha`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Şirket Kartları */}
      <Typography variant="h5" sx={{ mb: 2 }}>Şirketler</Typography>
      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} md={6} lg={4} key={company.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      company.logoUrl ? (
                        <ImageIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : null
                    }
                  >
                    <Avatar 
                      sx={{ bgcolor: 'primary.main', mr: 2, width: 50, height: 50 }}
                      src={company.logoUrl}
                    >
                      {!company.logoUrl && company.name.charAt(0)}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {company.name}
                    </Typography>
                    <Chip 
                      label={company.status === 'active' ? 'Aktif' : 'Pasif'} 
                      color={company.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  📧 {company.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  📞 {company.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  🏢 {company.city}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  🏦 {bankAccounts.filter(b => b.companyId === company.id).length} Banka Hesabı
                </Typography>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(company)}
                    sx={{ flex: 1 }}
                  >
                    Detaylar
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditCompany(company)}
                  >
                    Düzenle
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<PdfIcon />}
                    onClick={() => generatePDF(company, 'tr')}
                    disabled={pdfLoading}
                    sx={{ flex: 1 }}
                  >
                    PDF
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    startIcon={<DocxIcon />}
                    onClick={() => generateRealDOCX(company, templates.find(t => t.category === 'cari_kart' && t.isDefault), 'tr')}
                    disabled={docxLoading}
                    sx={{ flex: 1 }}
                  >
                    DOCX
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Şirket Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog && (dialogType === 'add' || dialogType === 'edit')} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Yeni Şirket Ekle' : 'Şirket Düzenle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Logo Upload Alanı */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Şirket Logosu</Typography>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      component="label"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: 32,
                        height: 32
                      }}
                      disabled={logoUploading}
                    >
                      <CameraIcon sx={{ fontSize: 16 }} />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </IconButton>
                  }
                >
                  <Avatar
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'grey.200',
                      border: '2px dashed',
                      borderColor: 'grey.400'
                    }}
                    src={companyForm.logoUrl}
                  >
                    {!companyForm.logoUrl && (
                      logoUploading ? (
                        <LinearProgress sx={{ width: '60%' }} />
                      ) : (
                        companyForm.name ? companyForm.name.charAt(0) : <UploadIcon />
                      )
                    )}
                  </Avatar>
                </Badge>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  JPG, PNG, GIF, WebP<br />
                  Max 5MB
                </Typography>
              </Box>
            </Grid>

            {/* Şirket Bilgileri */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Şirket Adı"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Şehir"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Şirket Türü</InputLabel>
                    <Select
                      value={companyForm.companyType}
                      onChange={(e) => setCompanyForm({ ...companyForm, companyType: e.target.value })}
                      label="Şirket Türü"
                    >
                      {companyTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Diğer Bilgiler */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Resmi Bilgiler" />
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vergi Numarası"
                value={companyForm.taxNumber}
                onChange={(e) => setCompanyForm({ ...companyForm, taxNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vergi Dairesi"
                value={companyForm.taxOffice}
                onChange={(e) => setCompanyForm({ ...companyForm, taxOffice: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="MERSİS Numarası"
                value={companyForm.mersisNumber}
                onChange={(e) => setCompanyForm({ ...companyForm, mersisNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ticaret Sicil Numarası"
                value={companyForm.tradeRegistryNumber}
                onChange={(e) => setCompanyForm({ ...companyForm, tradeRegistryNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Toplam Sermaye"
                value={companyForm.totalCapital}
                onChange={(e) => setCompanyForm({ ...companyForm, totalCapital: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kuruluş Tarihi"
                value={companyForm.foundedDate}
                onChange={(e) => setCompanyForm({ ...companyForm, foundedDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Elektronik Tebligat Adresi"
                value={companyForm.electronicNotificationAddress}
                onChange={(e) => setCompanyForm({ ...companyForm, electronicNotificationAddress: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                multiline
                rows={2}
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} startIcon={<CancelIcon />}>
            İptal
          </Button>
          <Button onClick={handleSaveCompany} variant="contained" startIcon={<SaveIcon />}>
            {dialogType === 'add' ? 'Ekle' : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Şirket Detayları Dialog */}
      <Dialog open={openDialog && dialogType === 'details'} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ mr: 2, width: 40, height: 40 }}
              src={selectedCompany?.logoUrl}
            >
              {!selectedCompany?.logoUrl && selectedCompany?.name?.charAt(0)}
            </Avatar>
            {selectedCompany?.name} - Detaylar
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Genel Bilgiler" />
            <Tab label="Banka Hesapları" />
            <Tab label="Şablon İşlemleri" />
          </Tabs>

          {/* Genel Bilgiler Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Şirket Adı</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Telefon</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Şehir</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.city}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Adres</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.address}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">MERSİS Numarası</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.mersisNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Vergi Dairesi/No</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.taxOffice} / {selectedCompany?.taxNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Ticaret Sicil Numarası</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.tradeRegistryNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Şirket Türü</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.companyType}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Toplam Sermaye</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.totalCapital}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Kuruluş Tarihi</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedCompany?.foundedDate}</Typography>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Banka Hesapları Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Banka Hesapları</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddBankAccount}
              >
                Yeni Hesap Ekle
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Banka</TableCell>
                    <TableCell>Döviz</TableCell>
                    <TableCell>IBAN (Tam)</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bankAccounts.filter(b => b.companyId === selectedCompany?.id).map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <Tooltip title={account.bankName}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {account.bankName}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip label={account.currency} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {account.iban}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditBankAccount(account)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteBankAccount(account.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Şablon İşlemleri Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>Şablon İşlemleri</Typography>
            
            {templateCategories.map((category) => {
              const categoryTemplates = templates.filter(t => t.category === category.value);
              if (categoryTemplates.length === 0) return null;

              return (
                <Accordion key={category.value} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ color: `${category.color}.main`, mr: 2 }}>
                        {category.icon}
                      </Box>
                      <Typography variant="h6">
                        {category.label} ({categoryTemplates.length})
                      </Typography>
                      {category.multiParty && (
                        <Chip 
                          label="Çok Taraflı" 
                          size="small" 
                          color="info" 
                          sx={{ ml: 2 }}
                          icon={<GroupIcon />}
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {categoryTemplates.map((template) => (
                        <Grid item xs={12} sm={6} md={4} key={template.id}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" component="h3" noWrap sx={{ flexGrow: 1 }}>
                                  {template.name}
                                </Typography>
                                {template.isDefault && (
                                  <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} />
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {template.description}
                              </Typography>
                              
                              {/* Dil seçenekleri */}
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                {template.languages.map((lang) => {
                                  const langInfo = languageOptions.find(l => l.value === lang);
                                  return (
                                    <Chip
                                      key={lang}
                                      label={`${langInfo?.flag || ''} ${langInfo?.label || lang}`}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                    />
                                  );
                                })}
                              </Box>

                              {/* Değişkenler */}
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                {template.variables.slice(0, 2).map((variable, index) => (
                                  <Chip
                                    key={index}
                                    label={variable}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                                {template.variables.length > 2 && (
                                  <Chip
                                    label={`+${template.variables.length - 2}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </CardContent>
                            <CardActions>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={template.templateType === 'docx' ? <DocxIcon /> : <PdfIcon />}
                                onClick={() => {
                                  if (template.templateType === 'pdf') {
                                    generatePDF(selectedCompany, template.languages[0] || 'tr');
                                  } else {
                                    generateRealDOCX(selectedCompany, template, template.languages[0] || 'tr');
                                  }
                                }}
                                disabled={docxLoading || pdfLoading}
                                fullWidth
                              >
                                {docxLoading || pdfLoading ? 'Oluşturuluyor...' : 'Oluştur'}
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
            
            {templates.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TemplateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Henüz şablon eklenmemiş
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Şablon ekleyerek özelleştirilmiş belgeler oluşturabilirsiniz
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    resetTemplateForm();
                    setOpenTemplateDialog(true);
                  }}
                >
                  İlk Şablonunuzu Ekleyin
                </Button>
              </Box>
            )}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Şablon Ekleme/Düzenleme Dialog */}
      <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {templateForm.id ? 'Şablon Düzenle' : 'Yeni Şablon Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Şablon Adı"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={templateForm.category}
                  onChange={(e) => {
                    const category = templateCategories.find(c => c.value === e.target.value);
                    setTemplateForm({ 
                      ...templateForm, 
                      category: e.target.value,
                      isMultiParty: category?.multiParty || false
                    });
                  }}
                  label="Kategori"
                >
                  {templateCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ color: `${category.color}.main`, mr: 1 }}>
                          {category.icon}
                        </Box>
                        {category.label}
                        {category.multiParty && (
                          <Chip 
                            label="Çok Taraflı" 
                            size="small" 
                            color="info" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={2}
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={templateForm.isMultiParty}
                    onChange={(e) => setTemplateForm({ ...templateForm, isMultiParty: e.target.checked })}
                  />
                }
                label="Çok Taraflı Belge"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={templateForm.isDefault}
                    onChange={(e) => setTemplateForm({ ...templateForm, isDefault: e.target.checked })}
                  />
                }
                label="Ana Şablon Olarak Ayarla"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Şablon Türü</FormLabel>
                <RadioGroup
                  row
                  value={templateForm.templateType}
                  onChange={(e) => setTemplateForm({ ...templateForm, templateType: e.target.value })}
                >
                  <FormControlLabel value="docx" control={<Radio />} label="DOCX Şablonu" />
                  <FormControlLabel value="pdf" control={<Radio />} label="PDF Şablonu" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Dil seçimi */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Desteklenen Diller</FormLabel>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {languageOptions.map((lang) => (
                    <FormControlLabel
                      key={lang.value}
                      control={
                        <Switch
                          checked={templateForm.languages.includes(lang.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTemplateForm({
                                ...templateForm,
                                languages: [...templateForm.languages, lang.value]
                              });
                            } else {
                              setTemplateForm({
                                ...templateForm,
                                languages: templateForm.languages.filter(l => l !== lang.value)
                              });
                            }
                          }}
                        />
                      }
                      label={`${lang.flag} ${lang.label}`}
                    />
                  ))}
                </Box>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed', borderColor: 'grey.400', borderRadius: 2, p: 3, textAlign: 'center' }}>
                <input
                  type="file"
                  id="template-upload"
                  hidden
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleTemplateUpload}
                />
                <label htmlFor="template-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    disabled={templateUploading}
                  >
                    {templateUploading ? 'Yükleniyor...' : 'Şablon Dosyası Seç'}
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  PDF, Word veya TXT dosyası (Max 10MB)
                </Typography>
                {templateForm.file && (
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    ✓ {templateForm.file.name}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Şablon Değişkenleri (virgülle ayırın)"
                placeholder="{{COMPANY_NAME}}, {{TAX_NUMBER}}, {{ADDRESS}}"
                value={templateForm.variables.join(', ')}
                onChange={(e) => setTemplateForm({ 
                  ...templateForm, 
                  variables: e.target.value.split(',').map(v => v.trim()).filter(v => v) 
                })}
                helperText="Şablonda kullanılacak değişkenleri {{VARIABLE_NAME}} formatında girin"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)} startIcon={<CancelIcon />}>
            İptal
          </Button>
          <Button onClick={handleSaveTemplate} variant="contained" startIcon={<SaveIcon />}>
            {templateForm.id ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Banka Hesabı Ekleme/Düzenleme Dialog */}
      <Dialog open={openBankDialog} onClose={() => setOpenBankDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {bankForm.id ? 'Banka Hesabı Düzenle' : 'Yeni Banka Hesabı Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Banka</InputLabel>
                <Select
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  label="Banka"
                >
                  {turkishBanks.map((bank) => (
                    <MenuItem key={bank} value={bank}>{bank}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Para Birimi</InputLabel>
                <Select
                  value={bankForm.currency}
                  onChange={(e) => setBankForm({ ...bankForm, currency: e.target.value })}
                  label="Para Birimi"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hesap Tipi"
                value={bankForm.accountType}
                onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="IBAN (Tam Numara)"
                value={bankForm.iban}
                onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                placeholder="TR98 0021 2000 0000 0123 4567 89"
                helperText="IBAN numarasını tam olarak girin (boşluklar dahil)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBankDialog(false)} startIcon={<CancelIcon />}>
            İptal
          </Button>
          <Button onClick={handleSaveBankAccount} variant="contained" startIcon={<SaveIcon />}>
            {bankForm.id ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyManagement;

