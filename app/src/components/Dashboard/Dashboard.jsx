import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Ticket, Users, Settings, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useRole } from '@/hooks/use-role';
import TicketService from '@/services/TicketService';
import TechnicianService from '@/services/TechnicianService';

export default function Dashboard() {
  const { t } = useTranslation();
  const { currentUser, technicianProfile, isTechnicianLoading } = useUser();
  const { isAdmin, isTechnician } = useRole();
  const technicianId = technicianProfile?.idTechnician;
  const userId = currentUser?.idUser;
  const technicianNumericId = Number(technicianId);
  const [stats, setStats] = useState({
    totalTickets: 0,
    myTickets: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0,
    technicians: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentTickets, setRecentTickets] = useState([]);

  const loadStats = useCallback(async () => {
    if (isTechnician && (isTechnicianLoading || !Number.isFinite(technicianNumericId))) {
      return;
    }

    try {
      setLoading(true);
      const promises = [TicketService.getTickets()];
      
      if (isAdmin) {
        promises.push(TechnicianService.getTechnicians());
      }
      
      const responses = await Promise.all(promises);
      const ticketResponse = responses[0];
      
      if (ticketResponse.data.success) {
        const allTickets = ticketResponse.data.data;
        const currentUserId = Number(userId);
        
        let myTickets = allTickets;
        if (isTechnician) {
          // Filtrar solo los tickets asignados al técnico
          myTickets = allTickets.filter(
            ticket => Number(ticket.Assign?.Technician?.idTechnician) === technicianNumericId
          );
        } else if (!isAdmin) {
          // Cliente: solo sus tickets creados
          myTickets = allTickets.filter(
            ticket => Number(ticket.User?.idUser) === currentUserId
          );
        }
        
        setStats({
          totalTickets: allTickets.length,
          myTickets: myTickets.length,
          resolved: myTickets.filter(t => t.State === 'Resuelto' || t.State === 'Cerrado').length,
          inProgress: myTickets.filter(t => t.State === 'En Proceso').length,
          pending: myTickets.filter(t => t.State === 'Pendiente' || t.State === 'Asignado').length,
          technicians: isAdmin && responses[1]?.data.success ? responses[1].data.data.length : 0,
        });

        // Guardar los últimos 5 tickets para clientes
        if (!isAdmin && !isTechnician) {
          const sortedTickets = [...myTickets].sort((a, b) => 
            new Date(b.DateCreated) - new Date(a.DateCreated)
          );
          setRecentTickets(sortedTickets.slice(0, 5));
        }
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isTechnician, technicianNumericId, userId, isTechnicianLoading]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Contenedor centrado */}
      <div className="flex flex-col items-center justify-center px-8 py-12">
        <div className="container max-w-7xl w-full space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-full max-w-xs sm:max-w-md md:max-w-xl h-48 sm:h-64 md:h-80 mb-1">
              <img 
                src="/vault-tec-logo.svg" 
                alt="Vault-Tec Logo" 
                className="w-full h-full object-contain drop-shadow-lg hover:scale-105 transition-transform"
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('dashboard.welcome')}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('dashboard.subtitle')} <span className="text-primary font-semibold">{currentUser.username}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Tickets Card - Todos los roles */}
          <Card className="group hover:shadow-lg hover:shadow-vault-glow/50 transition-all duration-300 border-border/50 hover:border-primary/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{isTechnician ? t('dashboard.quickActions.tickets.myTickets') : t('dashboard.quickActions.tickets.title')}</CardTitle>
              <CardDescription>
                {isTechnician 
                  ? t('dashboard.quickActions.tickets.techDescription')
                  : t('dashboard.quickActions.tickets.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tickets">
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  {t('dashboard.quickActions.tickets.button')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Calendario Card - Todos los roles */}
          <Card className="group hover:shadow-lg hover:shadow-vault-glow/50 transition-all duration-300 border-border/50 hover:border-accent/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>{t('dashboard.quickActions.calendar.title')}</CardTitle>
              <CardDescription>
                {isTechnician 
                  ? t('dashboard.quickActions.calendar.techDescription')
                  : t('dashboard.quickActions.calendar.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/calendar">
                <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent">
                  {t('dashboard.quickActions.calendar.button')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Técnicos Card - Solo Admin */}
          {isAdmin ? (
            <Card className="group hover:shadow-lg hover:shadow-vault-glow/50 transition-all duration-300 border-border/50 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t('dashboard.quickActions.technicians.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.quickActions.technicians.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/technicians">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                    {t('dashboard.quickActions.technicians.button')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            /* Configuración Card - Técnicos y Clientes */
            <Card className="group hover:shadow-lg hover:shadow-vault-glow/50 transition-all duration-300 border-border/50 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-muted/80 transition-colors">
                  <Settings className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle>{t('dashboard.quickActions.settings.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.quickActions.settings.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/settings">
                  <Button variant="outline" className="w-full">
                    {t('dashboard.quickActions.settings.button')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>

    {/* Divider que llega al borde */}
    <div className="w-full border-t-2 border-border/50 my-8"></div>

    {/* Dashboard Stats Section - Full width */}
    <div className="px-8 pb-2">
      <div className="container max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('dashboard.systemStats')}</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isTechnician ? t('dashboard.stats.myAssignedTickets') : isAdmin ? t('dashboard.stats.totalTickets') : t('dashboard.stats.myTickets')}
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.myTickets}</div>
              <p className="text-xs text-muted-foreground">
                {isTechnician ? t('dashboard.stats.underResponsibility') : isAdmin ? t('dashboard.stats.inSystem') : t('dashboard.stats.ticketsCreated')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.stats.resolved')}</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{loading ? '...' : stats.resolved}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.stats.ticketsCompleted')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.stats.inProgress')}</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{loading ? '...' : stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.stats.activeDevelopment')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Technician Stats */}
        {isTechnician && !isAdmin && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.stats.pendingAttention')}</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{loading ? '...' : stats.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.stats.requireAttention')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.stats.resolutionRate')}</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {loading ? '...' : stats.myTickets > 0 ? `${Math.round((stats.resolved / stats.myTickets) * 100)}%` : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.stats.ofAssigned')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart and Info Section for Technicians */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Chart Card */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">{t('dashboard.charts.myAssignedTickets')}</CardTitle>
                  <CardDescription>{t('dashboard.charts.distributionByState')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Resueltos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">{t('dashboard.stats.resolved')}</span>
                        </div>
                        <span className="text-muted-foreground">{loading ? '...' : stats.resolved}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: loading ? '0%' : `${stats.myTickets > 0 ? (stats.resolved / stats.myTickets) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* En Proceso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium">{t('dashboard.stats.inProgress')}</span>
                        </div>
                        <span className="text-muted-foreground">{loading ? '...' : stats.inProgress}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: loading ? '0%' : `${stats.myTickets > 0 ? (stats.inProgress / stats.myTickets) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Pendientes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="font-medium">{t('dashboard.stats.pending')}</span>
                        </div>
                        <span className="text-muted-foreground">{loading ? '...' : stats.pending}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: loading ? '0%' : `${stats.myTickets > 0 ? (stats.pending / stats.myTickets) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{t('dashboard.charts.totalAssigned')}</span>
                        <span className="text-2xl font-bold text-primary">{loading ? '...' : stats.myTickets}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="md:col-span-1 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
                <CardHeader>
                  <CardTitle className="text-lg">{t('dashboard.charts.myPerformance')}</CardTitle>
                  <CardDescription>{t('dashboard.charts.workMetrics')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('dashboard.charts.completed')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.charts.resolvedTickets')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-500">
                      {loading ? '...' : stats.resolved}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('dashboard.charts.inAttention')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.charts.workingNow')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-yellow-500">
                      {loading ? '...' : stats.inProgress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('dashboard.stats.pendingAttention')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.stats.waiting')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-orange-500">
                      {loading ? '...' : stats.pending}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Additional Admin Stats */}
        {isAdmin && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.admin.activeTechnicians')}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.technicians}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.admin.availableForAssignment')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.stats.pending')}</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{loading ? '...' : stats.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.stats.awaitingAttention')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart and Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Chart Card */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">{t('dashboard.charts.ticketDistribution')}</CardTitle>
                  <CardDescription>{t('dashboard.charts.currentState')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Resueltos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">{t('dashboard.stats.resolved')}</span>
                        </div>
                        <span className="text-muted-foreground">{loading ? '...' : stats.resolved}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: loading ? '0%' : `${stats.totalTickets > 0 ? (stats.resolved / stats.totalTickets) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* En Proceso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium">{t('dashboard.stats.inProgress')}</span>
                        </div>
                        <span className="text-muted-foreground">{loading ? '...' : stats.inProgress}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: loading ? '0%' : `${stats.totalTickets > 0 ? (stats.inProgress / stats.totalTickets) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Pendientes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="font-medium">{t('dashboard.stats.pending')}</span>
                        </div>
                        <span className="text-muted-foreground">{loading ? '...' : stats.pending}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: loading ? '0%' : `${stats.totalTickets > 0 ? (stats.pending / stats.totalTickets) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{t('dashboard.stats.totalTickets')}</span>
                        <span className="text-2xl font-bold text-primary">{loading ? '...' : stats.totalTickets}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="md:col-span-1 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
                <CardHeader>
                  <CardTitle className="text-lg">{t('dashboard.charts.systemSummary')}</CardTitle>
                  <CardDescription>{t('dashboard.charts.generalInfo')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('dashboard.stats.resolutionRate')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.stats.ticketsCompleted')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-500">
                      {loading ? '...' : stats.totalTickets > 0 ? `${Math.round((stats.resolved / stats.totalTickets) * 100)}%` : '0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('dashboard.stats.inProgressLabel')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.stats.activeTickets')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-yellow-500">
                      {loading ? '...' : stats.totalTickets > 0 ? `${Math.round((stats.inProgress / stats.totalTickets) * 100)}%` : '0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('dashboard.admin.averageLoad')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.admin.perTechnician')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      {loading ? '...' : stats.technicians > 0 ? `${Math.round(stats.totalTickets / stats.technicians)}` : '0'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Client-specific Section */}
        {!isAdmin && !isTechnician && (
          <>
            {/* Client Chart and Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Chart Card */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">{t('dashboard.client.myTicketsStatus')}</CardTitle>
                  <CardDescription>{t('dashboard.client.requestDistribution')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Resueltos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">{t('dashboard.stats.resolved')}</span>
                        </div>
                        <span className="text-muted-foreground">{loading ? '...' : stats.resolved}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: loading ? '0%' : `${stats.myTickets > 0 ? (stats.resolved / stats.myTickets) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* En Proceso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium">{t('dashboard.stats.inProgress')}</span>
                        </div>
                        <span className="text-muted-foreground">{loading ? '...' : stats.inProgress}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: loading ? '0%' : `${stats.myTickets > 0 ? (stats.inProgress / stats.myTickets) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Pendientes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="font-medium">{t('dashboard.stats.pending')}</span>
                        </div>
                        <span className="text-muted-foreground">{loading ? '...' : stats.pending}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: loading ? '0%' : `${stats.myTickets > 0 ? (stats.pending / stats.myTickets) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{t('dashboard.client.totalMyTickets')}</span>
                        <span className="text-2xl font-bold text-primary">{loading ? '...' : stats.myTickets}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="md:col-span-1 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
                <CardHeader>
                  <CardTitle className="text-lg">{t('dashboard.client.supportInfo')}</CardTitle>
                  <CardDescription>{t('dashboard.client.statusAndResponse')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('dashboard.stats.resolutionRate')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.client.problemsResolved')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-500">
                      {loading ? '...' : stats.myTickets > 0 ? `${Math.round((stats.resolved / stats.myTickets) * 100)}%` : '0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('dashboard.client.inAttention')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.stats.activeTickets')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-yellow-500">
                      {loading ? '...' : stats.inProgress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('dashboard.client.waiting')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.client.toBeAssigned')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-orange-500">
                      {loading ? '...' : stats.pending}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tickets List */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.client.latestTickets')}</CardTitle>
                <CardDescription>{t('dashboard.client.recentRequests')}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : recentTickets.length > 0 ? (
                  <div className="space-y-3">
                    {recentTickets.map(ticket => (
                      <div 
                        key={ticket.idTicket} 
                        className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-2 h-2 rounded-full ${
                            ticket.State === 'Resuelto' || ticket.State === 'Cerrado' ? 'bg-green-500' :
                            ticket.State === 'En Proceso' ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{ticket.Title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {ticket.Category?.Name || t('dashboard.client.noCategory')} • {new Date(ticket.DateCreated).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            ticket.State === 'Resuelto' || ticket.State === 'Cerrado' ? 'bg-green-500/10 text-green-500' :
                            ticket.State === 'En Proceso' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {ticket.State}
                          </span>
                          <Link to={`/tickets`}>
                            <Button variant="ghost" size="sm">
                              {t('dashboard.client.view')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('dashboard.client.noTicketsYet')}</p>
                    <p className="text-sm mt-1">{t('dashboard.client.createFirstTicket')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  </div>
  );
}
