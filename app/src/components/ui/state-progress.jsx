import { cn } from '@/lib/utils';

const states = [
  { id: 1, name: 'Pendiente', color: 'bg-red-500', lightColor: 'bg-red-500/20' },
  { id: 2, name: 'Asignado', color: 'bg-yellow-500', lightColor: 'bg-yellow-500/20' },
  { id: 3, name: 'En Proceso', color: 'bg-orange-500', lightColor: 'bg-orange-500/20' },
  { id: 4, name: 'Resuelto', color: 'bg-green-500', lightColor: 'bg-green-500/20' },
  { id: 5, name: 'Cerrado', color: 'bg-gray-400', lightColor: 'bg-gray-400/20' },
];

export function StateProgress({ currentState }) {
  const currentIndex = states.findIndex(s => s.name === currentState);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">Estado del Ticket</span>
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
            title={state.name}
          />
        ))}
      </div>
      <div className="h-3" />
    </div>
  );
}
