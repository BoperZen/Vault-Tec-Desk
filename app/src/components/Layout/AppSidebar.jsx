import { Home, Ticket, Users, FolderKanban, Settings, ChevronRight, ChevronLeft, Calendar, Calendar1, Calendar1Icon, TicketCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

export function AppSidebar() {
  const location = useLocation();
  const { open, toggleSidebar } = useSidebar();
  const { role, isLoadingRole } = useRole();

  const menuItems = getMenuItems(role);

  /**
   * Carga los tickets recientes del sidebar según el rol del usuario
   * Se ejecuta cuando el sidebar se abre
   * - Técnico: Solo tickets asignados a él
   * - Cliente: Solo sus propios tickets
   * - Admin: Todos los tickets
   * Limita los resultados a los 10 tickets más recientes
   */
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
            {isLoadingRole ? (
              <div className="text-xs text-muted-foreground px-3 py-2">Cargando navegación...</div>
            ) : (
              <SidebarMenu className="space-y-2 group-data-[collapsible=icon]:space-y-3">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.url;
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
            )}
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
