import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const states = [
  { id: 1, key: 'pending', color: 'bg-red-500', lightColor: 'bg-red-500/20' },
  { id: 2, key: 'assigned', color: 'bg-yellow-500', lightColor: 'bg-yellow-500/20' },
  { id: 3, key: 'inProgress', color: 'bg-orange-500', lightColor: 'bg-orange-500/20' },
  { id: 4, key: 'resolved', color: 'bg-green-500', lightColor: 'bg-green-500/20' },
  { id: 5, key: 'closed', color: 'bg-gray-400', lightColor: 'bg-gray-400/20' },
];

const stateNameMap = {
  'Pendiente': 'pending',
  'Asignado': 'assigned',
  'En Proceso': 'inProgress',
  'Resuelto': 'resolved',
  'Cerrado': 'closed',
};

export function StateProgress({ currentState }) {
  const { t } = useTranslation();
  const currentKey = stateNameMap[currentState] || currentState?.toLowerCase();
  const currentIndex = states.findIndex(s => s.key === currentKey);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{t('tickets.ticketState')}</span>
      </div>
      <div className="flex gap-1.5">
        {states.map((state, index) => (
          <div
            key={state.id}
            className={cn(
              "flex-1 h-2 rounded-full transition-all duration-500",
              index <= currentIndex
                ? 'bg-accent'
                : 'bg-accent/20'
            )}
            title={t(`tickets.states.${state.key}`)}
          />
        ))}
      </div>
      <div className="h-3" />
    </div>
  );
}
