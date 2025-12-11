import { Bell, Maximize, Minimize, User, Settings, LogOut, RefreshCw, UserPlus, ArrowRightLeft, Ticket, CheckCircle, ExternalLink, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useSystemNotifications } from '@/context/SystemNotificationContext';
import { useSidebar } from '@/components/ui/sidebar';
import { useFullscreen } from '@/context/FullscreenContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Estados de lectura (de la tabla state)
const STATE_READ = 6;    // Leído
const STATE_UNREAD = 7;  // Sin leer

// Helper para verificar si está leída (comparar como number)
const isRead = (notification) => parseInt(notification.idState) === STATE_READ;

// Formatear tiempo relativo
const formatRelativeTime = (dateString, t) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('notifications.time.now');
  if (diffMins < 60) return t('notifications.time.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('notifications.time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('notifications.time.daysAgo', { count: diffDays });
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
};

// Configuración de iconos y colores por tipo de evento
const getNotificationStyle = (event) => {
  const eventLower = (event || '').toLowerCase();
  
  if (eventLower.includes('asignado') || eventLower.includes('ticket asignado')) {
    return {
      icon: UserPlus,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      borderColor: 'border-l-blue-500'
    };
  }
  if (eventLower.includes('técnico asignado') || eventLower.includes('tecnico asignado')) {
    return {
      icon: UserPlus,
      bgColor: 'bg-indigo-500/10',
      iconColor: 'text-indigo-500',
      borderColor: 'border-l-indigo-500'
    };
  }
  if (eventLower.includes('cambio de estado') || eventLower.includes('estado')) {
    return {
      icon: ArrowRightLeft,
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      borderColor: 'border-l-amber-500'
    };
  }
  if (eventLower.includes('creado') || eventLower.includes('ticket creado')) {
    return {
      icon: Ticket,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      borderColor: 'border-l-green-500'
    };
  }
  if (eventLower.includes('cerrado') || eventLower.includes('resuelto')) {
    return {
      icon: CheckCircle,
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      borderColor: 'border-l-emerald-500'
    };
  }
  // Default
  return {
    icon: Bell,
    bgColor: 'bg-muted/50',
    iconColor: 'text-muted-foreground',
    borderColor: 'border-l-muted-foreground'
  };
};

export default function Header() {
  const { currentUser, logout } = useUser();
  const { open } = useSidebar();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    refresh 
  } = useSystemNotifications();
  
  const visibleNotifications = notifications.slice(0, 6);

  // Cambiar idioma
  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navegar a la página de notificaciones con el ID seleccionado
  const handleNotificationClick = (notification) => {
    navigate(`/notifications?id=${notification.idNotification}`);
  };

  return (
    <header 
      className={cn(
        "fixed right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        isFullscreen ? "top-2 rounded-tr-lg" : "top-0"
      )} 
      style={{ left: open ? '20rem' : '5rem' }}
    >
      <div className={cn(
        "flex items-center px-6 gap-4 justify-between transition-all duration-300",
        "h-[100px]"
      )}>
        {/* Logo - Se oculta cuando el sidebar está abierto */}
        <Link 
          to="/" 
          className={cn(
            "flex items-center group transition-all duration-300 ease-in-out",
            open ? "opacity-0 scale-95 pointer-events-none absolute" : "opacity-100 scale-100"
          )}
        >
          <img 
            src="/vault-tec-logo.svg" 
            alt="Vault-Tec Logo" 
            className="h-[80px] w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <TooltipProvider delayDuration={300}>
            {/* Fullscreen Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isFullscreen ? t('header.exitFullscreen') : t('header.fullscreen')}</p>
              </TooltipContent>
            </Tooltip>

            {/* Language Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLanguage}
                  className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{i18n.language === 'es' ? 'English' : 'Español'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{t('header.notifications')}</h4>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <span className="text-xs text-muted-foreground">{unreadCount} {t('header.unread')}</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={refresh}
                        disabled={isLoading}
                      >
                        <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {isLoading && notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <RefreshCw className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2 animate-spin" />
                      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                    </div>
                  ) : visibleNotifications.length > 0 ? (
                    visibleNotifications.map((notification) => {
                      const style = getNotificationStyle(notification.Event);
                      const IconComponent = style.icon;
                      return (
                        <div
                          key={notification.idNotification}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-all border-l-2",
                            !isRead(notification) ? style.borderColor : "border-l-transparent",
                            !isRead(notification) && style.bgColor
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                              !isRead(notification) ? style.bgColor : "bg-muted/30"
                            )}>
                              <IconComponent className={cn(
                                "h-4 w-4",
                                !isRead(notification) ? style.iconColor : "text-muted-foreground/50"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={cn(
                                  "text-sm font-medium truncate",
                                  !isRead(notification) && "text-foreground",
                                  isRead(notification) && "text-muted-foreground"
                                )}>
                                  {notification.Event || t('notifications.events.notification')}
                                </p>
                                {!isRead(notification) && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{notification.Descripcion}</p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1">{formatRelativeTime(notification.DateOf, t)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{t('header.noNotifications')}</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-8 gap-2 hover:bg-yellow-500/10 hover:text-yellow-600"
                      onClick={() => navigate('/notifications')}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t('header.viewAllNotifications')}
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 ml-1"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                    <p className="text-xs text-accent font-medium mt-1">
                      {currentUser.roleName}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('header.myProfile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('header.settings')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('header.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
