import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Loader2, User, Zap, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';
import AssignService from '@/services/AssignService';
import { getTechnicianAvatarUrl, getTechnicianInitials } from '@/hooks/use-avatar';

export default function AssignmentDialog({
  open,
  onOpenChange,
  ticket,
  technicians,
  onAssign,
  loading,
}) {
  const { t } = useTranslation();
  const [assignmentMethod, setAssignmentMethod] = useState('manual');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [observation, setObservation] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [evidenceError, setEvidenceError] = useState('');
  
  // Estados para auto-triage
  const [autoTriageResult, setAutoTriageResult] = useState(null);
  const [autoTriageLoading, setAutoTriageLoading] = useState(false);
  const [autoTriageError, setAutoTriageError] = useState(null);

  // Obtener la prioridad base desde el ticket (idPriority de la tabla ticket)
  const basePriority = ticket?.idPriority || 2;

  // Calcular PriorityScore basado en la fórmula: Prioridad × 1000 - Tiempo restante SLA (horas)
  const calculatePriorityScore = () => {
    const priority = parseInt(basePriority);
    const slaHoursRemaining = ticket?.SLA?.ResolutionHoursRemaining || 0;
    const score = (priority * 1000) - slaHoursRemaining;
    return Math.round(score); // Puede ser negativo si ya pasó el SLA
  };

  const priorityScore = calculatePriorityScore();

  // Get required specialties from ticket category
  const requiredSpecialtyIds = ticket?.CategoryData?.SpecialtyIds || [];
  const hasSpecialtyRequirements = Array.isArray(requiredSpecialtyIds) && requiredSpecialtyIds.length > 0;

  // Filtrar técnicos disponibles: WorkLoad < 5 (máximo 5 tickets)
  const availableTechnicians = technicians.filter((tech) => {
    const workload = parseInt(tech.WorkLoad || 0);
    if (workload >= 5) return false; // No disponible si tiene carga máxima

    // If category has specialty requirements, filter by those
    if (hasSpecialtyRequirements) {
      const techSpecialtyIds = tech.SpecialtyIds || [];
      const requirements = requiredSpecialtyIds.map((id) => Number(id));
      
      // Check if technician has at least one required specialty
      const hasRequiredSpecialty = requirements.some((reqId) =>
        techSpecialtyIds.some((techId) => Number(techId) === reqId)
      );
      
      return hasRequiredSpecialty;
    }

    return true;
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setAssignmentMethod('manual');
      setSelectedTechnicianId('');
      setObservation('');
      setEvidence(null);
      setEvidencePreview(null);
      setEvidenceError('');
      setAutoTriageResult(null);
      setAutoTriageError(null);
    }
  }, [open]);

  // Ejecutar auto-triage cuando se selecciona el método automático
  useEffect(() => {
    if (assignmentMethod === 'automatic' && open && ticket) {
      executeAutoTriage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentMethod, open, ticket?.idTicket]);

  // Update observation when auto-triage result changes
  useEffect(() => {
    if (assignmentMethod === 'automatic' && autoTriageResult) {
      setObservation(t('tickets.assignment.autoAssignmentRule', { ruleId: autoTriageResult.rule?.idWorkFlowRules }));
    } else if (assignmentMethod === 'automatic' && autoTriageError) {
      setObservation('');
    } else if (assignmentMethod !== 'automatic') {
      setObservation((prev) => prev.startsWith(t('tickets.assignment.autoAssignmentPrefix')) ? '' : prev);
    }
  }, [assignmentMethod, autoTriageResult, autoTriageError, t]);

  // Función para ejecutar el auto-triage (lógica en frontend)
  const executeAutoTriage = async () => {
    if (!ticket?.idCategory || availableTechnicians.length === 0) {
      setAutoTriageError(t('tickets.assignment.noTechniciansAvailable'));
      setAutoTriageResult(null);
      return;
    }

    setAutoTriageLoading(true);
    setAutoTriageError(null);
    setAutoTriageResult(null);

    try {
      // Obtener las reglas de workflow ordenadas por OrderPriority
      const response = await AssignService.getWorkFlowRules();
      
      if (!response.data?.success || !response.data?.data) {
        setAutoTriageError(t('tickets.assignment.autoTriageRulesError'));
        return;
      }

      const rules = response.data.data; // Ya vienen ordenadas por OrderPriority ASC
      const ticketCategoryId = Number(ticket.idCategory);

      let matchedResult = null;

      // Iterar por las reglas en orden de prioridad (OrderPriority)
      for (const rule of rules) {
        const ruleCategory = rule.idCategory ? Number(rule.idCategory) : null;
        const ruleSpecialty = rule.idSpecialty ? Number(rule.idSpecialty) : null;
        const ruleWorkLoad = rule.WorkLoad !== null ? Number(rule.WorkLoad) : null;

        // Si la regla tiene categoría específica y no coincide, saltar
        if (ruleCategory !== null && ruleCategory !== ticketCategoryId) {
          continue;
        }

        // Buscar técnico que cumpla con la regla (usar availableTechnicians para datos completos)
        for (const tech of availableTechnicians) {
          const techWorkLoad = parseInt(tech.WorkLoad || 0);
          const techSpecialtyIds = (tech.SpecialtyIds || []).map(id => Number(id));

          // Verificar WorkLoad si la regla lo especifica
          if (ruleWorkLoad !== null && techWorkLoad > ruleWorkLoad) {
            continue;
          }

          // Verificar si el técnico tiene la especialidad de la regla (si se especifica)
          if (ruleSpecialty !== null && !techSpecialtyIds.includes(ruleSpecialty)) {
            continue;
          }

          // Verificar que el técnico tenga las especialidades requeridas por la categoría
          if (hasSpecialtyRequirements) {
            const reqIds = requiredSpecialtyIds.map(id => Number(id));
            const hasRequired = reqIds.some(reqId => techSpecialtyIds.includes(reqId));
            if (!hasRequired) {
              continue;
            }
          }

          // ¡Encontramos un match! Usar el técnico completo con todos sus datos
          matchedResult = {
            technician: tech,
            rule: rule
          };
          break;
        }

        if (matchedResult) break;
      }

      if (matchedResult) {
        setAutoTriageResult(matchedResult);
      } else {
        setAutoTriageError(t('tickets.assignment.noMatchingTechnician'));
      }
    } catch (error) {
      console.error('Error en auto-triage:', error);
      setAutoTriageError(error.message || 'Error al ejecutar auto-triage');
    } finally {
      setAutoTriageLoading(false);
    }
  };

  const handleEvidenceChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEvidenceError(t('tickets.assignment.onlyImagesAllowed'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEvidenceError(t('tickets.assignment.imageSizeLimit'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidence(reader.result);
      setEvidencePreview(reader.result);
      setEvidenceError('');
    };
    reader.readAsDataURL(file);
  };

  const clearEvidence = () => {
    setEvidence(null);
    setEvidencePreview(null);
    setEvidenceError('');
  };

  const handleAssign = () => {
    if (assignmentMethod === 'manual' && !selectedTechnicianId) {
      return;
    }

    if (assignmentMethod === 'automatic' && !autoTriageResult) {
      return;
    }

    if (!observation.trim()) {
      return;
    }

    // Para asignación automática, usar el técnico del auto-triage
    const techId = assignmentMethod === 'manual' 
      ? Number(selectedTechnicianId) 
      : autoTriageResult?.technician?.idTechnician;

    // Para asignación automática, incluir el idWorkFlowRules
    const workflowRuleId = assignmentMethod === 'automatic' 
      ? autoTriageResult?.rule?.idWorkFlowRules 
      : null;

    onAssign({
      method: assignmentMethod,
      technicianId: techId,
      priorityScore: priorityScore,
      observation: observation.trim(),
      evidence: evidence,
      idWorkFlowRules: workflowRuleId,
    });
  };

  const selectedTechnician = availableTechnicians.find(
    (tech) => String(tech.idTechnician) === selectedTechnicianId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{t('tickets.assignment.dialogTitle')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('tickets.assignment.ticketInfo', { id: ticket?.idTicket, title: ticket?.Title })}
          </DialogDescription>

          {hasSpecialtyRequirements && (
            <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t('tickets.assignment.requiredSpecialties')}
              </p>
              <p className="text-sm text-primary font-medium">
                {ticket?.CategoryData?.Specialties || 'N/A'}
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Assignment Method */}
          <div className="space-y-3">
            <Label className="text-card-foreground">{t('tickets.assignment.assignmentMethod')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className={`h-auto py-4 flex-col items-start gap-2 ${
                  assignmentMethod === 'manual'
                    ? 'bg-card text-accent !border !border-accent/50 hover:bg-card/80'
                    : 'bg-muted !border !border-border hover:bg-muted/80 text-muted-foreground'
                }`}
                onClick={() => setAssignmentMethod('manual')}
              >
                <div className="flex items-center gap-2 w-full">
                  <User className="w-5 h-5" />
                  <span className="font-semibold">{t('tickets.assignment.manual')}</span>
                </div>
                <span className="text-xs font-normal opacity-80 text-left">
                  {t('tickets.assignment.manualDescription')}
                </span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className={`h-auto py-4 flex-col items-start gap-2 ${
                  assignmentMethod === 'automatic'
                    ? 'bg-card text-accent !border !border-accent/50 hover:bg-card/80'
                    : 'bg-muted !border !border-border hover:bg-muted/80 text-muted-foreground'
                }`}
                onClick={() => setAssignmentMethod('automatic')}
              >
                <div className="flex items-center gap-2 w-full">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">{t('tickets.assignment.automatic')}</span>
                </div>
                <span className="text-xs font-normal opacity-80 text-left">
                  {t('tickets.assignment.automaticDescription')}
                </span>
              </Button>
            </div>
          </div>

          {/* Resultado del Auto-Triage (solo para automático) */}
          {assignmentMethod === 'automatic' && (
            <div className="space-y-3">
              {autoTriageLoading && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">{t('tickets.assignment.executingAutoTriage')}</span>
                </div>
              )}
              
              {autoTriageError && !autoTriageLoading && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">{t('tickets.assignment.cannotAssignAutomatically')}</p>
                    <p className="text-xs text-muted-foreground">{autoTriageError}</p>
                  </div>
                </div>
              )}
              
              {autoTriageResult && !autoTriageLoading && (
                <div className="space-y-3">
                  {/* Puntaje de Prioridad - solo visible en automático */}
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-card-foreground">{t('tickets.assignment.priorityScore')}</span>
                      </div>
                      <Badge variant="outline" className={`text-lg font-bold ${priorityScore > 2000 ? 'text-red-500 border-red-500' : priorityScore > 1000 ? 'text-yellow-500 border-yellow-500' : 'text-green-500 border-green-500'}`}>
                        {priorityScore}
                      </Badge>
                    </div>
                  </div>

                  {/* Técnico Encontrado */}
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">{t('tickets.assignment.technicianFound')}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={getTechnicianAvatarUrl(autoTriageResult.technician)} />
                        <AvatarFallback>
                          {getTechnicianInitials(autoTriageResult.technician?.Username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{autoTriageResult.technician?.Username}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('tickets.assignment.currentWorkload', { current: autoTriageResult.technician?.WorkLoad || 0, max: 5 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Technician Selection (only for manual) */}
          {assignmentMethod === 'manual' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-card-foreground">{t('tickets.assignment.selectTechnician')}</Label>
                <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('tickets.assignment.chooseTechnician')} />
                  </SelectTrigger>
                  <SelectContent side="right" sideOffset={8}>
                    {availableTechnicians.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {hasSpecialtyRequirements 
                          ? t('tickets.assignment.noTechniciansWithSpecialties')
                          : t('tickets.assignment.noTechnicians')}
                      </div>
                    ) : (
                      availableTechnicians.map((tech) => (
                        <SelectItem key={tech.idTechnician} value={String(tech.idTechnician)}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={getTechnicianAvatarUrl(tech)} />
                              <AvatarFallback className="text-xs">
                                {getTechnicianInitials(tech.Username)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{tech.Username}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {t('tickets.assignment.workload', { current: tech.WorkLoad || 0, max: 5 })}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Show selected technician specialties */}
              {selectedTechnician && selectedTechnician.Specialties && selectedTechnician.Specialties.length > 0 && (
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <Label className="text-xs text-muted-foreground mb-2 block">{t('tickets.assignment.technicianSpecialties')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnician.Specialties.map((specialty, index) => (
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
            </div>
          )}

          {/* Observation */}
          <div className="space-y-2">
            <Label htmlFor="observation" className="text-card-foreground">
              {t('tickets.assignment.observation')} <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="observation"
              placeholder={t('tickets.assignment.observationPlaceholder')}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
              disabled={assignmentMethod === 'automatic'}
              className="w-full px-3 py-2 text-base border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 placeholder:text-placeholder"
            />
            {assignmentMethod === 'automatic' && (
              <p className="text-xs text-muted-foreground">
                {t('tickets.assignment.autoObservationNote')}
              </p>
            )}
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label className="text-card-foreground">{t('tickets.assignment.evidence')}</Label>
            {!evidencePreview ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceChange}
                  className="w-full px-3 py-2 text-sm border border-input bg-background text-foreground rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/80"
                />
                {evidenceError && (
                  <p className="text-sm text-destructive">{evidenceError}</p>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={evidencePreview}
                  alt="Evidence preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearEvidence}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              loading ||
              !observation.trim() ||
              (assignmentMethod === 'manual' && !selectedTechnicianId)
            }
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('tickets.assignment.assigning')}
              </>
            ) : (
              t('tickets.assignment.assign')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
