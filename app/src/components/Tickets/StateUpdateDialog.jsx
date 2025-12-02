import { useEffect, useRef, useState, useMemo } from 'react';
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
import { Trash2, Upload, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export default function StateUpdateDialog({
  open,
  onOpenChange,
  ticket,
  states,
  onSubmit,
  loading,
}) {
  const [comment, setComment] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  // Determinar el siguiente estado basado en el estado actual del ticket
  const nextState = useMemo(() => {
    if (!ticket || !Array.isArray(states) || states.length === 0) return null;
    
    const currentStateId = Number(ticket.idState);
    
    // Transiciones: 2→3 (Responder), 3→4 (Resolver), 4→5 (Cerrar)
    const nextStateId = {
      2: 3, // Asignado → En Proceso
      3: 4, // En Proceso → Resuelto
      4: 5, // Resuelto → Cerrado
    }[currentStateId];
    
    if (!nextStateId) return null;
    return states.find(s => Number(s.idState) === nextStateId) || null;
  }, [ticket, states]);

  // Configuración dinámica según el estado actual
  const dialogConfig = useMemo(() => {
    const currentStateId = Number(ticket?.idState);
    
    switch (currentStateId) {
      case 2: // Asignado → Responder (En Proceso)
        return {
          title: 'Responder Ticket',
          description: `Responder al ticket #${ticket?.idTicket}: "${ticket?.Title}"`,
          icon: MessageSquare,
          iconColor: 'text-accent',
          textLabel: 'Respuesta',
          textPlaceholder: 'Escribe tu respuesta al ticket...',
          buttonText: 'Responder',
          buttonLoadingText: 'Respondiendo...',
        };
      case 3: // En Proceso → Resolver
        return {
          title: 'Resolver Ticket',
          description: `Marcar como resuelto el ticket #${ticket?.idTicket}: "${ticket?.Title}"`,
          icon: CheckCircle,
          iconColor: 'text-green-500',
          textLabel: 'Solución',
          textPlaceholder: 'Describe la solución aplicada al problema...',
          buttonText: 'Marcar como Resuelto',
          buttonLoadingText: 'Resolviendo...',
        };
      case 4: // Resuelto → Cerrar
        return {
          title: 'Cerrar Ticket',
          description: `Cerrar definitivamente el ticket #${ticket?.idTicket}: "${ticket?.Title}"`,
          icon: XCircle,
          iconColor: 'text-primary',
          textLabel: 'Comentario de cierre',
          textPlaceholder: 'Agrega un comentario sobre el cierre del ticket...',
          buttonText: 'Cerrar Ticket',
          buttonLoadingText: 'Cerrando...',
        };
      default:
        return {
          title: 'Actualizar Estado',
          description: `Actualizar el ticket #${ticket?.idTicket}`,
          icon: MessageSquare,
          iconColor: 'text-muted-foreground',
          textLabel: 'Comentario',
          textPlaceholder: 'Describe brevemente el motivo del cambio...',
          buttonText: 'Confirmar',
          buttonLoadingText: 'Actualizando...',
        };
    }
  }, [ticket]);

  useEffect(() => {
    setComment('');
    setEvidence(null);
    setEvidencePreview(null);
    setFileError('');
  }, [ticket?.idTicket, open]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Solo se permiten archivos de imagen.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidence(reader.result);
      setEvidencePreview(reader.result);
      setFileError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEvidence = () => {
    setEvidence(null);
    setEvidencePreview(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!nextState?.idState || !comment.trim()) {
      return;
    }

    onSubmit({
      stateId: Number(nextState.idState),
      comment: comment.trim(),
      image: evidence,
    });
  };

  const handleOpenChange = (value) => {
    if (loading) return;
    onOpenChange(value);
  };

  const IconComponent = dialogConfig.icon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <IconComponent className={`h-5 w-5 ${dialogConfig.iconColor}`} />
              </div>
              <div>
                <DialogTitle className="text-card-foreground">{dialogConfig.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {nextState
                    ? dialogConfig.description
                    : 'No hay transiciones disponibles para este ticket.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="state-comment" className="flex items-center gap-2 text-card-foreground">
              <MessageSquare className="h-4 w-4" />
              {dialogConfig.textLabel}
              <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="state-comment"
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-base border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-placeholder"
              placeholder={dialogConfig.textPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Imagen (opcional)</Label>
            {!evidencePreview ? (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm border border-input bg-background text-foreground rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/80"
                />
                {fileError && <p className="text-xs text-destructive">{fileError}</p>}
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={evidencePreview}
                  alt="Vista previa evidencia"
                  className="h-24 w-auto rounded-md object-cover border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={handleRemoveEvidence}
                  disabled={loading}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nextState?.idState || !comment.trim() || loading}>
              {loading ? dialogConfig.buttonLoadingText : dialogConfig.buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
