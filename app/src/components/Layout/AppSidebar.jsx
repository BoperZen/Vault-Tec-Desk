import { Home, Ticket, Users, FolderKanban, Settings, ChevronRight, ChevronLeft, Calendar, User, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRole } from '@/hooks/use-role';
import { useFullscreen } from '@/context/FullscreenContext';
import { useUser } from '@/context/UserContext';
import { useSystemNotifications } from '@/context/SystemNotificationContext';
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
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Obtiene los items del menú según el rol del usuario
 * @param {number} role - Rol del usuario (1: Técnico, 2: Cliente, 3: Admin)
 * @param {function} t - Función de traducción
 * @returns {Array} - Array de items del menú con sus propiedades
 */
const getMenuItems = (role, t) => {
  const dashboardItem = {
    title: t('navigation.dashboard'),
    icon: Home,
    url: '/',
    description: t('sidebar.descriptions.dashboard'),
  };

  // Para técnicos (rol 1): Solo sus tickets asignados
  if (role === 1) {
    return [
      dashboardItem,
      {
        title: t('navigation.tickets'),
        icon: Ticket,
        url: '/tickets',
        description: t('sidebar.descriptions.assignedTickets'),
      },
      {
        title: t('navigation.calendar'),
        icon: Calendar,
        url: '/calendar',
        description: t('sidebar.descriptions.calendarWork'),
      },
      {
        title: t('navigation.notifications'),
        icon: Bell,
        url: '/notifications',
        description: t('sidebar.descriptions.myNotifications'),
      },
    ];
  }

  // Para admins (rol 3): Acceso completo
  if (role === 3) {
    return [
      dashboardItem,
      {
        title: t('navigation.tickets'),
        icon: Ticket,
        url: '/tickets',
        description: t('sidebar.descriptions.tickets'),
      },
      {
        title: t('navigation.technicians'),
        icon: Users,
        url: '/technicians',
        description: t('sidebar.descriptions.technicians'),
      },
      {
        title: t('navigation.calendar'),
        icon: Calendar,
        url: '/calendar',
        description: t('sidebar.descriptions.calendar'),
      },
      {
        title: t('navigation.categories'),
        icon: FolderKanban,
        url: '/categories',
        description: t('sidebar.descriptions.categories'),
      },
      {
        title: t('navigation.notifications'),
        icon: Bell,
        url: '/notifications',
        description: t('sidebar.descriptions.notifications'),
      },
    ];
  }

  // Para clientes (rol 2): Tickets, Calendario
  return [
    dashboardItem,
    {
      title: t('navigation.myTickets'),
      icon: Ticket,
      url: '/tickets',
      description: t('sidebar.descriptions.myTickets'),
    },
    {
      title: t('navigation.calendar'),
      icon: Calendar,
      url: '/calendar',
      description: t('sidebar.descriptions.calendarWeekly'),
    },
    {
      title: t('navigation.notifications'),
      icon: Bell,
      url: '/notifications',
      description: t('sidebar.descriptions.myNotifications'),
    },
  ];
};

const getSettingsItem = (t) => ({
  title: t('navigation.settings'),
  icon: Settings,
  url: '/settings',
  description: t('sidebar.descriptions.settings'),
});

export function AppSidebar() {
  const location = useLocation();
  const { t } = useTranslation();
  const { open, toggleSidebar } = useSidebar();
  const { role, isLoadingRole } = useRole();
  const { isFullscreen } = useFullscreen();
  const { currentUser } = useUser();
  const { unreadCount } = useSystemNotifications();

  const menuItems = getMenuItems(role, t);
  const settingsItem = getSettingsItem(t);

  /**
   * Carga los tickets recientes del sidebar según el rol del usuario
   * Se ejecuta cuando el sidebar se abre
   * - Técnico: Solo tickets asignados a él
   * - Cliente: Solo sus propios tickets
   * - Admin: Todos los tickets
   * Limita los resultados a los 10 tickets más recientes
   */
  return (
    <Sidebar collapsible="icon" className={cn(
      "border-r border-border/50 bg-surface group/sidebar relative fixed left-0 top-0 transition-all duration-300",
      isFullscreen ? "h-[calc(100vh-16px)] mt-2 rounded-tl-lg" : "h-screen"
    )}>
      {/* Logo Container - Se muestra cuando el sidebar está abierto */}
      <div 
        className={cn(
          "border-b border-border/50 flex items-center justify-center px-4 overflow-hidden transition-all duration-300",
          isFullscreen ? "h-[100px] pt-2" : "h-[100px]"
        )}
      >
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
            <p>{open ? t('sidebar.collapse') : t('sidebar.expand')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SidebarContent className="px-3 py-1 flex flex-col">
        {/* Main Navigation */}
        <SidebarGroup className="group-data-[collapsible=icon]:items-center pl-3">
          <SidebarGroupLabel className="px-3 mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {t('navigation.navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
            {isLoadingRole ? (
              <div className="text-xs text-muted-foreground px-3 py-2">{t('navigation.loadingNavigation')}</div>
            ) : (
              <SidebarMenu className="space-y-2 group-data-[collapsible=icon]:space-y-3">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  const isNotification = item.url === '/notifications';
                  const showBadge = isNotification && unreadCount > 0;
                  
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
                          <div className="relative">
                            <item.icon className="w-4 h-4 shrink-0 mr-3" />
                            {showBadge && !open && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
                            )}
                          </div>
                          <span className="font-medium text-sm flex-1">{item.title}</span>
                          {showBadge && open && (
                            <Badge 
                              variant="destructive" 
                              className="ml-auto h-5 min-w-[20px] px-1.5 text-xs font-medium"
                            >
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
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
            {t('navigation.system')}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Card at Bottom */}
        <div className="border-t border-border/50 h-[36px] flex items-center px-4 transition-all duration-500 ease-in-out">
          <div className={cn(
            "flex items-center rounded-md hover:bg-muted/50 transition-all duration-300 cursor-pointer",
            open ? "gap-2.5 px-1" : "justify-center w-full"
          )}>
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className={cn(
              "text-xs font-medium truncate transition-all duration-300 ease-in-out whitespace-nowrap",
              open ? "opacity-100 max-w-[180px]" : "opacity-0 max-w-0 overflow-hidden"
            )}>
              {currentUser?.username || 'Usuario'}
            </span>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
