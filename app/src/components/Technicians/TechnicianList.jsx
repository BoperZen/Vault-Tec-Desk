import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/context/NotificationContext';
import { 
  User, 
  Mail, 
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
  ChevronDown,
  Calendar,
  Briefcase,
  Target,
  Plus,
} from 'lucide-react';
import TechnicianService from '@/services/TechnicianService';
import TicketService from '@/services/TicketService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTechnicianAvatarUrl } from '@/hooks/use-avatar';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Funciones para determinar estado basado en WorkLoad (0-5)
const getWorkloadStatusColor = (workload) => {
  if (workload === 0) return 'bg-green-500/10 text-green-600 border-green-500/20';
  if (workload <= 2) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  if (workload <= 4) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
  return 'bg-red-500/10 text-red-600 border-red-500/20';
};

const getWorkloadStatusIcon = (workload) => {
  if (workload === 0) return { icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' };
  if (workload <= 2) return { icon: CheckCircle2, color: 'text-blue-500 bg-blue-500/10' };
  if (workload <= 4) return { icon: Clock, color: 'text-yellow-500 bg-yellow-500/10' };
  return { icon: AlertCircle, color: 'text-red-500 bg-red-500/10' };
};

const getWorkloadStatusTextKey = (workload) => {
  if (workload === 0) return 'technicians.workload.available';
  if (workload <= 2) return 'technicians.workload.lowLoad';
  if (workload <= 4) return 'technicians.workload.busy';
  return 'technicians.workload.notAvailable';
};

const getWorkloadColor = (workload) => {
  if (workload <= 2) return 'text-muted-foreground';
  if (workload <= 3) return 'text-muted-foreground';
  return 'text-red-600';
};

const getWorkloadBgColor = (workload) => {
  if (workload <= 2) return 'text-muted-foreground';
  if (workload <= 3) return 'text-muted-foreground';
  return 'bg-red-500';
};

const getWorkloadLabelKey = (workload) => {
  if (workload === 0) return 'technicians.workload.noLoad';
  if (workload <= 2) return 'technicians.workload.lowLoad';
  if (workload <= 3) return 'technicians.workload.mediumLoad';
  if (workload <= 4) return 'technicians.workload.highLoad';
  return 'technicians.workload.maxLoad';
};

export default function TechnicianList() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTech, setExpandedTech] = useState(null);
  const [ticketStats, setTicketStats] = useState({});

  // Mostrar notificación si viene del formulario de creación/edición
  useEffect(() => {
    if (location.state?.notification) {
      const { message, type } = location.state.notification;
      showNotification(message, type);
      // Limpiar el estado para que no se muestre de nuevo al recargar
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar técnicos y tickets en paralelo
      const [techResponse, ticketResponse] = await Promise.all([
        TechnicianService.getTechnicians(),
        TicketService.getTickets()
      ]);

      if (techResponse.data.success && ticketResponse.data.success) {
        const techData = techResponse.data.data;
        const tickets = ticketResponse.data.data;

        // Calcular estadísticas por técnico
        const stats = {};
        tickets.forEach(ticket => {
          if (ticket.Assign && ticket.Assign.Technician) {
            const techId = ticket.Assign.Technician.idTechnician;
            if (!stats[techId]) {
              stats[techId] = {
                assigned: 0,
                resolved: 0,
                inProgress: 0
              };
            }
            
            stats[techId].assigned++;
            
            if (ticket.State === 'Resuelto' || ticket.State === 'Cerrado') {
              stats[techId].resolved++;
            } else if (ticket.State === 'En Proceso') {
              stats[techId].inProgress++;
            }
          }
        });

        setTicketStats(stats);
        setTechnicians(techData);
      } else {
        setError(t('technicians.messages.loadError'));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(t('errors.networkError'));
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

        {/* Technicians Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-32 bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-muted animate-pulse rounded-md" />
                      <div className="h-5 w-20 bg-muted animate-pulse rounded-md" />
                    </div>
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
    <div className="space-y-6 container mx-auto px-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('technicians.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('technicians.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/technicians/create')}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('technicians.createTechnician')}
          </Button>
          <Badge variant="outline" className="text-sm px-4 py-2">
            {technicians.length} {t('technicians.technicianCount')}
          </Badge>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {t('technicians.stats.noLoad')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {technicians.filter(tech => parseInt(tech.WorkLoad || 0) === 0).length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              {t('technicians.stats.mediumLoad')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {technicians.filter(tech => {
                const wl = parseInt(tech.WorkLoad || 0);
                return wl >= 1 && wl <= 3;
              }).length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              {t('technicians.stats.maxLoad')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {technicians.filter(tech => parseInt(tech.WorkLoad || 0) >= 4).length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              {t('technicians.stats.averageLoad')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent">
              {technicians.length > 0 
                ? (technicians.reduce((acc, t) => acc + parseInt(t.WorkLoad || 0), 0) / technicians.length).toFixed(1)
                : 0}
              <span className="text-sm font-normal text-muted-foreground">/5</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technicians Grid with Collapsible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => {
          const workload = parseInt(tech.WorkLoad || 0);
          const WorkloadIcon = getWorkloadStatusIcon(workload).icon;
          const iconColor = getWorkloadStatusIcon(workload).color;
          const workloadPercent = (workload / 5) * 100;

          const stats = ticketStats[tech.idTechnician] || { assigned: 0, resolved: 0, inProgress: 0 };
          const totalTickets = stats.assigned;

          return (
            <Collapsible
              key={tech.idTechnician}
              open={expandedTech === tech.idTechnician}
              onOpenChange={() => setExpandedTech(expandedTech === tech.idTechnician ? null : tech.idTechnician)}
              className="w-full"
            >
              <Card className="overflow-hidden hover:shadow-lg hover:shadow-vault-glow/20 transition-all duration-300">
                <CollapsibleTrigger className="w-full text-left">
                  <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-2 border-accent/20">
                          <AvatarImage src={getTechnicianAvatarUrl(tech)} />
                          <AvatarFallback className="bg-accent/10 text-accent text-lg font-bold">
                            {tech.Username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {/* Status indicator based on workload */}
                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${iconColor} border-2 border-background`}>
                          <WorkloadIcon className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg truncate">{tech.Username}</CardTitle>
                          <ChevronDown 
                            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                              expandedTech === tech.idTechnician ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{tech.Email}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getWorkloadStatusColor(workload)}>
                            {t(getWorkloadStatusTextKey(workload))}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            #{tech.idTechnician}
                          </Badge>
                        </div>

                        {/* Workload Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{t('technicians.fields.workload')}</span>
                            <span className={`font-semibold ${getWorkloadColor(workload)}`}>
                              {workload}/5 · {t(getWorkloadLabelKey(workload))}
                            </span>
                          </div>
                          <Progress 
                            value={workloadPercent} 
                            className="h-2"
                            indicatorClassName={getWorkloadBgColor(workload)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    <Separator />

                    {/* Specialties */}
                    {tech.Specialties && tech.Specialties.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-accent" />
                          {t('technicians.details.specialties')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tech.Specialties.map((specialty, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className="bg-accent/10 text-accent border-accent/20"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="border-border/50 bg-muted/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>{t('technicians.details.lastSession')}</span>
                          </div>
                          <p className="text-sm font-medium truncate">
                            {tech.LastSesion && !isNaN(new Date(tech.LastSesion).getTime())
                              ? new Date(tech.LastSesion).toLocaleDateString()
                              : t('technicians.details.noSession')}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-border/50 bg-muted/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{t('technicians.details.role')}</span>
                          </div>
                          <p className="text-sm font-medium">
                            {tech.idRol === '1' ? t('technicians.roles.technician') : tech.idRol === '2' ? t('technicians.roles.client') : t('technicians.roles.admin')}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Performance Metrics */}
                    <Card className="border-border/50 bg-muted/20">
                      <CardHeader className="pb-3">
                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-primary" />
                          {t('technicians.details.performanceMetrics')}
                        </h4>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg bg-background/50">
                            <p className="text-xl font-bold text-primary">{totalTickets}</p>
                            <p className="text-[10px] text-muted-foreground">{t('technicians.metrics.totalTickets')}</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-background/50">
                            <p className="text-xl font-bold text-green-600">{stats.resolved}</p>
                            <p className="text-[10px] text-muted-foreground">{t('technicians.metrics.resolved')}</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-background/50">
                            <p className="text-xl font-bold text-orange-600">{stats.inProgress}</p>
                            <p className="text-[10px] text-muted-foreground">{t('technicians.metrics.inProgress')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Actions */}
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        onClick={() => navigate(`/technicians/edit/${tech.idTechnician}`)}
                      >
                        {t('technicians.editTechnician')}
                      </button>
                      <button className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                        {t('technicians.viewTickets')}
                      </button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
