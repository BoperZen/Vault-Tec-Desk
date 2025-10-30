import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import TicketService from '@/services/TicketService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getStateColor = (state) => {
  const colors = {
    'Pendiente': 'border-red-500 bg-red-500/10',
    'Asignado': 'border-yellow-500 bg-yellow-500/10',
    'En Proceso': 'border-orange-500 bg-orange-500/10',
    'Resuelto': 'border-green-500 bg-green-500/10',
    'Cerrado': 'border-gray-500 bg-gray-500/10',
  };
  return colors[state] || 'border-border bg-muted';
};

const getStateBadgeColor = (state) => {
  const colors = {
    'Pendiente': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Asignado': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'En Proceso': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Resuelto': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Cerrado': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };
  return colors[state] || '';
};

export default function WeekCalendar() {
  const userId = parseInt(import.meta.env.VITE_USER_ID);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // Obtener el inicio de la semana (Domingo)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Generar los 7 días de la semana
  const generateWeekDays = (startDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Cargar tickets
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await TicketService.getTickets();
      
      if (response.data.success) {
        const allTickets = response.data.data;
        
        // Filtrar solo los tickets del usuario (comparación estricta de números)
        const userTickets = allTickets.filter(
          ticket => parseInt(ticket.User?.idUser) === parseInt(userId)
        );
        
        setTickets(userTickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const weekStart = getWeekStart(currentDate);
    const days = generateWeekDays(weekStart);
    setWeekDays(days);
    setSelectedDay(days.find(d => d.toDateString() === new Date().toDateString()) || days[0]);
  }, [currentDate]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Obtener tickets de un día específico
  const getTicketsForDay = (day) => {
    return tickets.filter(ticket => {
      // Soportar tanto DateCreated como CreationDate
      const dateStr = ticket.DateCreated || ticket.CreationDate;
      if (!dateStr) return false;
      
      const ticketDate = new Date(dateStr);
      // Comparar solo año, mes y día (ignorar hora)
      return ticketDate.getFullYear() === day.getFullYear() &&
             ticketDate.getMonth() === day.getMonth() &&
             ticketDate.getDate() === day.getDate();
    });
  };

  // Navegar semanas
  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day) => {
    return day.toDateString() === new Date().toDateString();
  };

  // Estadísticas de la semana
  const isInWeek = (ticket) => {
    const dateStr = ticket.DateCreated || ticket.CreationDate;
    if (!dateStr || weekDays.length === 0) return false;
    
    const ticketDate = new Date(dateStr);
    const weekStart = new Date(weekDays[0]);
    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);
    
    return ticketDate >= weekStart && ticketDate <= weekEnd;
  };

  const weekStats = {
    total: tickets.filter(t => isInWeek(t)).length,
    pending: tickets.filter(t => isInWeek(t) && (t.State === 'Pendiente' || t.State === 'Asignado')).length,
    inProgress: tickets.filter(t => isInWeek(t) && t.State === 'En Proceso').length,
    resolved: tickets.filter(t => isInWeek(t) && (t.State === 'Resuelto' || t.State === 'Cerrado')).length,
  };

  const selectedDayTickets = selectedDay ? getTicketsForDay(selectedDay) : [];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="text-center space-y-2">
                  <Skeleton className="h-4 w-12 mx-auto" />
                  <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                  <Skeleton className="h-5 w-16 mx-auto" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Details Panel Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con navegación */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                Mi Calendario Semanal
              </CardTitle>
              <CardDescription>
                Semana del {weekDays[0]?.getDate()} al {weekDays[6]?.getDate()} de {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                {selectedDay?.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) || 'Seleccionar fecha'}
              </Button>
              <Button variant="outline" size="icon" onClick={nextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas de la semana */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{weekStats.total}</p>
              </div>
              <Ticket className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-orange-500">{weekStats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold text-yellow-500">{weekStats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resueltos</p>
                <p className="text-2xl font-bold text-green-500">{weekStats.resolved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista semanal - Grid de 7 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayTickets = getTicketsForDay(day);
          const isTodayDay = isToday(day);
          const isSelected = selectedDay?.toDateString() === day.toDateString();

          return (
            <Card 
              key={index}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary border-primary shadow-md' : ''
              }`}
              onClick={() => setSelectedDay(day)}
            >
              <CardHeader className="pb-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-medium">
                    {DAYS_SHORT[day.getDay()]}
                  </p>
                  <p className={`text-2xl font-bold ${isTodayDay ? 'text-primary' : ''}`}>
                    {day.getDate()}
                  </p>
                  {dayTickets.length > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      {dayTickets.length} ticket{dayTickets.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  {dayTickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.idTicket}
                      className={`p-2 rounded-md border-l-4 ${getStateColor(ticket.State)}`}
                    >
                      <p className="text-xs font-medium truncate">
                        {ticket.Title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {ticket.Category?.Name || 'Sin categoría'}
                      </p>
                    </div>
                  ))}
                  {dayTickets.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{dayTickets.length - 3} más
                    </p>
                  )}
                  {dayTickets.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Sin tickets
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Panel de detalles del día seleccionado */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isToday(selectedDay) 
                ? `Hoy, ${selectedDay.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : `${DAYS_FULL[selectedDay.getDay()]}, ${selectedDay.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`
              }
            </CardTitle>
            <CardDescription>
              {selectedDayTickets.length} ticket{selectedDayTickets.length !== 1 ? 's' : ''} en este día
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDayTickets.length > 0 ? (
              <div className="space-y-3">
                {selectedDayTickets.map((ticket) => (
                  <div
                    key={ticket.idTicket}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{ticket.Title}</h4>
                          <Badge className={getStateBadgeColor(ticket.State)}>
                            {ticket.State}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticket.Description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Ticket className="w-3 h-3" />
                            {ticket.Category?.Name || 'Sin categoría'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.DateCreated).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {ticket.Assign?.Technician && (
                            <span className="flex items-center gap-1">
                              Técnico: {ticket.Assign.Technician.User?.username || 'No asignado'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay tickets en este día</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
