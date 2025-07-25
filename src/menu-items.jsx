// assets
import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import ChromeReaderModeOutlinedIcon from '@mui/icons-material/ChromeReaderModeOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import FormatColorTextOutlinedIcon from '@mui/icons-material/FormatColorTextOutlined';

// Request & Management Icons
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const icons = {
  NavigationOutlinedIcon: NavigationOutlinedIcon,
  HomeOutlinedIcon: HomeOutlinedIcon,
  ChromeReaderModeOutlinedIcon: ChromeReaderModeOutlinedIcon,
  HelpOutlineOutlinedIcon: HelpOutlineOutlinedIcon,
  SecurityOutlinedIcon: SecurityOutlinedIcon,
  AccountTreeOutlinedIcon: AccountTreeOutlinedIcon,
  BlockOutlinedIcon: BlockOutlinedIcon,
  AppsOutlinedIcon: AppsOutlinedIcon,
  ContactSupportOutlinedIcon: ContactSupportOutlinedIcon,
  FormatColorTextOutlinedIcon: FormatColorTextOutlinedIcon,
  
  // Request & Management Icons
  IconAdd: AddIcon,
  IconList: ListIcon,
  IconClock: AccessTimeIcon,
  IconCheck: CheckCircleIcon,
  IconShoppingCart: ShoppingCartIcon,
  IconChart: AssessmentIcon,
  IconBusiness: BusinessIcon,
  IconPeople: PeopleIcon,
  IconUpload: CloudUploadIcon
};

// ==============================|| MENU ITEMS ||============================== //

export default {
  items: [
    {
      id: 'dashboard',
      title: 'Ana Sayfa',
      type: 'group',
      children: [
        {
          id: 'default',
          title: 'Dashboard',
          type: 'item',
          url: '/dashboard/default',
          icon: icons.HomeOutlinedIcon,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'requests',
      title: 'Talepler',
      type: 'group',
      children: [
        {
          id: 'unified-request',
          title: 'Talep Oluştur',
          type: 'item',
          url: '/requests/unified',
          icon: icons.IconUpload,
          breadcrumbs: false
        },
        {
          id: 'new-request',
          title: 'Basit Talep',
          type: 'item',
          url: '/requests/new',
          icon: icons.IconAdd,
          breadcrumbs: false
        },
        {
          id: 'request-list',
          title: 'Talep Listesi',
          type: 'item',
          url: '/requests/list',
          icon: icons.IconList,
          breadcrumbs: false
        },
        {
          id: 'pending-requests',
          title: 'Bekleyen Talepler',
          type: 'item',
          url: '/requests/pending',
          icon: icons.IconClock,
          breadcrumbs: false
        },
        {
          id: 'approved-requests',
          title: 'Onaylanan Talepler',
          type: 'item',
          url: '/requests/approved',
          icon: icons.IconCheck,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'procurement',
      title: 'Satınalma',
      type: 'group',
      children: [
        {
          id: 'quotation-comparison',
          title: 'Teklif Karşılaştırma',
          type: 'item',
          url: '/procurement/quotations',
          icon: icons.IconChart,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'management',
      title: 'Yönetim',
      type: 'group',
      children: [
        {
          id: 'company-management',
          title: 'Şirket Yönetimi',
          type: 'item',
          url: '/admin/company-management',
          icon: icons.IconBusiness,
          breadcrumbs: false
        },
        {
          id: 'user-management',
          title: 'Kullanıcı Yönetimi',
          type: 'item',
          url: '/admin/user-management',
          icon: icons.IconPeople,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'original-pages',
      title: 'Orijinal Sayfalar',
      type: 'group',
      children: [
        {
          id: 'sample-page',
          title: 'Sample Page',
          type: 'item',
          url: '/sample-page',
          icon: icons.ChromeReaderModeOutlinedIcon,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'utils',
      title: 'Utils',
      type: 'group',
      children: [
        {
          id: 'util-typography',
          title: 'Typography',
          type: 'item',
          url: '/utils/util-typography',
          icon: icons.FormatColorTextOutlinedIcon,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      type: 'group',
      children: [
        {
          id: 'documentation',
          title: 'Documentation',
          type: 'item',
          url: 'https://codedthemes.gitbook.io/materially-react-material-documentation/',
          icon: icons.HelpOutlineOutlinedIcon,
          external: true,
          target: true,
          breadcrumbs: false
        }
      ]
    }
  ]
};

