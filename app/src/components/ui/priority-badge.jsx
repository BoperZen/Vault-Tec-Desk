import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig = {
  'Alta': {
    variant: 'destructive',
    icon: AlertCircle,
    className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 hover:bg-red-500/20',
  },
  'Media': {
    variant: 'default',
    icon: AlertTriangle,
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20',
  },
  'Baja': {
    variant: 'secondary',
    icon: Info,
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20',
  },
};

export function PriorityBadge({ priority, showIcon = false, className, ...props }) {
  const config = priorityConfig[priority] || priorityConfig['Media'];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      {...props}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {priority}
    </Badge>
  );
}
