import { Home, Ticket, Users, FolderKanban, Settings, ChevronRight, ChevronLeft, Calendar, Clock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/use-role';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import TicketService from '@/services/TicketService';

/**
 * Obtiene los items del menú según el rol del usuario
 * @param {number} role - Rol del usuario (1: Técnico, 2: Cliente, 3: Admin)
 * @returns {Array} - Array de items del menú con sus propiedades
 */
const getMenuItems = (role) => {
  const dashboardItem = {
    title: 'Dashboard',
    icon: Home,
    url: '/',
    description: 'Vista general del sistema',
  };

  // Para técnicos (rol 1): Solo sus tickets asignados
  if (role === 1) {
    return [
      dashboardItem,
      {
        title: 'Tickets',
        icon: Ticket,
        url: '/tickets',
        description: 'Mis tickets asignados',
        hasTicketsList: true, // Indicador para mostrar lista de tickets
      },
      {
        title: 'Calendario',
        icon: Calendar,
        url: '/calendar',
        description: 'Tu calendario de trabajo',
      },
    ];
  }

  // Para admins (rol 3): Acceso completo
  if (role === 3) {
    return [
      dashboardItem,
      {
        title: 'Tickets',
        icon: Ticket,
        url: '/tickets',
        description: 'Gestión de tickets',
        hasTicketsList: true, // Indicador para mostrar lista de tickets
      },
      {
        title: 'Técnicos',
        icon: Users,
        url: '/technicians',
        description: 'Personal técnico',
      },
      {
        title: 'Calendario',
        icon: Calendar,
        url: '/calendar',
        description: 'Calendario completo',
      },
      {
        title: 'Categorías',
        icon: FolderKanban,
        url: '/categories',
        description: 'Categorías y etiquetas',
      },
    ];
  }

  // Para clientes (rol 2): Tickets, Calendario
  return [
    dashboardItem,
    {
      title: 'Mis Tickets',
      icon: Ticket,
      url: '/tickets',
      description: 'Mis tickets',
      hasTicketsList: true, // Indicador para mostrar lista de tickets
    },
    {
      title: 'Calendario',
      icon: Calendar,
      url: '/calendar',
      description: 'Mi calendario semanal',
    },
  ];
};

const settingsItem = {
  title: 'Configuración',
  icon: Settings,
  url: '/settings',
  description: 'Ajustes del sistema',
};

/**
 * Obtiene las clases CSS de color según el estado del ticket
 * @param {string} state - Estado del ticket (Pendiente, Asignado, En Proceso, Resuelto, Cerrado)
 * @returns {string} - Clases CSS para el badge del estado
 */
const getStateColor = (state) => {
  const colors = {
    'Pendiente': 'bg-red-500/10 text-red-600 border-red-500/20',
    'Asignado': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    'En Proceso': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Resuelto': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Cerrado': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return colors[state] || 'bg-muted text-muted-foreground';
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open, toggleSidebar } = useSidebar();
  const { role } = useRole();
  const [ticketsMenuOpen, setTicketsMenuOpen] = useState(false);
  const [recentTickets, setRecentTickets] = useState([]);

  const menuItems = getMenuItems(role);

  /**
   * Carga los tickets recientes del sidebar según el rol del usuario
   * Se ejecuta cuando el sidebar se abre
   * - Técnico: Solo tickets asignados a él
   * - Cliente: Solo sus propios tickets
   * - Admin: Todos los tickets
   * Limita los resultados a los 10 tickets más recientes
   */
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await TicketService.getTickets();
        if (response.data.success) {
          let allTickets = response.data.data;
          const technicianId = import.meta.env.VITE_TECHNICIAN_ID;
          const userId = import.meta.env.VITE_USER_ID;
          
          // Filtrar según el rol
          if (role === 1) {
            // Técnicos: solo sus tickets asignados
            allTickets = allTickets.filter(
              ticket => parseInt(ticket.Assign?.Technician?.idTechnician) === parseInt(technicianId)
            );
          } else if (role === 2) {
            // Clientes: solo sus propios tickets
            allTickets = allTickets.filter(
              ticket => parseInt(ticket.User?.idUser) === parseInt(userId)
            );
          }
          // Admin (role 3): todos los tickets
          
          // Limitar a los últimos 10 tickets
          const recent = allTickets.slice(0, 10);
          setRecentTickets(recent);
        }
      } catch (error) {
        console.error('Error loading tickets:', error);
      }
    };
    
    if (open) {
      loadTickets();
    }
  }, [open, role]);

  // Cerrar el menú de tickets cuando el sidebar se colapsa
  useEffect(() => {
    if (!open) {
      setTicketsMenuOpen(false);
    }
  }, [open]);

  /**
   * Abre automáticamente el acordeón de tickets cuando se navega a /tickets
   * y el sidebar está abierto
   */
  useEffect(() => {
    if (open && location.pathname.startsWith('/tickets')) {
      setTicketsMenuOpen(true);
    }
  }, [location.pathname, open]);

  /**
   * Maneja el clic en un ticket del acordeón del sidebar
   * Navega a la página de tickets sin parámetros adicionales
   */
  const handleTicketClick = () => {
    navigate(`/tickets`);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-surface group/sidebar relative fixed left-0 top-0 h-screen">
      {/* Logo Container - Se muestra cuando el sidebar está abierto */}
      <div className="h-[100px] border-b border-border/50 flex items-center justify-center px-4 overflow-hidden">
        <Link 
          to="/" 
          className={cn(
            "flex items-center group transition-all duration-300 ease-in-out",
            open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          <img 
            src="/vault-tec-logo.svg" 
            alt="Vault-Tec Logo" 
            className="h-[80px] w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>
      </div>
      
      {/* Toggle Button - Estilo GitHub */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-50 h-10 w-6 p-0 rounded-l-none rounded-r-md shadow-sm"
            >
              {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{open ? 'Collapse' : 'Expand'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SidebarContent className="px-3 py-1">
        {/* Main Navigation */}
        <SidebarGroup className="group-data-[collapsible=icon]:items-center pl-3">
          <SidebarGroupLabel className="px-3 mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
            <SidebarMenu className="space-y-2 group-data-[collapsible=icon]:space-y-3">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                
                // Si tiene lista de tickets, mostrar acordeón con tickets
                if (item.hasTicketsList) {
                  return (
                    <Collapsible 
                      key={item.title} 
                      asChild 
                      open={ticketsMenuOpen}
                      onOpenChange={(isOpen) => {
                        // Solo permitir cambios si el sidebar está abierto
                        if (open) {
                          setTicketsMenuOpen(isOpen);
                        }
                      }}
                    >
                      <SidebarMenuItem>
                        {open ? (
                          <div className={`h-10 px-3 rounded-lg transition-all duration-200 flex items-center ${
                            isActive 
                              ? 'bg-primary/10 text-primary hover:bg-primary/15 shadow-sm' 
                              : 'hover:bg-muted/80'
                          }`}>
                            {/* Link que lleva a /tickets */}
                            <Link to={item.url} className="flex items-center flex-1 min-w-0">
                              <item.icon className="w-4 h-4 shrink-0 mr-3" />
                              <span className="font-medium text-sm flex-1">{item.title}</span>
                            </Link>
                            {/* Botón del acordeón separado */}
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 hover:bg-transparent shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <ChevronRight className={cn(
                                  "w-4 h-4 transition-transform duration-200",
                                  ticketsMenuOpen && "rotate-90"
                                )} />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            className={`h-10 px-3 rounded-lg transition-all duration-200 group flex items-center ${
                              isActive 
                                ? 'bg-primary/10 text-primary hover:bg-primary/15 shadow-sm' 
                                : 'hover:bg-muted/80'
                            }`}
                          >
                            <Link to={item.url}>
                              <item.icon className="w-4 h-4 shrink-0 mr-3" />
                            </Link>
                          </SidebarMenuButton>
                        )}
                        <CollapsibleContent className="mt-2">
                          <SidebarMenuSub className="ml-8 space-y-1">
                            {/* Lista de tickets con scroll */}
                            <div className="max-h-[320px] overflow-y-auto pr-2 space-y-2 subtle-scroll">
                              {recentTickets.length > 0 ? (
                                recentTickets.map((ticket) => (
                                  <button
                                    key={ticket.idTicket}
                                    onClick={() => handleTicketClick(ticket.idTicket)}
                                    className="w-full text-left p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group"
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <Badge variant="outline" className="text-[10px] font-mono">
                                        #{ticket.idTicket}
                                      </Badge>
                                      <Badge className={cn("text-[10px]", getStateColor(ticket.State))}>
                                        {ticket.State}
                                      </Badge>
                                    </div>
                                    {/*<p className="text-xs font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                      {ticket.Title}
                                    </p>*/}
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {new Date(ticket.CreationDate).toLocaleDateString('es-ES', {
                                          day: '2-digit',
                                          month: 'short'
                                        })}
                                      </span>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="text-xs text-muted-foreground text-center py-4">
                                  No hay tickets disponibles
                                </div>
                              )}
                            </div>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`h-10 px-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/10 text-primary hover:bg-primary/15 shadow-sm' 
                          : 'hover:bg-muted/80'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center">
                        <item.icon className="w-4 h-4 shrink-0 mr-3" />
                        <span className="font-medium text-sm flex-1">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        {/* Settings Section */}
        <SidebarGroup className="group-data-[collapsible=icon]:items-center pl-3">
          <SidebarGroupLabel className="px-3 mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
            <SidebarMenu className="space-y-2 group-data-[collapsible=icon]:space-y-3">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={settingsItem.title}
                  className={`h-10 px-3 rounded-lg transition-all duration-200 ${
                    location.pathname === settingsItem.url
                      ? 'bg-primary/10 text-primary hover:bg-primary/15 shadow-sm' 
                      : 'hover:bg-muted/80'
                  }`}
                >
                  <Link to={settingsItem.url} className="flex items-center">
                    <settingsItem.icon className="w-6 h-6 shrink-0 mr-3" />
                    <span className="font-medium text-sm flex-1">{settingsItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
