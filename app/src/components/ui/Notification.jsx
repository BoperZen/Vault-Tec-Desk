import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-emerald-500/10 border-emerald-500 text-emerald-600',
  error: 'bg-red-50 border-red-200 text-red-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
};

const iconColorMap = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
};

export default function Notification() {
  const { notification, hideNotification } = useNotification();

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

  return (
    <div className="mb-6">
      <div
        className={cn(
          'flex items-center gap-3 px-6 py-6 rounded-b-xl border shadow-sm transition-all duration-300',
          'animate-in slide-in-from-top-2 fade-in',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2',
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
