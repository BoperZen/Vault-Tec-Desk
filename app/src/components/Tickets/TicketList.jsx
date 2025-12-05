import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  Plus,
  Edit3,
  Search,
  X,
  Zap,
} from 'lucide-react';
import { useRole } from '@/hooks/use-role';
import { useUser } from '@/context/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '@/context/NotificationContext';
import { useSystemNotifications } from '@/context/SystemNotificationContext';
import TicketService from '@/services/TicketService';
import TechnicianService from '@/services/TechnicianService';
import StateService from '@/services/StateService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTechnicianAvatarUrl, getTechnicianInitials } from '@/hooks/use-avatar';
import { StateProgress } from '@/components/ui/state-progress';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  formatUtcToLocalDate,
  formatUtcToLocalTime,
  formatUtcToLocalDateTime,
} from '@/lib/utils';
import StateUpdateDialog from '@/components/Tickets/StateUpdateDialog';
import AssignmentDialog from '@/components/Tickets/AssignmentDialog';
import ServiceReviewDialog from '@/components/Tickets/ServiceReviewDialog';
import AssignService from '@/services/AssignService';

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

const formatSlaTime = (dateString) => formatUtcToLocalTime(dateString);

const formatSlaDate = (dateString) => formatUtcToLocalDate(dateString);

