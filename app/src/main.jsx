import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Layout } from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import { PageNotFound } from './components/Home/PageNotFound';
import TicketList from './components/Tickets/TicketList';
import TechnicianList from './components/Technicians/TechnicianList';
import CalendarView from './components/Calendar/CalendarView';

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
      { path: "assignments", element: <div className="p-8 text-center"><h2 className="text-2xl font-bold">Vista de Asignaciones - En construcción</h2></div> },
      // Técnicos (solo admins)
      { path: "technicians", element: <TechnicianList /> },
      // Calendario (semanal para clientes, mensual para admins/técnicos)
      { path: "calendar", element: <CalendarView /> },
      // Categorías
      { path: "categories", element: <div className="p-8 text-center"><h2 className="text-2xl font-bold">Lista de Categorías - En construcción</h2></div> },
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
      <RouterProvider router={rutas} />
    </UserProvider>
  </StrictMode>
);


