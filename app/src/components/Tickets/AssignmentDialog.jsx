import { useState, useEffect } from 'react';
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
import { X, Loader2, User, Zap } from 'lucide-react';
const getTechnicianInitials = (name = '') => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '—';
};

export default function AssignmentDialog({
  open,
  onOpenChange,
  ticket,
  technicians,
  onAssign,
  loading,
}) {
  const [assignmentMethod, setAssignmentMethod] = useState('manual');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [observation, setObservation] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [evidenceError, setEvidenceError] = useState('');

  // Test asignacion A1
  // Asignacion automatica de tecnicos
  //

  // Obtener la prioridad base desde el ticket (idPriority de la tabla ticket)
  const basePriority = ticket?.idPriority || 2;

  // Calcular PriorityScore basado en la fórmula: Prioridad × 1000 - Tiempo restante SLA (horas)
  const calculatePriorityScore = () => {
    const priority = parseInt(basePriority);
    const slaHoursRemaining = ticket?.SLA?.ResolutionHoursRemaining || 0;
    const score = (priority * 1000) - slaHoursRemaining;
    return Math.max(0, Math.round(score)); // Asegurar que no sea negativo
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setAssignmentMethod('manual');
      setSelectedTechnicianId('');
      setObservation('');
      setEvidence(null);
      setEvidencePreview(null);
      setEvidenceError('');
    }
  }, [open]);

  // Update observation when method changes to automatic
  useEffect(() => {
    if (assignmentMethod === 'automatic') {
      setObservation('Asignado de manera automática según reglas de autotriaje');
    } else if (observation === 'Asignado de manera automática según reglas de autotriaje') {
      setObservation('');
    }
  }, [assignmentMethod, observation]);

  const handleEvidenceChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEvidenceError('Solo se permiten archivos de imagen.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEvidenceError('La imagen no debe superar los 5MB.');
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

    if (!observation.trim()) {
      return;
    }

    onAssign({
      method: assignmentMethod,
      technicianId: assignmentMethod === 'manual' ? Number(selectedTechnicianId) : null,
      priorityScore: calculatePriorityScore(),
      observation: observation.trim(),
      evidence: evidence,
    });
  };

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

  const selectedTechnician = availableTechnicians.find(
    (tech) => String(tech.idTechnician) === selectedTechnicianId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Asignar Ticket</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ticket #{ticket?.idTicket}: {ticket?.Title}
          </DialogDescription>
          {hasSpecialtyRequirements && (
            <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Especialidades requeridas para esta categoría:
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
            <Label className="text-card-foreground">Método de asignación</Label>
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
                  <span className="font-semibold">Manual</span>
                </div>
                <span className="text-xs font-normal opacity-80 text-left">
                  Seleccionar técnico específico
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
                  <span className="font-semibold">Automático</span>
                </div>
                <span className="text-xs font-normal opacity-80 text-left">
                  Asignar por disponibilidad y especialidad
                </span>
              </Button>
            </div>
          </div>
          {/* Technician Selection (only for manual) */}
          {assignmentMethod === 'manual' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-card-foreground">Seleccionar técnico</Label>
                <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un técnico..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTechnicians.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {hasSpecialtyRequirements 
                          ? 'No hay técnicos disponibles con las especialidades requeridas'
                          : 'No hay técnicos disponibles'}
                      </div>
                    ) : (
                      availableTechnicians.map((tech) => (
                        <SelectItem key={tech.idTechnician} value={String(tech.idTechnician)}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/${tech.AvatarStyle || 'avataaars'}/svg?seed=${tech.AvatarSeed || tech.Username}`}
                              />
                              <AvatarFallback className="text-xs">
                                {getTechnicianInitials(tech.Username)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{tech.Username}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              Carga: {tech.WorkLoad || 0}/5
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
                  <Label className="text-xs text-muted-foreground mb-2 block">Especialidades del técnico:</Label>
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
              Observación <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="observation"
              placeholder="Describe el motivo de la asignación..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
              disabled={assignmentMethod === 'automatic'}
              className="w-full px-3 py-2 text-base border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 placeholder:text-placeholder"
            />
            {assignmentMethod === 'automatic' && (
              <p className="text-xs text-muted-foreground">
                La observación se genera automáticamente para asignaciones automáticas.
              </p>
            )}
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label className="text-card-foreground">Evidencia (opcional)</Label>
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
            Cancelar
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
                Asignando...
              </>
            ) : (
              'Asignar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
