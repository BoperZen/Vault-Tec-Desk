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
  Filter,
  Plus,
} from 'lucide-react';
import { useRole } from '@/hooks/use-role';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '@/context/NotificationContext';
import TicketService from '@/services/TicketService';
import TechnicianService from '@/services/TechnicianService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StateProgress } from '@/components/ui/state-progress';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  const navigate = useNavigate();
  const { role } = useRole();
  const { showNotification } = useNotification();
  const technicianId = import.meta.env.VITE_TECHNICIAN_ID;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' o 'assigned'
  const [selectedTechnician, setSelectedTechnician] = useState('all');
  const [imageModal, setImageModal] = useState({ open: false, url: '' });

  // Mostrar notificación si viene del formulario de creación/edición
  useEffect(() => {
    if (location.state?.notification) {
      const { message, type } = location.state.notification;
      showNotification(message, type);
      // Limpiar el estado para que no se muestre de nuevo al recargar
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar el componente

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, filterType, selectedTechnician]);



  /**
   * Las horas restantes ahora vienen calculadas desde el backend
   * usando la hora del servidor de base de datos, no la hora del cliente
   */

  /**
   * Carga los tickets desde la API y aplica filtros según el rol del usuario
   * - Admin: Aplica filtros de tipo (asignados/todos) y técnico específico
   * - Técnico: Solo muestra sus tickets asignados
   * - Cliente: Solo muestra sus propios tickets
   */
  const loadTickets = async () => {
    try {
      setLoading(true);
      
      const promises = [TicketService.getTickets()];
      
      // Cargar técnicos si es admin
      if (role === 3) {
        promises.push(TechnicianService.getTechnicians());
      }
      
      const responses = await Promise.all(promises);
      const response = responses[0];
      
      if (response.data.success) {
        let allTickets = response.data.data;
        
        // Filtrar tickets según el rol
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
        } else if (role === 3) {
          // Admin: Aplicar filtros
          
          // Filtro por tipo (asignado o todos)
          if (filterType === 'assigned') {
            allTickets = allTickets.filter(ticket => {
              try {
                return ticket.Assign && 
                       ticket.Assign.Technician && 
                       ticket.Assign.Technician.idTechnician;
              } catch (error) {
                console.error('Error filtrando ticket asignado:', ticket.idTicket, error);
                return false;
              }
            });
          }
          
          // Filtro por técnico específico
          if (selectedTechnician !== 'all') {
            const techId = parseInt(selectedTechnician);
            allTickets = allTickets.filter(ticket => {
              try {
                const ticketTechId = parseInt(ticket.Assign?.Technician?.idTechnician);
                return !isNaN(ticketTechId) && ticketTechId === techId;
              } catch (error) {
                console.error('Error filtrando por técnico:', ticket.idTicket, error);
                return false;
              }
            });
          }
        }
        
        setTickets(allTickets);
        
        // Guardar técnicos si es admin
        if (role === 3 && responses[1]?.data.success) {
          setTechnicians(responses[1].data.data);
        }
      } else {
        setError('Error al cargar los tickets');
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
      console.error('Error details:', err.message);
      console.error('Error stack:', err.stack);
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
      <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {role === 1 
              ? 'Mis Tickets Asignados' 
              : role === 3 && filterType === 'assigned'
              ? 'Tickets Asignados'
              : 'Todos los Tickets'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === 1 
              ? 'Tickets asignados a ti' 
              : role === 3 && filterType === 'assigned'
              ? 'Tickets asignados a técnicos'
              : 'Gestiona y visualiza todos los tickets del sistema'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Botón Crear Ticket */}
          <Button
            onClick={() => navigate('/tickets/create')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Ticket
          </Button>
          {/* Filtros (solo para admin) */}
          {role === 3 && (
            <>
              <Filter className="w-4 h-4 text-muted-foreground" />
              
              {/* Filtro de tipo */}
              <Select 
                value={filterType} 
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tickets</SelectItem>
                  <SelectItem value="assigned">Tickets Asignados</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro de técnico */}
              <Select 
                value={selectedTechnician} 
                onValueChange={setSelectedTechnician}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los técnicos</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.idTechnician} value={tech.idTechnician.toString()}>
                      {tech.Username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          
          <Badge variant="outline" className="text-sm px-4 py-2">
            {tickets.length} tickets
          </Badge>
        </div>
      </div>

      {/* Tickets List with Collapsible */}
      <div className="space-y-4 mb-5">
        {tickets.map((ticket) => {
          const isOpen = expandedTicket === ticket.idTicket;
          return (
            <Collapsible
              key={ticket.idTicket}
              open={isOpen}
              onOpenChange={(open) => {
                setExpandedTicket(open ? ticket.idTicket : null);
              }}
              className="w-full"
            >
            <Card 
              id={`ticket-${ticket.idTicket}`}
              className="overflow-hidden hover:shadow-lg hover:shadow-vault-glow/20 transition-all duration-300"
            >
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
                        {ticket.SLA && (ticket.State !== 'Cerrado' && ticket.State !== 'Resuelto') && (
                          <>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                (() => {
                                  const hoursRemaining = ticket.SLA.ResponseHoursRemaining;
                                  if (hoursRemaining <= 0) return 'border-destructive/50 text-destructive bg-destructive/10';
                                  if (hoursRemaining <= 0.5) return 'border-yellow-500/50 text-yellow-600';
                                  return 'border-green-500/50 text-green-600';
                                })()
                              }`}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Resp: {(() => {
                                const hoursRemaining = ticket.SLA.ResponseHoursRemaining;
                                return hoursRemaining <= 0 ? 'Vencida' : `${hoursRemaining}h`;
                              })()}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                (() => {
                                  const hoursRemaining = ticket.SLA.ResolutionHoursRemaining;
                                  if (hoursRemaining <= 0) return 'border-destructive/50 text-destructive bg-destructive/10';
                                  if (hoursRemaining <= 2) return 'border-yellow-500/50 text-yellow-600';
                                  return 'border-green-500/50 text-green-600';
                                })()
                              }`}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Resol: {(() => {
                                const hoursRemaining = ticket.SLA.ResolutionHoursRemaining;
                                return hoursRemaining <= 0 ? 'Vencida' : `${hoursRemaining}h`;
                              })()}
                            </Badge>
                          </>
                        )}
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

                    {/* Right: Actions */}
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
                          {ticket.SLA && (
                            <>
                              <div className="text-center p-2 rounded-lg bg-background/50">
                                <p className="text-xs font-semibold text-primary mb-1">Respuesta</p>
                                <p className="text-lg font-bold text-primary">
                                  {new Date(ticket.SLA.ResponseDeadline).toLocaleString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(ticket.SLA.ResponseDeadline).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-background/50">
                                <p className="text-xs font-semibold text-green-600 mb-1">Resolución</p>
                                <p className="text-lg font-bold text-green-600">
                                  {new Date(ticket.SLA.ResolutionDeadline).toLocaleString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(ticket.SLA.ResolutionDeadline).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit'
                                  })}
                                </p>
                              </div>
                            </>
                          )}
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
                                <div className="mt-2 space-y-2">
                                  <div className="flex items-center gap-1 text-xs text-primary">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>{record.Images.length} imagen(es)</span>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    {record.Images.filter(img => img.ImageBase64 || img.ImagePath).map((img) => {
                                      const imgSrc = img.ImageBase64 
                                        ? `data:image/jpeg;base64,${img.ImageBase64}`
                                        : `http://localhost/Vault-Tec-Desk/api/${img.ImagePath}`;
                                      return (
                                        <img
                                          key={`img-${record.idStateRecord}-${img.idImage}`}
                                          src={imgSrc}
                                          alt={`Evidencia ${img.idImage}`}
                                          className="w-16 h-16 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => setImageModal({ open: true, url: imgSrc })}
                                          onError={(e) => {
                                            console.error('Error cargando imagen:', img.idImage, 'Tipo:', img.ImageBase64 ? 'Base64' : 'Path');
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
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
          );
        })}
      </div>

      {/* Modal de Imagen */}
      {imageModal.open && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModal({ open: false, url: '' })}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold"
              onClick={() => setImageModal({ open: false, url: '' })}
            >
              ×
            </button>
            <img
              src={imageModal.url}
              alt="Vista ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
