import { useEffect, useRef, useState } from 'react';
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
import { Trash2, Upload } from 'lucide-react';

export default function StateUpdateDialog({
  open,
  onOpenChange,
  ticket,
  nextState,
  onSubmit,
  loading,
}) {
  const [comment, setComment] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Actualizar estado</DialogTitle>
            <DialogDescription>
              {nextState
                ? `Se actualizará el ticket #${ticket?.idTicket} al estado "${nextState.Description}"`
                : 'No hay transiciones disponibles para este ticket.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="state-comment">Comentario</Label>
            <textarea
              id="state-comment"
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe brevemente el motivo del cambio"
            />
          </div>

          <div className="space-y-2">
            <Label>Evidencia opcional</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                <Upload className="w-4 h-4 mr-2" />
                Adjuntar imagen
              </Button>
              {evidence && (
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveEvidence} disabled={loading}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Quitar
                </Button>
              )}
            </div>
            {evidencePreview && (
              <img
                src={evidencePreview}
                alt="Vista previa evidencia"
                className="h-24 w-24 rounded-md object-cover border"
              />
            )}
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nextState?.idState || !comment.trim() || loading}>
              {loading ? 'Actualizando…' : 'Confirmar cambio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
