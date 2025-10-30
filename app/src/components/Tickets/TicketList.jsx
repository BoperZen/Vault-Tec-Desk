import { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  FolderKanban, 
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  Star,
  ChevronDown,
  AlertCircle,
  UserCheck,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useRole } from '@/hooks/use-role';
import { useLocation } from 'react-router-dom';
import TicketService from '@/services/TicketService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StateProgress } from '@/components/ui/state-progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Mock data - reemplazar con datos de la API
const mockTickets = [
  {
    idTicket: 1,
    Title: 'Error en módulo de facturación',
    Description: 'El sistema no genera las facturas correctamente y muestra errores de cálculo en los totales.',
    DateOfEntry: '2025-10-28T10:30:00',
    State: 'En Proceso',
    Category: 'Software',
    User: { idUser: 2, Username: 'Juan Pérez', Email: 'juan@example.com' },
    Priority: 'Alta',
    SLAProgress: 65,
    SLAHoursRemaining: 18,
    StateRecords: [
      { idStateRecord: 1, State: 'Abierto', DateOfChange: '2025-10-28T10:30:00', Observation: 'Ticket creado', Images: [] },
      { idStateRecord: 2, State: 'Asignado', DateOfChange: '2025-10-28T11:00:00', Observation: 'Asignado a técnico', Images: [] },
      { idStateRecord: 3, State: 'En Proceso', DateOfChange: '2025-10-28T14:30:00', Observation: 'Investigando el problema', Images: [{ idImage: 1, Image: 'error_screenshot.png' }] },
    ],
    Assign: {
      DateOfAssign: '2025-10-28T11:00:00',
      Observation: 'Asignación automática por especialidad',
      Type: 'R-1',
      Technician: { idTechnician: 1, Username: 'Carlos Tech', Email: 'carlos@vaulttec.com' }
    }
  },
  {
    idTicket: 2,
    Title: 'Solicitud de nuevo equipo',
    Description: 'Necesito un equipo de cómputo para el nuevo empleado del departamento de ventas.',
    DateOfEntry: '2025-10-29T09:15:00',
    State: 'Pendiente',
    Category: 'Hardware',
    User: { idUser: 3, Username: 'María García', Email: 'maria@example.com' },
    Priority: 'Media',
    SLAProgress: 30,
    SLAHoursRemaining: 42,
    StateRecords: [
      { idStateRecord: 4, State: 'Pendiente', DateOfChange: '2025-10-29T09:15:00', Observation: 'Ticket creado, esperando asignación', Images: [] },
    ]
  },
  {
    idTicket: 3,
    Title: 'Actualización de sistema operativo',
    Description: 'Es necesario actualizar el sistema operativo de todas las estaciones de trabajo del piso 3.',
    DateOfEntry: '2025-10-27T08:00:00',
    State: 'Cerrado',
    Category: 'Infraestructura',
    User: { idUser: 4, Username: 'Pedro Admin', Email: 'pedro@example.com' },
    Priority: 'Baja',
    SLAProgress: 100,
    SLAHoursRemaining: 0,
    StateRecords: [
      { idStateRecord: 5, State: 'Abierto', DateOfChange: '2025-10-27T08:00:00', Observation: 'Ticket creado', Images: [] },
      { idStateRecord: 6, State: 'Asignado', DateOfChange: '2025-10-27T09:00:00', Observation: 'Asignado a equipo', Images: [] },
      { idStateRecord: 7, State: 'En Proceso', DateOfChange: '2025-10-27T10:30:00', Observation: 'Actualizando equipos', Images: [] },
      { idStateRecord: 8, State: 'Resuelto', DateOfChange: '2025-10-28T16:00:00', Observation: 'Actualización completa', Images: [{ idImage: 2, Image: 'completion.png' }] },
      { idStateRecord: 9, State: 'Cerrado', DateOfChange: '2025-10-29T08:00:00', Observation: 'Confirmado por usuario', Images: [] },
    ],
    Assign: {
      DateOfAssign: '2025-10-27T09:00:00',
      Observation: 'Asignado a equipo de infraestructura',
      Type: 'Manual',
      Technician: { idTechnician: 2, Username: 'Ana Tech', Email: 'ana@vaulttec.com' }
    },
    ServiceReview: {
      idServiceReview: 1,
      Score: 5,
      Comment: 'Excelente servicio, muy profesional',
      DateOfReview: '2025-10-29T08:30:00'
    }
  },
];

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

