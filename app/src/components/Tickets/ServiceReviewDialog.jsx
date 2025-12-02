import { useEffect, useState } from 'react';
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
import { Star, MessageSquare } from 'lucide-react';

export default function ServiceReviewDialog({
  open,
  onOpenChange,
  ticket,
  onSubmit,
  loading,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (open) {
      setRating(0);
      setHoverRating(0);
      setComment('');
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (rating === 0 || !comment.trim()) {
      return;
    }

    onSubmit({
      score: rating,
      comment: comment.trim(),
    });
  };

  const handleOpenChange = (value) => {
    if (loading) return;
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Star className="h-5 w-5 text-primary fill-primary" />
              </div>
              <div>
                <DialogTitle className="text-card-foreground">Valorar Servicio</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Califica la atención del ticket #{ticket?.idTicket}: "{ticket?.Title}"
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-card-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Calificación
              <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  disabled={loading}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm font-medium text-muted-foreground">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment" className="flex items-center gap-2 text-card-foreground">
              <MessageSquare className="h-4 w-4" />
              Comentario
              <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-base border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-placeholder"
              placeholder="Describe tu experiencia con el servicio recibido..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={rating === 0 || !comment.trim() || loading}>
              {loading ? 'Enviando...' : 'Enviar Valoración'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
