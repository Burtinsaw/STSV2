import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

// AUTH CONTEXT
import UserManagement from 'views/admin/UserManagement';
import { useAuth } from 'contexts/AuthContext';

// --- View importları ---

// Dashboard
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// Auth Pages
const ChangePassword = Loadable(lazy(() => import('views/ChangePassword')));

// Request Pages
const UnifiedRequestSystem = Loadable(lazy(() => import('views/requests/UnifiedRequestSystem')));
const RequestList = Loadable(lazy(() => import('views/requests/RequestList')));
const PendingRequests = Loadable(lazy(() => import('views/requests/PendingRequests')));
const ApprovedRequests = Loadable(lazy(() => import('views/requests/ApprovedRequests')));
const RequestDetail = Loadable(lazy(() => import('@/views/Requests/RequestDetail')));

// Procurement Pages - YENİ YAPI
const QuotationComparison = Loadable(lazy(() => import('views/procurement/QuotationComparison')));
const OfferManagement = Loadable(lazy(() => import('views/procurement/OfferManagement'))); // Yeni teklif yönetim sayfası

// Company Management
const CompanyManagement = Loadable(lazy(() => import('views/admin/CompanyManagement')));

// Settings & Profile
const Settings = Loadable(lazy(() => import('views/Settings')));
const Profile = Loadable(lazy(() => import('views/Profile')));
const Messages = Loadable(lazy(() => import('views/Messages')));

// PROTECTED LAYOUT
const ProtectedLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) { return <div>Yükleniyor...</div>; }
  if (!isAuthenticated) { return <Navigate to="/login" replace />; }
  return <MainLayout />;
};

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  element: <ProtectedLayout />,
  children: [
    { path: '/', element: <DashboardDefault /> },
    { path: 'dashboard/default', element: <DashboardDefault /> },
    
    // Auth Routes
    { path: 'first-login', element: <ChangePassword isFirstLogin={true} /> },
    
    // Request Routes
    { path: 'requests/unified', element: <UnifiedRequestSystem /> },
    { path: 'requests/list', element: <RequestList /> },
    { path: 'requests/pending', element: <PendingRequests /> },
    { path: 'requests/approved', element: <ApprovedRequests /> },
    { path: 'requests/detail/:id', element: <RequestDetail /> },
    
    // Procurement Routes - GÜNCELLENMİŞ YAPI
    { path: 'procurement/quotations', element: <QuotationComparison /> },
    { path: 'procurement/manage/:id', element: <OfferManagement /> }, // Yeni route
    
    // Admin Routes
    { path: 'admin/user-management', element: <UserManagement /> },
    { path: 'admin/company-management', element: <CompanyManagement /> },
    { path: 'settings', element: <Settings /> },
    { path: 'profile', element: <Profile /> },
    { path: 'messages', element: <Messages /> },
  ]
};

export default MainRoutes;
