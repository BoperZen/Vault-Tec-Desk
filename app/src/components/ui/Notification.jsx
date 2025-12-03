import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { useSidebar } from '@/components/ui/sidebar';
import { useFullscreen } from '@/context/FullscreenContext';
import { cn } from '@/lib/utils';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  error: 'bg-red-100 border-red-300 text-red-800',
  info: 'bg-blue-100 border-blue-300 text-blue-800',
  warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
};

const iconColorMap = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
};

export default function Notification() {
  const { notification, hideNotification } = useNotification();
  const { open } = useSidebar();
  const { isFullscreen } = useFullscreen();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) return null;

  const Icon = iconMap[notification.type] || Info;
  const topOffset = isFullscreen ? 108 : 100;

  return (
    <div 
      className="fixed right-0 z-30 px-6 transition-all duration-300 pointer-events-none"
      style={{ 
        left: open ? '20rem' : '5rem',
        top: `${topOffset}px`
      }}
    >
      <div
        className={cn(
          'flex items-center gap-3 px-6 py-4 rounded-b-lg border-x border-b shadow-lg transition-all duration-300 pointer-events-auto',
          'animate-in slide-in-from-top-2 fade-in',
          colorMap[notification.type]
        )}
      >
        <Icon className={cn('w-5 h-5 flex-shrink-0', iconColorMap[notification.type])} />
        <p className="text-sm font-medium flex-1">{notification.message}</p>
        <button
          onClick={hideNotification}
          className="ml-4 hover:opacity-70 transition-opacity"
          aria-label="Cerrar notificación"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
