import { Home, Ticket, Users, FolderKanban, Settings, ChevronRight } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    url: '/',
  },
  {
    title: 'Tickets',
    icon: Ticket,
    url: '/tickets',
    items: [
      { title: 'Todos los Tickets', url: '/tickets' },
      { title: 'Mis Tickets', url: '/tickets/my' },
      { title: 'Asignaciones', url: '/assignments' },
    ],
  },
  {
    title: 'Técnicos',
    icon: Users,
    url: '/technicians',
  },
  {
    title: 'Categorías',
    icon: FolderKanban,
    url: '/categories',
  },
  {
    title: 'Configuración',
    icon: Settings,
    url: '/settings',
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-primary mb-4">
            Vault-Tec Desk
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                
                if (item.items) {
                  return (
                    <Collapsible key={item.title} asChild defaultOpen={location.pathname.startsWith(item.url)}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={isActive ? 'bg-primary/10 text-primary' : ''}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const isSubActive = location.pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    className={isSubActive ? 'bg-accent/10 text-accent' : ''}
                                  >
                                    <Link to={subItem.url}>
                                      <span>{subItem.title}</span>
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
                      className={isActive ? 'bg-primary/10 text-primary' : ''}
                    >
                      <Link to={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
