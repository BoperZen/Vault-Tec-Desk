import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const stateVariants = {
  'Pendiente': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20',
  'Asignado': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20',
  'En Proceso': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20',
  'Resuelto': 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30 hover:bg-green-500/20',
  'Cerrado': 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30 hover:bg-gray-500/20',
  'Abierto': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/20',
};

export function StateBadge({ state, className, ...props }) {
  return (
    <Badge
      variant="outline"
      className={cn(stateVariants[state] || '', className)}
      {...props}
    >
      {state}
    </Badge>
  );
}
