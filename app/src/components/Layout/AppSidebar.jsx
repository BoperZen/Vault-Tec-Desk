import { Home, Ticket, Users, FolderKanban, Settings, ChevronRight, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    url: '/',
    description: 'Vista general del sistema',
  },
  {
    title: 'Tickets',
    icon: Ticket,
    url: '/tickets',
    description: 'Gestión de tickets',
    items: [
      { title: 'Todos los Tickets', url: '/tickets', description: 'Ver todos' },
      { title: 'Mis Tickets', url: '/tickets/my', description: 'Tickets asignados' },
      { title: 'Asignaciones', url: '/assignments', description: 'Calendario' },
    ],
  },
  {
    title: 'Técnicos',
    icon: Users,
    url: '/technicians',
    description: 'Personal técnico',
  },
  {
    title: 'Categorías',
    icon: FolderKanban,
    url: '/categories',
    description: 'Categorías y etiquetas',
  },
];

const settingsItem = {
  title: 'Configuración',
  icon: Settings,
  url: '/settings',
  description: 'Ajustes del sistema',
};

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/50 bg-surface">
      {/* Header con logo */}
      <SidebarHeader className="h-[100px] px-3 border-b border-border/50 items-center">
        <Link to="/" className="flex flex-col items-center group w-full">
          <img 
            src="/vault-tec-logo.svg" 
            alt="Vault-Tec Logo" 
            className="h-[80px] px-3 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                
                if (item.items) {
                  return (
                    <Collapsible 
                      key={item.title} 
                      asChild 
                      defaultOpen={location.pathname.startsWith(item.url)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={`h-11 px-3 rounded-lg transition-all duration-200 group ${
                              isActive 
                                ? 'bg-primary/10 text-primary hover:bg-primary/15 shadow-sm' 
                                : 'hover:bg-muted/80'
                            }`}
                          >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <div className="flex-1 flex flex-col items-start">
                              <span className="font-medium text-sm">{item.title}</span>
                              {item.description && (
                                <span className="text-xs text-muted-foreground">{item.description}</span>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-1">
                          <SidebarMenuSub className="ml-4 border-l-2 border-border/50 pl-2 space-y-1">
                            {item.items.map((subItem) => {
                              const isSubActive = location.pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    className={`h-9 rounded-md transition-all duration-200 ${
                                      isSubActive 
                                        ? 'bg-accent/10 text-accent hover:bg-accent/15 border-l-2 border-accent -ml-2 pl-3' 
                                        : 'hover:bg-muted/60 pl-2'
                                    }`}
                                  >
                                    <Link to={subItem.url}>
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
                      className={`h-11 px-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/10 text-primary hover:bg-primary/15 shadow-sm' 
                          : 'hover:bg-muted/80'
                      }`}
                    >
                      <Link to={item.url}>
                        <item.icon className="w-5 h-5 shrink-0" />
                        <div className="flex-1 flex flex-col items-start">
                          <span className="font-medium text-sm">{item.title}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          )}
                        </div>
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
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={settingsItem.title}
                  className={`h-11 px-3 rounded-lg transition-all duration-200 ${
                    location.pathname === settingsItem.url
                      ? 'bg-primary/10 text-primary hover:bg-primary/15 shadow-sm' 
                      : 'hover:bg-muted/80'
                  }`}
                >
                  <Link to={settingsItem.url}>
                    <settingsItem.icon className="w-5 h-5 shrink-0" />
                    <div className="flex-1 flex flex-col items-start">
                      <span className="font-medium text-sm">{settingsItem.title}</span>
                      <span className="text-xs text-muted-foreground">{settingsItem.description}</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-6 py-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground text-center">
          <p className="font-medium">Vault-Tec Industries</p>
          <p className="mt-1">© 2025 • v1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
