import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Filter,
} from 'lucide-react';
import { useRole } from '@/hooks/use-role';
import TicketService from '@/services/TicketService';
import TechnicianService from '@/services/TechnicianService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export default function WorkCalendar() {
  const { isAdmin } = useRole();
  const technicianId = import.meta.env.VITE_TECHNICIAN_ID;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(isAdmin ? 'all' : technicianId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTechnician]);

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
        
        // Filtrar tickets según el técnico seleccionado
        if (selectedTechnician !== 'all') {
          allTickets = allTickets.filter(
            ticket => ticket.Assign?.Technician?.idTechnician === selectedTechnician
          );
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
      const ticketDate = new Date(ticket.CreationDate);
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
  const selectedDateTickets = selectedDate ? getTicketsForDate(selectedDate) : [];

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

        {/* Calendar and Details Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Skeleton */}
          <Card className="lg:col-span-2">
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
              <div className="grid grid-cols-7 gap-2 mb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded-md" />
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square p-2 rounded-lg border-2 border-border bg-muted/20"
                  >
                    <div className="h-4 w-6 bg-muted animate-pulse rounded-md" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Details Skeleton */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded-lg" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-border/50 bg-muted/20">
                    <CardContent className="p-3 space-y-2">
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-5 w-20 bg-muted animate-pulse rounded-md" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-3 w-24 bg-muted animate-pulse rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
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
          <h1 className="text-3xl font-bold tracking-tight">Calendario de Trabajo</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Visualiza la carga de trabajo de todos los técnicos' : 'Tu calendario de tickets asignados'}
          </p>
        </div>
        
        {/* Filtro de técnico (solo para admin) */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-accent" />
                <CardTitle className="text-xl">
                  {MONTHS[month]} {year}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth(-1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth(1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(year, month, day);
                const dayTickets = getTicketsForDate(date);
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
                const isSelected = selectedDate?.getDate() === day &&
                                 selectedDate?.getMonth() === month &&
                                 selectedDate?.getFullYear() === year;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all hover:border-accent hover:shadow-md relative ${
                      isToday
                        ? 'border-accent bg-accent/10'
                        : isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted/20'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-accent' : ''}`}>
                      {day}
                    </span>
                    
                    {/* Ticket indicators */}
                    {dayTickets.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap justify-center">
                        {dayTickets.slice(0, 3).map((ticket, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${getStateColor(ticket.State)}`}
                          />
                        ))}
                        {dayTickets.length > 3 && (
                          <span className="text-[8px] text-muted-foreground ml-0.5">
                            +{dayTickets.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              {selectedDate
                ? `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`
                : 'Selecciona un día'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateTickets.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:bg-border
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  hover:[&::-webkit-scrollbar-thumb]:bg-border/80">
                  {selectedDateTickets.map((ticket) => (
                    <Card key={ticket.idTicket} className="border-border/50 bg-muted/20">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {ticket.Title}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs mt-1 ${getStateColor(ticket.State).replace('bg-', 'border-')} ${getStateColor(ticket.State).replace('bg-', 'text-')}`}
                            >
                              {ticket.State}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            #{ticket.idTicket}
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">{ticket.User?.Username}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(ticket.CreationDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        {ticket.Assign?.Technician && (
                          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.Assign.Technician.Username}`} />
                              <AvatarFallback className="bg-accent/10 text-accent text-xs">
                                {ticket.Assign.Technician.Username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs truncate">{ticket.Assign.Technician.Username}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No hay tickets en esta fecha</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Selecciona un día para ver los tickets</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
