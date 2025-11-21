import { Home, Ticket, User, Calendar, Users, FolderKanban } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/context/UserContext';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigationItems = [
  { title: 'Home', icon: Home, url: '/' },
  { title: 'Tickets', icon: Ticket, url: '/tickets' },
  { title: 'Technicians', icon: Users, url: '/technicians' },
  { title: 'Calendar', icon: Calendar, url: '/calendar' },
  { title: 'Categories', icon: FolderKanban, url: '/categories' },
];

export default function Header() {
  const { currentUser } = useUser();
  const location = useLocation();
  const { open } = useSidebar();

  const isActive = (url) => {
    if (url === '/') return location.pathname === '/';
    return location.pathname.startsWith(url);
  };

  return (
    <header className="fixed top-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300" style={{ left: open ? '20rem' : '5rem' }}>
      <div className="flex h-[100px] items-center px-6 gap-4 justify-between">
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

        {/* Right Navigation - Siempre en la derecha */}
        <nav className="flex items-center gap-6 ml-auto">
          {/* Navigation Items */}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            
            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative group",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.title}</span>
                {active && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
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
                <Link to="/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer">
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