const formatDateTimeForDB = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return formatDateTimeForDB(new Date());
  }

  const pad = (num) => String(num).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export default function TicketList() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, isLoadingRole } = useRole();
  const { currentUser, technicianProfile, isTechnicianLoading } = useUser();
  const { showNotification } = useNotification();
  const { refresh: refreshSystemNotifications } = useSystemNotifications();
  const technicianId = technicianProfile?.idTechnician;
  const technicianNumericId = Number(technicianId);
  const currentUserId = currentUser?.idUser;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [states, setStates] = useState([]);
  const [isStateDialogOpen, setIsStateDialogOpen] = useState(false);
  const [stateDialogTicket, setStateDialogTicket] = useState(null);
  const [isUpdatingState, setIsUpdatingState] = useState(false);
  const [pendingTicketId, setPendingTicketId] = useState(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignDialogTicket, setAssignDialogTicket] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewDialogTicket, setReviewDialogTicket] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const canCreateTickets = !isLoadingRole && (role === 2 || role === 3);
  const isAdmin = role === 3;

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
    if (isLoadingRole) return;
    if (role === 1 && (isTechnicianLoading || !Number.isFinite(technicianNumericId))) return;
    if (role === 2 && !currentUserId) return;
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location.pathname,
    role,
    isLoadingRole,
    technicianId,
    isTechnicianLoading,
    currentUserId,
    technicianNumericId,
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchStates = async () => {
      try {
        const response = await StateService.getStates();
        if (response.data?.success && isMounted) {
          setStates(response.data.data || []);
        }
      } catch (stateError) {
        console.error('Error loading states:', stateError);
      }
    };

    fetchStates();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ticketParam = params.get('ticketId');
    if (ticketParam) {
      const numericId = Number(ticketParam);
      if (Number.isFinite(numericId)) {
        setPendingTicketId(numericId);
      }
    }
  }, [location.search]);

  useEffect(() => {
    if (!pendingTicketId || tickets.length === 0) {
      return;
    }

    const match = tickets.find((ticket) => Number(ticket.idTicket) === Number(pendingTicketId));
    if (!match) {
      return;
    }

    setExpandedTicket(match.idTicket);
    const node = document.getElementById(`ticket-${match.idTicket}`);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      node.classList.add('ring', 'ring-primary/40', 'ring-offset-2', 'ring-offset-background');
      setTimeout(() => {
        node.classList.remove('ring', 'ring-primary/40', 'ring-offset-2', 'ring-offset-background');
      }, 2000);
    }

    setPendingTicketId(null);
  }, [pendingTicketId, tickets]);



  /**
   * Las horas restantes ahora vienen calculadas desde el backend
   * usando la hora del servidor de base de datos, no la hora del cliente
   */

  /**
   * Carga los tickets desde la API y aplica filtros según el rol del usuario
   * - Admin: Ve todos los tickets
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
          if (!Number.isFinite(technicianNumericId)) {
            setTickets([]);
            return;
          }
          // Técnicos: Ver solo sus tickets asignados (siempre)
          allTickets = allTickets.filter(
            ticket => Number(ticket.Assign?.Technician?.idTechnician) === technicianNumericId
          );
        } else if (role === 2) {
          // Clientes: Ver SIEMPRE solo sus propios tickets (sin importar la ruta)
          const clientId = Number(currentUserId);
            if (!Number.isFinite(clientId)) {
              setTickets([]);
              return;
            }
            allTickets = allTickets.filter(
            ticket => Number(ticket.User?.idUser) === clientId
          );
        }
        // Admin (role === 3): Ve todos los tickets sin filtro adicional
        
        setTickets(allTickets);
        
        // Guardar técnicos si es admin
        if (role === 3 && responses[1]?.data.success) {
          setTechnicians(responses[1].data.data);
        }
      } else {
        setError(t('tickets.messages.loadError'));
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
      console.error('Error details:', err.message);
      console.error('Error stack:', err.stack);
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const getAllowedStatesForTicket = (ticket) => {
    if (!ticket || !Array.isArray(states) || states.length === 0) {
      return [];
    }

    const currentStateId = Number(ticket.idState);
    if (!Number.isFinite(currentStateId)) {
      return [];
    }

    if (role === 3) {
      return states;
    }

    if (role === 1) {
      const transitions = {
        2: [3],
        3: [4],
      };
      const allowedIds = transitions[currentStateId] || [];
      return states.filter((state) => allowedIds.includes(Number(state.idState)));
    }

    if (role === 2) {
      if (currentStateId === 4) {
        return states.filter((state) => Number(state.idState) === 5);
      }
      return [];
    }

    return [];
  };

  const dialogStateOptions = useMemo(
    () => getAllowedStatesForTicket(stateDialogTicket),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateDialogTicket, states, role]
  );

  // Búsqueda avanzada con filtrado inteligente
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;

    const query = searchQuery.toLowerCase().trim();
    
    // Detectar si busca por ID (#123 o solo 123)
    const idMatch = query.match(/^#?(\d+)$/);
    if (idMatch) {
      const searchId = parseInt(idMatch[1]);
      return tickets.filter(ticket => ticket.idTicket === searchId);
    }

    return tickets.filter(ticket => {
      // Buscar en título
      if (ticket.Title?.toLowerCase().includes(query)) return true;
      
      // Buscar en descripción
      if (ticket.Description?.toLowerCase().includes(query)) return true;
      
      // Buscar en estado
      if (ticket.State?.toLowerCase().includes(query)) return true;
      
      // Buscar en categoría
      if (ticket.Category?.toLowerCase().includes(query)) return true;
      
      // Buscar en nombre de usuario/cliente
      if (ticket.User?.Username?.toLowerCase().includes(query)) return true;
      
      // Buscar en nombre de técnico asignado
      if (ticket.Assign?.Technician?.Username?.toLowerCase().includes(query)) return true;
      
      // Buscar en email del técnico
      if (ticket.Assign?.Technician?.Email?.toLowerCase().includes(query)) return true;

      return false;
    });
  }, [tickets, searchQuery]);

  const openStateDialog = (ticket) => {
    const allowedStates = getAllowedStatesForTicket(ticket);
    if (allowedStates.length === 0) {
      showNotification(t('tickets.stateUpdate.noChangesAvailable'), 'warning');
      return;
    }

    setStateDialogTicket(ticket);
    setIsStateDialogOpen(true);
  };

  const openAssignDialog = (ticket) => {
    setAssignDialogTicket(ticket);
    setIsAssignDialogOpen(true);
  };

  const handleAssignment = async (assignmentData) => {
    if (!assignDialogTicket || !currentUser?.idUser) {
      showNotification(t('tickets.assignment.assignError'), 'error');
      return;
    }

    setIsAssigning(true);
    try {
      const payload = {
        idTicket: assignDialogTicket.idTicket,
        StateObservation: assignmentData.observation,
        idUser: Number(currentUser.idUser),
        DateOfAssign: formatDateTimeForDB(),
        idTechnician: assignmentData.technicianId,
        PriorityScore: assignmentData.priorityScore,
      };

      // Si es asignación automática, incluir el idWorkFlowRules
      if (assignmentData.method === 'automatic' && assignmentData.idWorkFlowRules) {
        payload.idWorkFlowRules = assignmentData.idWorkFlowRules;
      }

      if (assignmentData.evidence) {
        payload.StateImages = [assignmentData.evidence];
      }

      // Usar siempre createAssignment ya que ahora incluimos el técnico desde el auto-triage
      const response = await AssignService.createAssignment(payload);

      if (response.data?.success) {
        const updatedTicket = response.data.data;
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.idTicket === updatedTicket.idTicket ? updatedTicket : ticket
          )
        );
        
        // Recargar técnicos para actualizar el workload en tiempo real
        if (role === 3) {
          try {
            const techResponse = await TechnicianService.getTechnicians();
            if (techResponse.data?.success) {
              setTechnicians(techResponse.data.data);
            }
          } catch (techError) {
            console.error('Error al recargar técnicos:', techError);
          }
        }
        
        // Refrescar notificaciones del sistema inmediatamente
        refreshSystemNotifications();
        
        showNotification(t('tickets.assignment.assignSuccess'), 'success');
        setIsAssignDialogOpen(false);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      setIsAssignDialogOpen(false);
      showNotification(t('tickets.assignment.assignError'), 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  /**
   * Función para ejecutar auto-triage en un ticket específico
   * Retorna el técnico adecuado y la regla aplicada, o null si no hay match
   */
  const executeAutoTriageForTicket = async (ticket, rules, availableTechs) => {
    const ticketCategoryId = Number(ticket.idCategory);
    const requiredSpecialtyIds = ticket.CategoryData?.SpecialtyIds || [];
    const hasSpecialtyRequirements = Array.isArray(requiredSpecialtyIds) && requiredSpecialtyIds.length > 0;

    // Filtrar técnicos disponibles para este ticket
    const filteredTechs = availableTechs.filter((tech) => {
      const workload = parseInt(tech.WorkLoad || 0);
      if (workload >= 5) return false;

      if (hasSpecialtyRequirements) {
        const techSpecialtyIds = tech.SpecialtyIds || [];
        const requirements = requiredSpecialtyIds.map((id) => Number(id));
        return requirements.some((reqId) =>
          techSpecialtyIds.some((techId) => Number(techId) === reqId)
        );
      }
      return true;
    });

    if (filteredTechs.length === 0) return null;

    // Iterar por las reglas en orden de prioridad
    for (const rule of rules) {
      const ruleCategory = rule.idCategory ? Number(rule.idCategory) : null;
      const ruleSpecialty = rule.idSpecialty ? Number(rule.idSpecialty) : null;
      const ruleWorkLoad = rule.WorkLoad !== null ? Number(rule.WorkLoad) : null;

      if (ruleCategory !== null && ruleCategory !== ticketCategoryId) {
        continue;
      }

      for (const tech of filteredTechs) {
        const techWorkLoad = parseInt(tech.WorkLoad || 0);
        const techSpecialtyIds = (tech.SpecialtyIds || []).map(id => Number(id));

        if (ruleWorkLoad !== null && techWorkLoad > ruleWorkLoad) {
          continue;
        }

        if (ruleSpecialty !== null && !techSpecialtyIds.includes(ruleSpecialty)) {
          continue;
        }

        if (hasSpecialtyRequirements) {
          const reqIds = requiredSpecialtyIds.map(id => Number(id));
          const hasRequired = reqIds.some(reqId => techSpecialtyIds.includes(reqId));
          if (!hasRequired) {
            continue;
          }
        }

        return { technician: tech, rule: rule };
      }
    }

    return null;
  };

  /**
   * Asignación automática masiva de todos los tickets pendientes
   */
  const handleBulkAutoAssign = async () => {
    if (!currentUser?.idUser) {
      showNotification(t('errors.unauthorized'), 'error');
      return;
    }

    // Filtrar tickets pendientes (idState = 1)
    const pendingTickets = tickets.filter(ticket => Number(ticket.idState) === 1);

    if (pendingTickets.length === 0) {
      showNotification(t('tickets.bulkAssign.noPendingTickets'), 'info');
      return;
    }

    setIsBulkAssigning(true);
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    try {
      // Obtener reglas de workflow
      const rulesResponse = await AssignService.getWorkFlowRules();
      if (!rulesResponse.data?.success || !rulesResponse.data?.data) {
        showNotification(t('tickets.bulkAssign.rulesError'), 'error');
        setIsBulkAssigning(false);
        return;
      }

      const rules = rulesResponse.data.data;
      
      // Obtener técnicos actualizados
      const techResponse = await TechnicianService.getTechnicians();
      if (!techResponse.data?.success) {
        showNotification(t('tickets.bulkAssign.techniciansError'), 'error');
        setIsBulkAssigning(false);
        return;
      }

      let currentTechnicians = techResponse.data.data;

      // Procesar cada ticket pendiente
      for (const ticket of pendingTickets) {
        try {
          const triageResult = await executeAutoTriageForTicket(ticket, rules, currentTechnicians);

          if (!triageResult) {
            skippedCount++;
            continue;
          }

          const basePriority = ticket.idPriority || 2;
          const slaHoursRemaining = ticket.SLA?.ResolutionHoursRemaining || 0;
          const priorityScore = Math.round((basePriority * 1000) - slaHoursRemaining);

          const payload = {
            idTicket: ticket.idTicket,
            StateObservation: t('tickets.bulkAssign.autoAssignmentObservation', { 
              ruleId: triageResult.rule?.idWorkFlowRules 
            }),
            idUser: Number(currentUser.idUser),
            DateOfAssign: formatDateTimeForDB(),
            idTechnician: triageResult.technician.idTechnician,
            PriorityScore: priorityScore,
            idWorkFlowRules: triageResult.rule?.idWorkFlowRules,
          };

          const response = await AssignService.createAssignment(payload);

          if (response.data?.success) {
            successCount++;
            // Actualizar workload local del técnico asignado
            currentTechnicians = currentTechnicians.map(tech => {
              if (tech.idTechnician === triageResult.technician.idTechnician) {
                return { ...tech, WorkLoad: (parseInt(tech.WorkLoad || 0) + 1).toString() };
              }
              return tech;
            });
          } else {
            errorCount++;
          }
        } catch (ticketError) {
          console.error(`Error asignando ticket ${ticket.idTicket}:`, ticketError);
          errorCount++;
        }
      }

      // Recargar datos
      await loadTickets();
      
      // Actualizar lista de técnicos
      if (role === 3) {
        try {
          const updatedTechResponse = await TechnicianService.getTechnicians();
          if (updatedTechResponse.data?.success) {
            setTechnicians(updatedTechResponse.data.data);
          }
        } catch (techError) {
          console.error('Error al recargar técnicos:', techError);
        }
      }

      // Refrescar notificaciones del sistema
      refreshSystemNotifications();

      // Mostrar resultado
      if (successCount > 0 && errorCount === 0 && skippedCount === 0) {
        showNotification(t('tickets.bulkAssign.allSuccess', { count: successCount }), 'success');
      } else if (successCount > 0) {
        showNotification(
          t('tickets.bulkAssign.partialSuccess', { 
            success: successCount, 
            skipped: skippedCount, 
            errors: errorCount 
          }), 
          'warning'
        );
      } else if (skippedCount > 0) {
        showNotification(t('tickets.bulkAssign.noMatchingTechnicians'), 'warning');
      } else {
        showNotification(t('tickets.bulkAssign.allFailed'), 'error');
      }

    } catch (error) {
      console.error('Error en asignación masiva:', error);
      showNotification(t('tickets.bulkAssign.error'), 'error');
    } finally {
      setIsBulkAssigning(false);
    }
  };

  // Contar tickets pendientes para mostrar en el botón
  const pendingTicketsCount = useMemo(() => {
    return tickets.filter(ticket => Number(ticket.idState) === 1).length;
  }, [tickets]);

  const handleStateUpdate = async ({ stateId, comment, image }) => {
    if (!stateDialogTicket || !stateId || !comment.trim()) {
      return;
    }

    if (!currentUser?.idUser) {
      showNotification(t('errors.unauthorized'), 'error');
      return;
    }

    setIsUpdatingState(true);
    try {
      const payload = {
        idTicket: stateDialogTicket.idTicket,
        idState: stateId,
        StateObservation: comment.trim(),
        idUser: Number(currentUser.idUser),
      };

      if (image) {
        payload.StateImages = [image];
      }

      const response = await TicketService.updateTicket(payload);
      if (response.data?.success) {
        const updatedTicket = response.data.data;
        
        if (updatedTicket) {
          setTickets((prev) => prev.map((ticket) => (
            ticket.idTicket === updatedTicket.idTicket ? updatedTicket : ticket
          )));
          setStateDialogTicket(updatedTicket);
        } else {
          // Si no hay data (ej: ticket cerrado), recargar la lista
          loadTickets();
        }
        
        // Refrescar notificaciones del sistema inmediatamente
        refreshSystemNotifications();
        
        showNotification(t('tickets.stateUpdate.updateSuccess'), 'success');
        setIsStateDialogOpen(false);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (updateError) {
      console.error('Error updating state:', updateError);
      setIsStateDialogOpen(false);
      showNotification(t('tickets.stateUpdate.updateError'), 'error');
    } finally {
      setIsUpdatingState(false);
    }
  };

  const openReviewDialog = (ticket) => {
    setReviewDialogTicket(ticket);
    setIsReviewDialogOpen(true);
  };

  const handleReviewSubmit = async ({ score, comment }) => {
    if (!reviewDialogTicket) return;

    setIsSubmittingReview(true);
    try {
      const payload = {
        idTicket: reviewDialogTicket.idTicket,
        Score: score,
        Comment: comment,
        DateOfReview: formatDateTimeForDB(),
      };

      const response = await TicketService.createReview(payload);
      if (response.data?.success) {
        const updatedTicket = response.data.data;
        if (updatedTicket) {
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket.idTicket === updatedTicket.idTicket ? updatedTicket : ticket
            )
          );
        } else {
          loadTickets();
        }
        showNotification(t('tickets.review.reviewSuccess'), 'success');
        setIsReviewDialogOpen(false);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (reviewError) {
      console.error('Error sending review:', reviewError);
      setIsReviewDialogOpen(false);
      showNotification(t('tickets.review.reviewError'), 'error');
    } finally {
      setIsSubmittingReview(false);
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
      <div className="flex flex-col gap-4 mt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {role === 1 
              ? t('tickets.assignedTickets') 
              : t('tickets.allTickets')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === 1 
              ? t('sidebar.descriptions.assignedTickets') 
              : t('sidebar.descriptions.tickets')}
          </p>
        </div>

        {/* Barra de búsqueda y botón crear */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Búsqueda avanzada */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('tickets.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Spacer para empujar a la derecha */}
          <div className="flex-1" />

          {/* Botón Crear Ticket y contador */}
          <div className="flex items-center gap-3">
            {/* Botón de Asignación Automática Masiva - Solo Admin */}
            {isAdmin && pendingTicketsCount > 0 && (
              <Button
                onClick={handleBulkAutoAssign}
                disabled={isBulkAssigning}
                variant="outline"
                className="gap-2 border-accent/50 text-accent hover:bg-accent/10 hover:text-accent"
              >
                {isBulkAssigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('tickets.bulkAssign.assigning')}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {t('tickets.bulkAssign.button', { count: pendingTicketsCount })}
                  </>
                )}
              </Button>
            )}

            {canCreateTickets && (
              <Button
                onClick={() => navigate('/tickets/create')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tickets.newTicket')}
              </Button>
            )}
            
            <Badge variant="outline" className="text-sm px-4 py-2">
              {t('tickets.totalCount', { count: tickets.length })}
            </Badge>
          </div>
        </div>

        {/* Indicador de búsqueda activa */}
        {/* {searchQuery && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Resultados para:</span>
            <Badge variant="secondary" className="gap-1">
              "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </Badge>
            {filteredTickets.length === 0 && (
              <span className="text-destructive">— Sin resultados</span>
            )}
          </div>
        )} */}
      </div>

      {/* Tickets List with Collapsible */}
      <div className="space-y-4 mb-5">
        {filteredTickets.length === 0 && !loading && (
          <Card className="p-8">
            <div className="text-center space-y-3">
              <Search className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">{t('tickets.noTickets')}</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? t('tickets.noTicketsDesc')
                  : t('tickets.noTicketsAvailable')}
              </p>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                  {t('tickets.clearSearch')}
                </Button>
              )}
            </div>
          </Card>
        )}
        {filteredTickets.map((ticket) => {
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
                        {/* SLA Badges - Solo mostrar según el estado del ticket */}
                        {ticket.SLA && (
                          <>
                            {/* Tiempo de Respuesta - Solo estados 1 (Pendiente) y 2 (Asignado) */}
                            {(Number(ticket.idState) === 1 || Number(ticket.idState) === 2) && (
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
                                {t('tickets.sla.response')}: {(() => {
                                  const hoursRemaining = ticket.SLA.ResponseHoursRemaining;
                                  return hoursRemaining <= 0 ? t('tickets.sla.expired') : `${hoursRemaining}h`;
                                })()}
                              </Badge>
                            )}
                            {/* Tiempo de Resolución - Solo estados 1, 2 y 3 (no en Resuelto ni Cerrado) */}
                            {(Number(ticket.idState) === 1 || Number(ticket.idState) === 2 || Number(ticket.idState) === 3) && (
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
                                {t('tickets.sla.resolution')}: {(() => {
                                  const hoursRemaining = ticket.SLA.ResolutionHoursRemaining;
                                  return hoursRemaining <= 0 ? t('tickets.sla.expired') : `${hoursRemaining}h`;
                                })()}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      
                      <CardTitle className="text-xl text-left">
                        {ticket.Title}
                      </CardTitle>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatUtcToLocalDate(ticket.CreationDate || ticket.DateOfEntry, { includeYear: true })}
                          </span>
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
                  <div className="border-t border-border" />

                  {/* Admin: Assign button for pending tickets */}
                  {isAdmin && Number(ticket.idState) === 1 && !ticket.Assign && (
                    <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-dashed border-accent/70 bg-accent/10 mb-4">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => openAssignDialog(ticket)}
                      >
                        <UserCheck className="w-4 h-4" />
                        {t('tickets.actions.assignTechnician')}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {t('tickets.actions.assignTechnicianDesc')}
                      </p>
                    </div>
                  )}

                  {(() => {
                    const currentStateId = Number(ticket.idState);
                    const isTech = role === 1;
                    const isClientOrAdmin = role === 2 || role === 3;

                    if (isTech && currentStateId === 2) {
                      return (
                        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-dashed border-border/70 bg-muted/20">
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => openStateDialog(ticket)}
                          >
                            <Edit3 className="w-4 h-4" />
                            {t('tickets.actions.respondTicket')}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            {t('tickets.actions.respondTicketDesc')}
                          </p>
                        </div>
                      );
                    }

                    if (isTech && currentStateId === 3) {
                      return (
                        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-dashed border-border/70 bg-muted/20">
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => openStateDialog(ticket)}
                          >
                            <Edit3 className="w-4 h-4" />
                            {t('tickets.actions.markResolved')}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            {t('tickets.actions.requiresComment')}
                          </p>
                        </div>
                      );
                    }

                    if (isClientOrAdmin && currentStateId === 4) {
                      return (
                        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-dashed border-border/70 bg-muted/20">
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => openStateDialog(ticket)}
                          >
                            <Edit3 className="w-4 h-4" />
                            {t('tickets.actions.closeTicket')}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            {t('tickets.actions.requiresComment')}
                          </p>
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {/* Description */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4" />
                      {t('common.description')}
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
                            {t('tickets.details.technician')}
                          </h4>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-start gap-3">
                            {/* Avatar y datos del técnico */}
                            <div className="flex items-start gap-3 flex-1">
                              <Avatar className="flex-shrink-0">
                                <AvatarImage 
                                  src={getTechnicianAvatarUrl(ticket.Assign.Technician)}
                                  alt={ticket.Assign.Technician.Username}
                                />
                                <AvatarFallback className="bg-accent text-accent-foreground">
                                  {getTechnicianInitials(ticket.Assign.Technician.Username)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{ticket.Assign.Technician.Username}</p>
                                <p className="text-xs text-muted-foreground truncate">{ticket.Assign.Technician.Email}</p>
                              </div>
                            </div>
                            
                            {/* Información de asignación */}
                            <div className="flex-1 space-y-2 border-l pl-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{t('tickets.details.assigned')}:</span>
                                <div className="text-right">
                                  <p className="font-medium">
                                    <strong>{ticket.Assign.DateOfAssign 
                                      ? formatUtcToLocalDate(ticket.Assign.DateOfAssign)
                                      : 'N/A'}</strong> <span>| </span>
                                      {ticket.Assign.DateOfAssign 
                                      ? formatUtcToLocalTime(ticket.Assign.DateOfAssign)
                                      : ''}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{t('tickets.details.method')}:</span>
                                <Badge variant="outline" className="text-xs">
                                  {ticket.Assign.WorkFlowRules === 'Manual' ? t('tickets.assignment.manual') : t('tickets.assignment.automatic')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                            {t('tickets.details.technicianResponsible')}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Stats Summary */}
                    <Card className="border-border/50 bg-muted/20">
                      <CardHeader className="pb-3">
                        <h4 className="font-semibold text-sm">{t('tickets.details.statistics')}</h4>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg bg-background/50">
                            <p className="text-xl font-bold text-primary pt-2">{ticket.StateRecords?.length || 0}</p>
                            <p className="text-[10px] text-muted-foreground">{t('tickets.details.changes')}</p>
                          </div>
                          {ticket.SLA && (
                            <>
                              {/* Respuesta - siempre visible, con etiqueta "Respondido" si ya pasó */}
                              <div className="text-center p-2 rounded-lg bg-background/50">
                                <p className="text-xs font-semibold text-primary mb-1 flex items-center justify-center gap-1">
                                  {t('tickets.details.responseTime')}
                                  {Number(ticket.idState) >= 3 && (
                                    <span className="text-[9px] font-normal text-primary">({t('tickets.details.responded')})</span>
                                  )}
                                </p>
                                <p className={`text-lg font-bold text-muted-foreground}`}>
                                  {formatSlaTime(ticket.SLA.ResponseDeadline)}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {formatSlaDate(ticket.SLA.ResponseDeadline)}
                                </p>
                              </div>
                              {/* Resolución - siempre visible, con etiqueta "Resuelto" si ya pasó */}
                              <div className="text-center p-2 rounded-lg bg-background/50">
                                <p className="text-xs font-semibold text-primary mb-1 flex items-center justify-center gap-1">
                                  {t('tickets.details.resolutionTime')}
                                  {Number(ticket.idState) >= 4 && (
                                    <span className="text-[9px] font-normal text-primary">({t('tickets.states.resolved')})</span>
                                  )}
                                </p>
                                <p className={`text-lg font-bold text-muted-foreground}`}>
                                  {formatSlaTime(ticket.SLA.ResolutionDeadline)}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {formatSlaDate(ticket.SLA.ResolutionDeadline)}
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
                        {t('tickets.details.timeline')}
                      </h4>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(() => {
                          // Ordenar por fecha DESC (más reciente primero) para mostrar
                          const sortedRecords = [...(ticket.StateRecords || [])].sort((a, b) => 
                            new Date(b.DateOfChange) - new Date(a.DateOfChange)
                          );
                          
                          // Ordenar por fecha ASC para calcular transiciones correctamente
                          const chronologicalRecords = [...(ticket.StateRecords || [])].sort((a, b) => 
                            new Date(a.DateOfChange) - new Date(b.DateOfChange)
                          );
                          
                          return sortedRecords.map((record) => {
                            const StateIcon = getStateIcon(record.State).icon;
                            const iconColor = getStateIcon(record.State).color;
                            
                            // Encontrar índice en el array cronológico para obtener estado anterior
                            const chronoIndex = chronologicalRecords.findIndex(r => r.idStateRecord === record.idStateRecord);
                            const isFirstRecord = chronoIndex === 0;
                            const previousState = chronoIndex > 0 ? chronologicalRecords[chronoIndex - 1].State : null;
                            const hasImages = record.Images?.filter(img => img.ImageBase64 || img.ImagePath).length > 0;
                            
                            return (
                              <div 
                                key={record.idStateRecord}
                                className="p-3 rounded-lg bg-background/50 border border-border/50"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Columna Izquierda: Icono, Estado y Observación */}
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`p-1.5 rounded-full ${iconColor} shrink-0`}>
                                      <StateIcon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-medium text-sm block">{record.State}</span>
                                      {record.Observation && (
                                        <p className="text-xs text-muted-foreground truncate">{record.Observation}</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Columna Central: Transición de Estados */}
                                  <div className="flex items-center justify-center shrink-0 min-w-[180px]">
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <span className="text-muted-foreground">{isFirstRecord ? t('tickets.details.ticketStarted') : previousState}</span>
                                      <span className="text-muted-foreground/50">→</span>
                                      <span className="text-primary font-medium">{record.State}</span>
                                    </div>
                                  </div>

                                  {/* Columna Derecha: Fecha y Usuario */}
                                  <div className="text-right shrink-0 min-w-[160px]">
                                    <span className="text-xs text-muted-foreground block">
                                      {formatUtcToLocalDateTime(record.DateOfChange, { includeSeconds: true })}
                                    </span>
                                    {record.ChangedBy && (
                                      <span className="text-[10px] text-muted-foreground/60 italic block mt-0.5">
                                        {t('common.by')} {record.ChangedBy}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Imágenes del registro */}
                                {hasImages && (
                                  <div className="mt-2 pt-2 border-t border-border/30 ml-10">
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
                                            className="w-14 h-14 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setImageModal({ open: true, url: imgSrc })}
                                            onError={(e) => {
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
                            );
                          });
                        })()}
                        {(!ticket.StateRecords || ticket.StateRecords.length === 0) && (
                          <p className="text-sm text-muted-foreground">{t('tickets.details.noTimeline')}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Service Review */}
                  {Number(ticket.idState) === 5 && (
                    <Card className="border-border/50 bg-muted/20">
                      <CardHeader className="pb-3">
                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          {t('tickets.review.title')}
                        </h4>
                      </CardHeader>
                      <CardContent>
                        {ticket.ServiceReview ? (
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
                              {formatUtcToLocalDateTime(ticket.ServiceReview.DateOfReview)}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            {role === 2 && (
                              <Button 
                                size="sm"
                                className="gap-2"
                                onClick={() => openReviewDialog(ticket)}
                              >
                                <Star className="w-4 h-4" />
                                {t('tickets.review.submitReview')}
                              </Button>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {t('tickets.review.commentPlaceholder')}
                            </p>
                          </div>
                        )}
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

      {stateDialogTicket && (
        <StateUpdateDialog
          open={isStateDialogOpen}
          onOpenChange={setIsStateDialogOpen}
          ticket={stateDialogTicket}
          states={dialogStateOptions}
          onSubmit={handleStateUpdate}
          loading={isUpdatingState}
        />
      )}

      {assignDialogTicket && (
        <AssignmentDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          ticket={assignDialogTicket}
          technicians={technicians}
          onAssign={handleAssignment}
          loading={isAssigning}
        />
      )}

      {reviewDialogTicket && (
        <ServiceReviewDialog
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          ticket={reviewDialogTicket}
          onSubmit={handleReviewSubmit}
          loading={isSubmittingReview}
        />
      )}

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
              alt={t('tickets.details.enlargedView')}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
