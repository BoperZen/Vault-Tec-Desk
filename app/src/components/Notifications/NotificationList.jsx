import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/context/NotificationContext';
import { useSystemNotifications } from '@/context/SystemNotificationContext';
import NotificationService from '@/services/NotificationService';
import {
  Bell,
  Mail,
  MailOpen,
  User,
  Tag,
  CheckCheck,
  Trash2,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Inbox,
  UserPlus,
  ArrowRightLeft,
  Ticket,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Estados de lectura (de la tabla state)
const STATE_READ = 6;    // Leído
const STATE_UNREAD = 7;  // Sin leer

// Helper para verificar si está leída (comparar como number)
const isRead = (notification) => parseInt(notification.idState) === STATE_READ;

// Configuración de iconos y colores por tipo de evento
const getEventConfig = (event, t) => {
  const eventLower = (event || '').toLowerCase();
  
  if (eventLower.includes('ticket asignado')) {
    return {
      icon: UserPlus,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      label: t('notifications.events.ticketAssigned'),
    };
  }
  if (eventLower.includes('técnico asignado') || eventLower.includes('tecnico asignado')) {
    return {
      icon: UserPlus,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      label: t('notifications.events.technicianAssigned'),
    };
  }
  if (eventLower.includes('cambio de estado') || eventLower.includes('estado')) {
    return {
      icon: ArrowRightLeft,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      label: t('notifications.events.stateChange'),
    };
  }
  if (eventLower.includes('creado') || eventLower.includes('ticket creado')) {
    return {
      icon: Ticket,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      label: t('notifications.events.ticketCreated'),
    };
  }
  if (eventLower.includes('cerrado') || eventLower.includes('resuelto')) {
    return {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      label: t('notifications.events.ticketResolved'),
    };
  }
  // Default
  return {
    icon: Bell,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    label: t('notifications.events.notification'),
  };
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-CR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (dateString, t) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('notifications.time.now');
  if (diffMins < 60) return t('notifications.time.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('notifications.time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('notifications.time.daysAgo', { count: diffDays });
  return formatDate(dateString);
};

export default function NotificationList() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading: loading, 
    markAsRead, 
    markAllAsRead: markAllRead, 
    refresh,
    setPollingEnabled
  } = useSystemNotifications();
  
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [, setTimeUpdate] = useState(0); // Solo para forzar re-render del tiempo

  // Extraer ID del ticket de la descripción
  const extractTicketId = (descripcion) => {
    if (!descripcion) return null;
    const match = descripcion.match(/#(\d+)/);
    return match ? match[1] : null;
  };

  // Obtener el rol del remitente basado en el evento
  const getSenderRole = (notification) => {
    if (!notification.SenderName) return t('notifications.roles.system');
    const eventLower = (notification.Event || '').toLowerCase();
    
    if (eventLower.includes('ticket asignado')) return t('notifications.roles.admin');
    if (eventLower.includes('técnico asignado') || eventLower.includes('tecnico asignado')) return t('notifications.roles.admin');
    if (eventLower.includes('cambio de estado')) {
      // Si el mensaje menciona "Tu ticket" probablemente es el técnico quien cambió
      if (notification.Descripcion?.toLowerCase().includes('tu ticket')) return t('notifications.roles.technician');
      return t('notifications.roles.user');
    }
    if (eventLower.includes('creado')) return t('notifications.roles.system');
    return t('notifications.roles.user');
  };

  // Pausar polling mientras estés en esta página
  useEffect(() => {
    setPollingEnabled(false);
    return () => setPollingEnabled(true);
  }, [setPollingEnabled]);

  // Actualizar tiempo relativo cada 60 segundos (sin recargar datos)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-seleccionar notificación si viene en la URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl && notifications.length > 0) {
      const notification = notifications.find(n => String(n.idNotification) === idFromUrl);
      if (notification) {
        handleSelectNotification(notification);
        // Limpiar el parámetro de la URL
        setSearchParams({}, { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, searchParams]);

  // Mantener sincronizada la notificación seleccionada con el estado del contexto
  useEffect(() => {
    if (selectedNotification) {
      const updated = notifications.find(n => n.idNotification === selectedNotification.idNotification);
      if (updated && updated.idState !== selectedNotification.idState) {
        setSelectedNotification(updated);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  // Refrescar notificaciones
  const loadNotifications = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      await refresh();
    } catch (error) {
      console.error('Error loading notifications:', error);
      showNotification(t('notifications.errors.loadError'), 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Marcar como leída al seleccionar
  const handleSelectNotification = async (notification) => {
    setSelectedNotification(notification);

    // Si no está leída, marcarla (idState !== 6)
    if (!isRead(notification)) {
      try {
        await markAsRead(notification.idNotification);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
      showNotification(t('notifications.messages.allMarkedAsRead'), 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showNotification(t('notifications.errors.markError'), 'error');
    }
  };

  // Eliminar notificación (disponible para uso futuro)
  const _handleDelete = async (idNotification) => {
    try {
      await NotificationService.delete(idNotification);
      if (selectedNotification?.idNotification === idNotification) {
        setSelectedNotification(null);
      }
      await refresh(); // Refrescar la lista desde el contexto
      showNotification(t('notifications.messages.deleted'), 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showNotification(t('notifications.errors.deleteError'), 'error');
    }
  };

  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">{t('notifications.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} ${t('notifications.unread')}` : t('notifications.allRead')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              {t('notifications.markAllAsRead')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Email Style Layout */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
        {/* Lista de Notificaciones (Izquierda) */}
        <Card className="col-span-4 flex flex-col overflow-hidden">
          <CardHeader className="py-3 px-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {t('notifications.inbox')}
              </CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {notifications.length}
              </Badge>
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Inbox className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">{t('notifications.noNotifications')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const config = getEventConfig(notification.Event, t);
                  const IconComponent = config.icon;
                  const isSelected = selectedNotification?.idNotification === notification.idNotification;
                  const isUnread = !isRead(notification);

                  return (
                    <div
                      key={notification.idNotification}
                      onClick={() => handleSelectNotification(notification)}
                      className={`p-3 cursor-pointer transition-all hover:bg-muted/50 border-l-2 ${
                        isSelected ? 'bg-primary/5 border-l-primary' : isUnread ? `${config.bgColor} border-l-transparent` : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Indicador de no leído */}
                        <div className="flex items-center pt-1">
                          {isUnread ? (
                            <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                          ) : (
                            <div className="w-2 h-2" />
                          )}
                        </div>

                        {/* Icono del evento */}
                        <div className={`p-2 rounded-lg shrink-0 ${config.bgColor} border ${config.borderColor}`}>
                          <IconComponent className={`w-4 h-4 ${config.color}`} />
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-semibold ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {formatRelativeTime(notification.DateOf, t)}
                            </span>
                          </div>
                          <p className={`text-sm truncate mt-0.5 ${isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                            {notification.Event || t('notifications.events.notification')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t('notifications.from')}: {notification.SenderName || t('notifications.roles.system')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Detalle de Notificación (Derecha) */}
        <Card className="col-span-8 flex flex-col overflow-hidden">
          {selectedNotification ? (
            (() => {
              const detailConfig = getEventConfig(selectedNotification.Event, t);
              const DetailIcon = detailConfig.icon;
              return (
            <>
              <CardHeader className="py-4 px-6 border-b shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${detailConfig.bgColor} ${detailConfig.borderColor} border`}>
                          <DetailIcon className={`w-6 h-6 ${detailConfig.color}`} />
                        </div>
                    <div>
                      <CardTitle className="text-lg">{selectedNotification.Event || t('notifications.events.notification')}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formatDate(selectedNotification.DateOf)} {t('notifications.at')} {formatTime(selectedNotification.DateOf)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isRead(selectedNotification) ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        <MailOpen className="w-3 h-3 mr-1" />
                        {t('notifications.read')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-primary border-primary">
                        <Mail className="w-3 h-3 mr-1" />
                        {t('notifications.unread')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-6 overflow-auto">
                <div className="space-y-6">
                  {/* Información del remitente */}
                  <div className={`flex items-center gap-4 p-4 rounded-lg border ${detailConfig.bgColor} ${detailConfig.borderColor}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${detailConfig.bgColor} border ${detailConfig.borderColor}`}>
                        <User className={`w-5 h-5 ${detailConfig.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('notifications.from')}: {selectedNotification.SenderName || t('notifications.roles.system')}</p>
                        <p className={`text-xs ${detailConfig.color} font-medium`}>
                          {getSenderRole(selectedNotification)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Descripción principal - más grande */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {t('common.description')}
                    </h3>
                    <div className={`p-6 rounded-xl bg-gradient-to-br from-card to-muted/20 border-2 ${detailConfig.borderColor} min-h-[120px]`}>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {selectedNotification.Descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Botón Ver Ticket */}
                  {extractTicketId(selectedNotification.Descripcion) && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-dashed">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                        onClick={() => navigate(`/tickets?ticketId=${extractTicketId(selectedNotification.Descripcion)}`)}
                      >
                        <Eye className="w-4 h-4" />
                        {t('notifications.viewTicket')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
              );
            })()
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Mail className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">{t('notifications.selectNotification')}</p>
              <p className="text-sm">{t('notifications.selectNotificationDesc')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
