// assets
import {
  IconDashboard,
  IconDeviceAnalytics,
  IconUserCheck,
  IconFileInvoice,
  IconBuildingStore,
  IconSettings,
  IconListCheck,
  IconClockHour4,
  IconCircleCheck
} from '@tabler/icons-react';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'group',
      children: [
        {
          id: 'dash-default',
          title: 'Genel Bakış',
          type: 'item',
          url: '/dashboard/default',
          icon: IconDashboard,
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
          id: 'create-request',
          title: 'Talep Oluştur',
          type: 'item',
          url: '/requests/unified',
          icon: IconFileInvoice
        },
        {
          id: 'request-list',
          title: 'Talep Listesi',
          type: 'item',
          url: '/requests/list',
          icon: IconListCheck
        },
        {
          id: 'pending-requests',
          title: 'Onay Bekleyenler',
          type: 'item',
          url: '/requests/pending',
          icon: IconClockHour4
        },
        {
          id: 'approved-requests',
          title: 'Onaylanmış Talepler',
          type: 'item',
          url: '/requests/approved',
          icon: IconCircleCheck
        }
      ]
    },
    {
      id: 'procurement',
      title: 'Satınalma',
      type: 'group',
      children: [
        {
          id: 'procurement-panel',
          title: 'Satınalma Paneli', // DÜZELTME: İsim güncellendi
          type: 'item',
          url: '/procurement/quotations',
          icon: IconDeviceAnalytics
        }
      ]
    },
    {
      id: 'admin',
      title: 'Yönetim',
      type: 'group',
      children: [
        {
          id: 'user-management',
          title: 'Kullanıcı Yönetimi',
          type: 'item',
          url: '/admin/user-management',
          icon: IconUserCheck
        },
        {
          id: 'company-management',
          title: 'Şirket Yönetimi',
          type: 'item',
          url: '/admin/company-management',
          icon: IconBuildingStore
        }
      ]
    },
    {
      id: 'settings',
      title: 'Ayarlar',
      type: 'group',
      children: [
        {
          id: 'app-settings',
          title: 'Uygulama Ayarları',
          type: 'item',
          url: '/settings',
          icon: IconSettings
        }
      ]
    }
  ]
};

export default menuItems;
