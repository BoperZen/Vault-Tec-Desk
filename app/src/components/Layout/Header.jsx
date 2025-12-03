import { useState } from 'react';
import { Bell, Maximize, Minimize, User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
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

// Mock notifications - en el futuro vendrán de una API/context
const mockNotifications = [
  { id: 1, title: 'Nuevo ticket asignado', description: 'Ticket #245 - Problema con impresora', time: 'Hace 5 min', read: false },
  { id: 2, title: 'SLA próximo a vencer', description: 'Ticket #198 vence en 30 minutos', time: 'Hace 12 min', read: false },
  { id: 3, title: 'Ticket resuelto', description: 'El cliente cerró el ticket #201', time: 'Hace 1 hora', read: false },
  { id: 4, title: 'Nueva asignación automática', description: 'Ticket #250 asignado por autotriaje', time: 'Hace 2 horas', read: true },
  { id: 5, title: 'Comentario en ticket', description: 'Juan agregó un comentario en #189', time: 'Hace 3 horas', read: true },
  { id: 6, title: 'Valoración recibida', description: 'Cliente valoró el ticket #195 con 5 estrellas', time: 'Hace 4 horas', read: true },
  { id: 7, title: 'Recordatorio SLA', description: 'Ticket #210 tiene SLA vencido', time: 'Hace 5 horas', read: true },
  { id: 8, title: 'Técnico disponible', description: 'Carlos está disponible para asignación', time: 'Hace 6 horas', read: true },
];

export default function Header() {
  const { currentUser } = useUser();
  const { open } = useSidebar();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [notifications] = useState(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const visibleNotifications = notifications.slice(0, 6);
  const remainingCount = notifications.length - 6;

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
                <p>{isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}</p>
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
                    <h4 className="font-semibold text-sm">Notificaciones</h4>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground">{unreadCount} sin leer</span>
                    )}
                  </div>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {visibleNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors",
                        !notification.read && "bg-yellow-500/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                        )}
                        <div className={cn("flex-1 min-w-0", notification.read && "ml-5")}>
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {remainingCount > 0 && (
                  <div className="p-2 border-t border-border">
                    <Link 
                      to="/notifications" 
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 py-1"
                    >
                      <span>+{remainingCount} más</span>
                      <span className="text-muted-foreground/60">•••</span>
                      <span>Ver todas</span>
                    </Link>
                  </div>
                )}
                {notifications.length === 0 && (
                  <div className="p-6 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Sin notificaciones</p>
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
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
