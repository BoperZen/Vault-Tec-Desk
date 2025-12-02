import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Filter,
  Eye,
  Hash,
} from 'lucide-react';
import { useRole } from '@/hooks/use-role';
import { useUser } from '@/context/UserContext';
import TicketService from '@/services/TicketService';
import TechnicianService from '@/services/TechnicianService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatUtcToLocalDate, formatUtcToLocalTime } from '@/lib/utils';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getStateColor = (state) => {
  const colors = {
    'Pendiente': 'bg-red-500',
    'Asignado': 'bg-yellow-500',
    'En Proceso': 'bg-orange-500',
    'Resuelto': 'bg-green-500',
    'Cerrado': 'bg-gray-500',
  };
  return colors[state] || 'bg-muted';
};

const getTechnicianInitials = (name = '') => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '—';
};

export default function WorkCalendar() {
  const navigate = useNavigate();
  const { isAdmin, isLoadingRole } = useRole();
  const { technicianProfile, isTechnicianLoading } = useUser();
  const technicianIdValue = technicianProfile?.idTechnician ? Number(technicianProfile.idTechnician) : null;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(
    isAdmin ? 'all' : (technicianIdValue ? technicianIdValue.toString() : null)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' o 'assigned'

  useEffect(() => {
    if (isLoadingRole) return;
    if (!isAdmin && (isTechnicianLoading || !technicianIdValue)) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTechnician, filterType, isAdmin, isLoadingRole, technicianIdValue, isTechnicianLoading]);

  useEffect(() => {
    if (isAdmin) {
      setSelectedTechnician('all');
      return;
    }

    if (technicianIdValue) {
      setSelectedTechnician(technicianIdValue.toString());
    }
  }, [isAdmin, technicianIdValue]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const promises = [TicketService.getTickets()];
      
      // Solo cargar técnicos si es admin
      if (isAdmin) {
        promises.push(TechnicianService.getTechnicians());
      }
      
      const responses = await Promise.all(promises);
      const ticketResponse = responses[0];
      
      if (ticketResponse.data.success) {
        let allTickets = ticketResponse.data.data;
        
        // Filtrar por tipo (todos o solo asignados)
        if (filterType === 'assigned') {
          allTickets = allTickets.filter(ticket => ticket.Assign !== null);
        }
        
        // Filtrar tickets según el técnico seleccionado
        if (selectedTechnician !== 'all') {
          const techId = parseInt(selectedTechnician);
          allTickets = allTickets.filter(ticket => {
            const ticketTechId = ticket.Assign?.Technician?.idTechnician;
            return ticketTechId === techId;
          });
        }
        
        setTickets(allTickets);
      }
      
      if (isAdmin && responses[1]?.data.success) {
        setTechnicians(responses[1].data.data);
      }
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError('Error al cargar los datos del calendario');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getTicketsForDate = (date) => {
    return tickets.filter(ticket => {
      const sourceDate = ticket.CreationDate || ticket.DateOfEntry;
      if (!sourceDate) return false;
      const ticketDate = new Date(sourceDate);
      return ticketDate.getDate() === date.getDate() &&
             ticketDate.getMonth() === date.getMonth() &&
             ticketDate.getFullYear() === date.getFullYear();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const today = new Date();
  const selectedDateTickets = useMemo(() => {
    if (!selectedDate) return [];
    return getTicketsForDate(selectedDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, tickets]);

  const handleNavigateToTicket = () => {
    if (!selectedTicket) return;
    navigate(`/tickets?ticketId=${selectedTicket.idTicket}`);
  };

  useEffect(() => {
    if (selectedDateTickets.length === 0) {
      setSelectedTicket(null);
      return;
    }

    setSelectedTicket((prev) => {
      if (!prev) return selectedDateTickets[0];
      const stillExists = selectedDateTickets.find((ticket) => ticket.idTicket === prev.idTicket);
      return stillExists || selectedDateTickets[0];
    });
  }, [selectedDateTickets]);

  if (loading) {
    return (
      <div className="space-y-6 container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded-lg" />
          </div>
          {isAdmin && (
            <div className="h-10 w-[200px] bg-muted animate-pulse rounded-lg" />
          )}
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-accent/50 bg-accent/5">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-muted animate-pulse rounded-md" />
                <div className="h-6 w-32 bg-muted animate-pulse rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-16 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-3 mb-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted animate-pulse rounded-md text-center" />
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[120px] rounded-2xl border border-border bg-muted/10 p-3"
                >
                  <div className="h-4 w-6 bg-muted animate-pulse rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
    <div className="space-y-6 container mx-auto px-4 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario de Trabajo</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Visualiza la carga de trabajo de todos los técnicos' : 'Tu calendario de tickets asignados'}
          </p>
        </div>
        
        {/* Filtros (solo para admin) */}
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            
            {/* Filtro de tipo */}
            <Select 
              value={filterType} 
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de tickets" />
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
                  <SelectItem key={tech.idTechnician} value={tech.idTechnician}>
                    {tech.Username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{tickets.length}</p>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              En Proceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {tickets.filter(t => t.State === 'En Proceso').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Resueltos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {tickets.filter(t => t.State === 'Resuelto' || t.State === 'Cerrado').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {tickets.filter(t => t.State === 'Pendiente' || t.State === 'Asignado').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-accent" />
              <CardTitle className="text-xl">
                {MONTHS[month]} {year}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3 mb-3">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-muted-foreground tracking-wide"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="h-[120px]" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(year, month, day);
              const dayTickets = getTicketsForDate(date);
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
              const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col justify-between rounded-2xl border px-3 py-2 text-left h-[120px] transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-md'
                      : isToday
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-muted/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-semibold ${isToday ? 'text-accent' : 'text-foreground'}`}>
                      {day}
                    </span>
                    {dayTickets.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-2 py-0">
                        {dayTickets.length}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayTickets.slice(0, 2).map((ticket) => (
                      <div key={ticket.idTicket} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span className={`w-2 h-2 rounded-full ${getStateColor(ticket.State)}`}></span>
                        <p className="truncate">{ticket.Title}</p>
                      </div>
                    ))}
                    {dayTickets.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">Sin tickets</p>
                    )}
                    {dayTickets.length > 2 && (
                      <p className="text-[10px] text-muted-foreground">+{dayTickets.length - 2} más</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ticket className="w-5 h-5 text-primary" />
            {selectedDate
              ? `${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
              : 'Selecciona un día'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedDateTickets.length} ticket{selectedDateTickets.length !== 1 ? 's' : ''} en esta fecha
          </p>
        </CardHeader>
        <CardContent>
          {selectedDateTickets.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-border/60
                hover:[&::-webkit-scrollbar-thumb]:bg-border">
                {selectedDateTickets.map((ticket) => {
                  const creationSource = ticket.CreationDate || ticket.DateOfEntry;
                  const isActive = selectedTicket?.idTicket === ticket.idTicket;
                  return (
                    <button
                      key={ticket.idTicket}
                      type="button"
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isActive ? 'border-primary bg-primary/10 shadow-md' : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold truncate">{ticket.Title}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          #{ticket.idTicket}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] ${getStateColor(ticket.State).replace('bg-', 'border-')} ${getStateColor(ticket.State).replace('bg-', 'text-')}`}>
                          {ticket.State}
                        </span>
                        <span>{formatUtcToLocalTime(creationSource)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-2">
                {selectedTicket ? (
                  <div className="p-4 rounded-2xl border bg-muted/10 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">#{selectedTicket.idTicket}</Badge>
                      <h3 className="text-xl font-semibold flex-1 min-w-0 truncate">
                        {selectedTicket.Title}
                      </h3>
                      <Badge className="bg-muted text-foreground border-border">
                        {selectedTicket.State}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.Description || 'Sin descripción'}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          Categoría: {selectedTicket.Category || 'N/A'}
                        </p>
                        <p className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Cliente: {selectedTicket.User?.Username || 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatUtcToLocalDate(selectedTicket.CreationDate || selectedTicket.DateOfEntry, { includeYear: true })}
                        </p>
                        {selectedTicket.Assign?.Technician && (
                          <p className="flex items-center gap-2">
                            Técnico:
                            <span className="font-medium">{selectedTicket.Assign.Technician.Username}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* SLA Badges - Tiempo de Respuesta y Resolución */}
                    {selectedTicket.SLA && (
                      <div className="bg-background/80 rounded-xl p-3 border flex flex-wrap gap-2">
                        {/* Tiempo de Respuesta - Solo estados 1 y 2 */}
                        {(Number(selectedTicket.idState) === 1 || Number(selectedTicket.idState) === 2) && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              (() => {
                                const hoursRemaining = selectedTicket.SLA.ResponseHoursRemaining;
                                if (hoursRemaining <= 0) return 'border-destructive/50 text-destructive bg-destructive/10';
                                if (hoursRemaining <= 0.5) return 'border-yellow-500/50 text-yellow-600';
                                return 'border-green-500/50 text-green-600';
                              })()
                            }`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Resp: {(() => {
                              const hoursRemaining = selectedTicket.SLA.ResponseHoursRemaining;
                              return hoursRemaining <= 0 ? 'Vencida' : `${hoursRemaining}h`;
                            })()}
                          </Badge>
                        )}
                        {/* Tiempo de Resolución - Solo estados 1, 2 y 3 */}
                        {(Number(selectedTicket.idState) === 1 || Number(selectedTicket.idState) === 2 || Number(selectedTicket.idState) === 3) && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              (() => {
                                const hoursRemaining = selectedTicket.SLA.ResolutionHoursRemaining;
                                if (hoursRemaining <= 0) return 'border-destructive/50 text-destructive bg-destructive/10';
                                if (hoursRemaining <= 2) return 'border-yellow-500/50 text-yellow-600';
                                return 'border-green-500/50 text-green-600';
                              })()
                            }`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Resol: {(() => {
                              const hoursRemaining = selectedTicket.SLA.ResolutionHoursRemaining;
                              return hoursRemaining <= 0 ? 'Vencida' : `${hoursRemaining}h`;
                            })()}
                          </Badge>
                        )}
                        {/* Mensaje si no hay badges (estado 4 o 5) */}
                        {Number(selectedTicket.idState) >= 4 && (
                          <span className="text-xs text-muted-foreground">SLA completado</span>
                        )}
                      </div>
                    )}

                    <div className="rounded-xl border bg-background/80 p-4 space-y-3">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Técnico asignado
                      </p>

                      {selectedTicket.Assign?.Technician ? (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                              {getTechnicianInitials(selectedTicket.Assign.Technician.Username || '')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{selectedTicket.Assign.Technician.Username}</p>
                              {selectedTicket.Assign.Technician.Email && (
                                <p className="text-xs text-muted-foreground">{selectedTicket.Assign.Technician.Email}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Este técnico es el responsable actual del seguimiento del ticket y deberá documentar cada cambio de estado.
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Aún no hay un técnico asignado. Usa el panel de asignación manual para seleccionar uno compatible.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed">
                      <Button size="sm" variant="outline" className="gap-2" onClick={handleNavigateToTicket}>
                        <Eye className="w-4 h-4" />
                        Ver ticket
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-10 text-center">
                    Selecciona un ticket para ver los detalles.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-12 text-center">
              No hay tickets registrados para esta fecha.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
