import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n'; // Importar configuración de i18n
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
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

const rutas = createBrowserRouter([
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
      // Técnicos (solo admins)
      { path: "technicians", element: <TechnicianList /> },
      { path: "technicians/create", element: <UpkeepTechnician /> },
      { path: "technicians/edit/:id", element: <UpkeepTechnician /> },
      // Calendario (semanal para clientes, mensual para admins/técnicos)
      { path: "calendar", element: <CalendarView /> },
      // Categorías (solo admins)
      { path: "categories", element: <CategoryList /> },
      { path: "categories/create", element: <UpkeepCategory /> },
      { path: "categories/edit/:id", element: <UpkeepCategory /> },
      // Notificaciones
      { path: "notifications", element: <NotificationList /> },
      // Configuración
      { path: "settings", element: <div className="p-8 text-center"><h2 className="text-2xl font-bold">Configuración - En construcción</h2></div> },
      // Ruta comodín (404)
      { path: '*', element: <PageNotFound /> },
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


