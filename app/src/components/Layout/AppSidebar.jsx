import { Home, Ticket, Users, FolderKanban, Settings, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Función para obtener los items del menú según el rol
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
        items: [
          { title: 'Todos los Tickets', url: '/tickets', description: 'Ver todos' },
          { title: 'Tickets Asignados', url: '/tickets/assigned', description: 'Tickets asignados a técnicos' },
        ],
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
      title: 'Tickets',
      icon: Ticket,
      url: '/tickets',
      description: 'Gestión de tickets',
      items: [
        { title: 'Todos los Tickets', url: '/tickets', description: 'Ver todos' },
        { title: 'Mis Tickets', url: '/tickets/my', description: 'Mis tickets' },
      ],
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
  const { role } = useRole();
  const [ticketsMenuOpen, setTicketsMenuOpen] = useState(false);

  const menuItems = getMenuItems(role);

  // Cerrar el menú de tickets cuando el sidebar se colapsa
  useEffect(() => {
    if (!open) {
      setTicketsMenuOpen(false);
    }
  }, [open]);

  // Abrir el menú de tickets si estamos en una ruta de tickets y el sidebar está abierto
  useEffect(() => {
    if (open && location.pathname.startsWith('/tickets')) {
      setTicketsMenuOpen(true);
    }
  }, [location.pathname, open]);

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
                
                if (item.items) {
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
                        <CollapsibleTrigger asChild>
                          {open ? (
                            <SidebarMenuButton
                              tooltip={item.title}
                              className={`h-10 px-3 rounded-lg transition-all duration-200 group flex items-center ${
                                isActive 
                                  ? 'bg-primary/10 text-primary hover:bg-primary/15 shadow-sm' 
                                  : 'hover:bg-muted/80'
                              }`}
                            >
                              <item.icon className="w-6 h-6 shrink-0 mr-3" />
                              <span className="font-medium text-sm flex-1">{item.title}</span>
                              <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            </SidebarMenuButton>
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
                                <item.icon className="w-6 h-6 shrink-0 mr-3" />
                              </Link>
                            </SidebarMenuButton>
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <SidebarMenuSub className="ml-8 space-y-1">
                            {item.items.map((subItem) => {
                              const isSubActive = location.pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    className={`h-8 px-3 rounded-md transition-all duration-200 ${
                                      isSubActive 
                                        ? 'bg-accent/10 text-accent hover:bg-accent/15' 
                                        : 'hover:bg-muted/60'
                                    }`}
                                  >
                                    <Link to={subItem.url} className="flex items-center">
                                      <span className="text-sm">{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
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
                        <item.icon className="w-6 h-6 shrink-0 mr-3" />
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
