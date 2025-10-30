import { useState } from 'react';
import { 
  Clock, 
  User, 
  FolderKanban, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Timer,
  MessageSquare,
  Image as ImageIcon,
  Star,
  ChevronDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
    'Pendiente': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    'Asignado': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'En Proceso': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Resuelto': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Cerrado': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return colors[state] || 'bg-muted text-muted-foreground';
};

const getPriorityColor = (priority) => {
  const colors = {
    'Alta': 'destructive',
    'Media': 'default',
    'Baja': 'secondary',
  };
  return colors[priority] || 'default';
};

export default function TicketList() {
  const [tickets] = useState(mockTickets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y visualiza todos los tickets del sistema
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          {tickets.length} tickets
        </Badge>
      </div>

      {/* Tickets List with Accordion */}
      <Accordion type="single" collapsible className="space-y-4">
        {tickets.map((ticket) => (
          <AccordionItem 
            key={ticket.idTicket} 
            value={`ticket-${ticket.idTicket}`}
            className="border-none"
          >
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-vault-glow/20 transition-all duration-300">
              <AccordionTrigger className="hover:no-underline p-0">
                <CardHeader className="w-full pb-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Ticket Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{ticket.idTicket}
                        </Badge>
                        <Badge className={getStateColor(ticket.State)}>
                          {ticket.State}
                        </Badge>
                        <Badge variant={getPriorityColor(ticket.Priority)}>
                          {ticket.Priority}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-xl text-left">
                        {ticket.Title}
                      </CardTitle>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FolderKanban className="w-4 h-4" />
                          <span>{ticket.Category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(ticket.DateOfEntry).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{ticket.User.Username}</span>
                        </div>
                      </div>

                      {/* SLA Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">SLA Progress</span>
                          <span className={`font-medium ${ticket.SLAProgress > 80 ? 'text-destructive' : 'text-primary'}`}>
                            {ticket.SLAProgress}%
                          </span>
                        </div>
                        <Progress value={ticket.SLAProgress} className="h-2" />
                      </div>
                    </div>

                    {/* Right: Icon */}
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
                    </div>
                  </div>
                </CardHeader>
              </AccordionTrigger>

              <AccordionContent>
                <CardContent className="pt-0 space-y-6">
                  <Separator />

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Descripción
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {ticket.Description}
                    </p>
                  </div>

                  {/* Assigned Technician */}
                  {ticket.Assign && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Técnico Asignado
                      </h4>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                        <Avatar>
                          <AvatarFallback className="bg-accent text-accent-foreground">
                            {ticket.Assign.Technician.Username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{ticket.Assign.Technician.Username}</p>
                          <p className="text-xs text-muted-foreground">{ticket.Assign.Technician.Email}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {ticket.Assign.Type}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* State Records Timeline */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Historial de Estados
                    </h4>
                    <div className="space-y-2">
                      {ticket.StateRecords.map((record, index) => (
                        <div 
                          key={record.idStateRecord}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 ${getStateColor(record.State).split(' ')[0].replace('bg-', 'bg-').replace('/10', '')}`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{record.State}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(record.DateOfChange).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{record.Observation}</p>
                            {record.Images.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-primary mt-1">
                                <ImageIcon className="w-3 h-3" />
                                <span>{record.Images.length} imagen(es)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Service Review */}
                  {ticket.ServiceReview && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        Valoración del Servicio
                      </h4>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < ticket.ServiceReview.Score ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                            />
                          ))}
                          <span className="text-sm font-medium ml-2">{ticket.ServiceReview.Score}/5</span>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          "{ticket.ServiceReview.Comment}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(ticket.ServiceReview.DateOfReview).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary">{ticket.StateRecords.length}</p>
                      <p className="text-xs text-muted-foreground">Cambios</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-accent">{ticket.SLAProgress}%</p>
                      <p className="text-xs text-muted-foreground">SLA</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary">
                        {Math.floor((new Date() - new Date(ticket.DateOfEntry)) / (1000 * 60 * 60 * 24))}d
                      </p>
                      <p className="text-xs text-muted-foreground">Antigüedad</p>
                    </div>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