const getStateIcon = (state) => {
  const icons = {
    'Pendiente': { icon: AlertCircle, color: 'text-red-500 bg-red-500/10' },
    'Asignado': { icon: UserCheck, color: 'text-yellow-500 bg-yellow-500/10' },
    'En Proceso': { icon: Loader2, color: 'text-orange-500 bg-orange-500/10' },
    'Resuelto': { icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
    'Cerrado': { icon: XCircle, color: 'text-gray-500 bg-gray-500/10' },
  };
  return icons[state] || { icon: AlertCircle, color: 'text-muted-foreground bg-muted' };
};

export default function TicketList() {
  const location = useLocation();
  const { role } = useRole();
  const technicianId = import.meta.env.VITE_TECHNICIAN_ID;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTicket, setExpandedTicket] = useState(null);

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const calculateSLA = (creationDate, state, category) => {
    // SLA por categoría basado en la tabla real del sistema
    // Formato: [MaxAnswerTime (Respuesta), MaxResolutionTime (Resolución)]
    const SLA_BY_CATEGORY = {
      'Sistemas transaccionales': { answer: 1, resolution: 4 },      // idSLA 1
      'Cajeros automaticos': { answer: 2, resolution: 6 },            // idSLA 2
      'Fraudes y alertas Vault': { answer: 1, resolution: 2 },       // idSLA 3
      'Atención al cliente Vault': { answer: 2, resolution: 8 },     // idSLA 4
      'Default': { answer: 2, resolution: 8 }                         // Por defecto
    };
    
    // Obtener el SLA según la categoría, o usar el default
    const slaConfig = SLA_BY_CATEGORY[category] || SLA_BY_CATEGORY['Default'];
    
    // Usar tiempo de resolución como métrica principal
    const SLA_HOURS = slaConfig.resolution;
    
    const now = new Date();
    const created = new Date(creationDate);
    const hoursElapsed = (now - created) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, SLA_HOURS - hoursElapsed);
    const progress = Math.min(100, (hoursElapsed / SLA_HOURS) * 100);
    
    // Si está cerrado o resuelto, SLA al 100%
    if (state === 'Cerrado' || state === 'Resuelto') {
      return { hoursRemaining: 0, progress: 100 };
    }
    
    return { 
      hoursRemaining: Math.round(hoursRemaining * 10) / 10, // Redondear a 1 decimal
      progress: Math.round(progress) 
    };
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await TicketService.getTickets();
      if (response.data.success) {
        let allTickets = response.data.data;
        
        // Filtrar tickets según el rol y la ruta
        const isAssignedRoute = location.pathname === '/tickets/assigned';
        
        if (role === 1) {
          // Técnicos: Ver solo sus tickets asignados (siempre)
          allTickets = allTickets.filter(
            ticket => parseInt(ticket.Assign?.Technician?.idTechnician) === parseInt(technicianId)
          );
        } else if (role === 2) {
          // Clientes: Ver SIEMPRE solo sus propios tickets (sin importar la ruta)
          allTickets = allTickets.filter(
            ticket => parseInt(ticket.User?.idUser) === parseInt(import.meta.env.VITE_USER_ID)
          );
        } else if (role === 3 && isAssignedRoute) {
          // Admin en "Tickets Asignados": Ver todos los tickets que tienen asignación
          allTickets = allTickets.filter(ticket => ticket.Assign !== null);
        }
        // role === 3 en /tickets: Ver todos los tickets (sin filtro)
        
        // Agregar cálculos de SLA a cada ticket
        const ticketsWithSLA = allTickets.map(ticket => {
          const sla = calculateSLA(ticket.CreationDate, ticket.State, ticket.Category);
          return {
            ...ticket,
            SLAHoursRemaining: sla.hoursRemaining,
            SLAProgress: sla.progress
          };
        });
        setTickets(ticketsWithSLA);
      } else {
        setError('Error al cargar los tickets');
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="space-y-2">
            <div className="h-9 w-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Tickets Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                      <div className="h-6 w-20 bg-muted animate-pulse rounded-md" />
                      <div className="h-6 w-24 bg-muted animate-pulse rounded-md" />
                      <div className="h-6 w-28 bg-muted animate-pulse rounded-md" />
                    </div>
                    <div className="h-7 w-3/4 bg-muted animate-pulse rounded-lg" />
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                      <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
                    </div>
                    <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mt-4">
            {role === 1 
              ? 'Mis Tickets Asignados' 
              : location.pathname === '/tickets/assigned'
              ? 'Tickets Asignados'
              : location.pathname === '/tickets/my'
              ? 'Mis Tickets'
              : 'Todos los Tickets'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === 1 
              ? 'Tickets asignados a ti' 
              : location.pathname === '/tickets/assigned'
              ? 'Todos los tickets asignados a técnicos'
              : location.pathname === '/tickets/my'
              ? 'Tus tickets creados'
              : 'Gestiona y visualiza todos los tickets del sistema'}
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          {tickets.length} tickets
        </Badge>
      </div>

      {/* Tickets List with Collapsible */}
      <div className="space-y-4 mb-5">
        {tickets.map((ticket) => (
          <Collapsible
            key={ticket.idTicket}
            open={expandedTicket === ticket.idTicket}
            onOpenChange={() => setExpandedTicket(expandedTicket === ticket.idTicket ? null : ticket.idTicket)}
            className="w-full"
          >
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-vault-glow/20 transition-all duration-300">
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors py-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Ticket Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{ticket.idTicket}
                        </Badge>
                        <Badge className={getStateColor(ticket.State)}>
                          {ticket.State}
                        </Badge>
                        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                          {ticket.Category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${ticket.SLAHoursRemaining <= 0.5 ? 'border-destructive/50 text-destructive' : ticket.SLAHoursRemaining <= 2 ? 'border-yellow-500/50 text-yellow-600' : 'border-green-500/50 text-green-600'}`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {ticket.SLAHoursRemaining}h restantes
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-xl text-left">
                        {ticket.Title}
                      </CardTitle>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(ticket.CreationDate || ticket.DateOfEntry).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{ticket.User?.Username || 'N/A'}</span>
                        </div>
                      </div>

                      {/* State Progress */}
                      <StateProgress currentState={ticket.State} />
                    </div>

                    {/* Right: Icon */}
                    <div className="flex items-center gap-2 pt-2">
                      <ChevronDown 
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                          expandedTicket === ticket.idTicket ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  <Separator />

                  {/* Description */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4" />
                      Descripción
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {ticket.Description}
                    </p>
                  </div>

                  {/* Grid Layout for Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assigned Technician */}
                    {ticket.Assign && (
                      <Card className="border-border/50 bg-muted/20">
                        <CardHeader className="pb-3">
                          <h4 className="font-semibold flex items-center gap-2 text-sm">
                            <User className="w-4 h-4" />
                            Técnico Asignado
                          </h4>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-accent text-accent-foreground">
                                {ticket.Assign.Technician.Username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{ticket.Assign.Technician.Username}</p>
                              <p className="text-xs text-muted-foreground truncate">{ticket.Assign.Technician.Email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="mt-3 w-full justify-center">
                            {ticket.Assign.Type}
                          </Badge>
                        </CardContent>
                      </Card>
                    )}

                    {/* Stats Summary */}
                    <Card className="border-border/50 bg-muted/20">
                      <CardHeader className="pb-3">
                        <h4 className="font-semibold text-sm">Estadísticas</h4>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg bg-background/50">
                            <p className="text-xl font-bold text-primary">{ticket.StateRecords?.length || 0}</p>
                            <p className="text-[10px] text-muted-foreground">Cambios</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-background/50">
                            <p className="text-xl font-bold text-accent">{ticket.SLAProgress}%</p>
                            <p className="text-[10px] text-muted-foreground">SLA</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-background/50">
                            <p className="text-xl font-bold text-primary">
                              {Math.floor((new Date() - new Date(ticket.CreationDate)) / (1000 * 60 * 60 * 24))}d
                            </p>
                            <p className="text-[10px] text-muted-foreground">Días</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* State Records Timeline */}
                  <Card className="border-border/50 bg-muted/20">
                    <CardHeader className="pb-3">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        Historial de Estados
                      </h4>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {ticket.StateRecords?.map((record) => {
                          const StateIcon = getStateIcon(record.State).icon;
                          const iconColor = getStateIcon(record.State).color;
                          return (
                            <div 
                              key={record.idStateRecord}
                              className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                            >
                              <div className={`p-1.5 rounded-full ${iconColor}`}>
                                <StateIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{record.State}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(record.DateOfChange).toLocaleString()}
                                  </span>
                                </div>
                              <p className="text-xs text-muted-foreground">{record.Observation}</p>
                              {record.Images?.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-primary mt-1">
                                  <ImageIcon className="w-3 h-3" />
                                  <span>{record.Images.length} imagen(es)</span>
                                </div>
                              )}
                            </div>
                          </div>
                          );
                        }) || <p className="text-sm text-muted-foreground">No hay historial disponible</p>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Service Review */}
                  {ticket.ServiceReview && (
                    <Card className="border-border/50 bg-muted/20">
                      <CardHeader className="pb-3">
                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          Valoración del Servicio
                        </h4>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${i < ticket.ServiceReview.Score ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                              />
                            ))}
                            <span className="text-sm font-medium ml-2">{ticket.ServiceReview.Score}/5</span>
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            "{ticket.ServiceReview.Comment}"
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(ticket.ServiceReview.DateOfReview).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
