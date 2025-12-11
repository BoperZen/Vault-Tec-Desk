import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n'; // Importar configuración de i18n
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { SystemNotificationProvider } from './context/SystemNotificationContext';
import { Layout } from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import { PageNotFound } from './components/Home/PageNotFound';
import TicketList from './components/Tickets/TicketList';
import UpkeepTicket from './components/Tickets/UpkeepTicket';
import TechnicianList from './components/Technicians/TechnicianList';
import UpkeepTechnician from './components/Technicians/UpkeepTechnician';
import CalendarView from './components/Calendar/CalendarView';
import CategoryList from './components/Categories/CategoryList';
import UpkeepCategory from './components/Categories/UpkeepCategory';
import NotificationList from './components/Notifications/NotificationList';
import AuthPanel from './components/Auth/AuthPanel';
import UserList from './components/Users/UserList';
import UpkeepUser from './components/Users/UpkeepUser';
import ProfilePage from './components/Profile/ProfilePage';
import SettingsPage from './components/Settings/SettingsPage';

/**
 * Componente para proteger rutas que requieren autenticación
 */
const ProtectedRoute = () => {
  const { isAuthenticated, authLoading } = useUser();
  
  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si está autenticado, mostrar el contenido
  return <Outlet />;
};

/**
 * Componente para proteger rutas que requieren rol de administrador
 */
const AdminRoute = () => {
  const { currentUser, isAuthenticated, authLoading } = useUser();
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Solo admins (rol 3) pueden acceder
  if (currentUser?.idRol !== 3) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

/**
 * Componente para rutas públicas (login/registro)
 * Redirige al dashboard si ya está autenticado
 */
const PublicRoute = () => {
  const { isAuthenticated, authLoading } = useUser();
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

const rutas = createBrowserRouter([
  // Rutas públicas (login/registro)
  {
    element: <PublicRoute />,
    children: [
      { path: "login", element: <AuthPanel /> },
    ],
  },
  // Rutas protegidas (requieren autenticación)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          // Ruta principal
          { index: true, element: <Dashboard /> },
          // Tickets
          { path: "tickets", element: <TicketList /> },
          { path: "tickets/my", element: <TicketList /> },
          { path: "tickets/assigned", element: <TicketList /> },
          { path: "tickets/create", element: <UpkeepTicket /> },
          { path: "assignments", element: <div className="p-8 text-center"><h2 className="text-2xl font-bold">Vista de Asignaciones - En construcción</h2></div> },
          // Calendario (semanal para clientes, mensual para admins/técnicos)
          { path: "calendar", element: <CalendarView /> },
          // Notificaciones
          { path: "notifications", element: <NotificationList /> },
          // Perfil
          { path: "profile", element: <ProfilePage /> },
          // Configuración
          { path: "settings", element: <SettingsPage /> },
          // Ruta comodín (404)
          { path: '*', element: <PageNotFound /> },
        ],
      },
    ],
  },
  // Rutas de administrador (requieren rol admin)
  {
    element: <AdminRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          // Técnicos (solo admins)
          { path: "technicians", element: <TechnicianList /> },
          { path: "technicians/create", element: <UpkeepTechnician /> },
          { path: "technicians/edit/:id", element: <UpkeepTechnician /> },
          // Categorías (solo admins)
          { path: "categories", element: <CategoryList /> },
          { path: "categories/create", element: <UpkeepCategory /> },
          { path: "categories/edit/:id", element: <UpkeepCategory /> },
          // Usuarios (solo admins)
          { path: "users", element: <UserList /> },
          { path: "users/create", element: <UpkeepUser /> },
          { path: "users/edit/:id", element: <UpkeepUser /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <SystemNotificationProvider>
        <RouterProvider router={rutas} />
      </SystemNotificationProvider>
    </UserProvider>
  </StrictMode>
);


