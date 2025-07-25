import { lazy } from 'react';
import Loadable from '../component/Loadable';
import MainLayout from '../layout/MainLayout';

// -- DİKKAT: Senin dosya yapına birebir uygun importlar --
const Dashboard = Loadable(lazy(() => import('views/Dashboard/default')));
const Requests = Loadable(lazy(() => import('views/Requests/UnifiedRequestSystem')));
const Procurement = Loadable(lazy(() => import('views/Procurement/index')));
const Admin = Loadable(lazy(() => import('views/Admin/index')));
const Profile = Loadable(lazy(() => import('views/Profile/index')));
const Settings = Loadable(lazy(() => import('views/Settings/index')));
const Messages = Loadable(lazy(() => import('views/Messages/index')));
const Calendar = Loadable(lazy(() => import('views/Utils/Calendar/index')));
const NotFound = Loadable(lazy(() => import('views/Utils/NotFound/index')));
const UnderConstruction = Loadable(lazy(() => import('views/Utils/UnderConstruction/index')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    { path: '', element: <Dashboard /> },
    { path: 'dashboard', element: <Dashboard /> },
    { path: 'requests/*', element: <Requests /> },
    { path: 'procurement/*', element: <Procurement /> },
    { path: 'admin/*', element: <Admin /> },
    { path: 'profile', element: <Profile /> },
    { path: 'settings', element: <Settings /> },
    { path: 'messages', element: <Messages /> },
    { path: 'calendar', element: <Calendar /> },
    { path: 'under-construction', element: <UnderConstruction /> },
    { path: '*', element: <NotFound /> }
  ]
};

export default MainRoutes;
