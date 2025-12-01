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
import { Textarea } from '@/components/ui/textarea';
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
import { Input } from '@/components/ui/input';

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

  const availableTechnicians = technicians.filter((tech) => {
    const availability = parseInt(tech.Availability || 0);
    if (availability < 2) return false;

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Asignar Ticket</DialogTitle>
          <DialogDescription>
            Ticket #{ticket?.idTicket}: {ticket?.Title}
          </DialogDescription>
          {hasSpecialtyRequirements && (
            <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
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
            <Label>Método de asignación</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="manual"
                  name="assignmentMethod"
                  value="manual"
                  checked={assignmentMethod === 'manual'}
                  onChange={(e) => setAssignmentMethod(e.target.value)}
                  className="h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-primary"
                />
                <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer font-normal">
                  <User className="w-4 h-4" />
                  <strong>Manual</strong> - Seleccionar técnico específico
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="automatic"
                  name="assignmentMethod"
                  value="automatic"
                  checked={assignmentMethod === 'automatic'}
                  onChange={(e) => setAssignmentMethod(e.target.value)}
                  className="h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-primary"
                />
                <Label htmlFor="automatic" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Zap className="w-4 h-4" />
                  <strong>Automático</strong> - Asignar por disponibilidad y especialidad
                </Label>
              </div>
            </div>
          </div>
          {/* Technician Selection (only for manual) */}
          {assignmentMethod === 'manual' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Seleccionar técnico</Label>
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
                              Carga: {tech.WorkLoad || 0}/10
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
            <Label htmlFor="observation">
              Observación <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="observation"
              placeholder="Describe el motivo de la asignación..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
              disabled={assignmentMethod === 'automatic'}
            />
            {assignmentMethod === 'automatic' && (
              <p className="text-xs text-muted-foreground">
                La observación se genera automáticamente para asignaciones automáticas.
              </p>
            )}
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidencia (opcional)</Label>
            {!evidencePreview ? (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceChange}
                  className="cursor-pointer"
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
