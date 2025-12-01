import { useRole } from '@/hooks/use-role';
import WorkCalendar from './WorkCalendar';
import WeekCalendar from './WeekCalendar';

export default function CalendarView() {
  const { isAdmin, isTechnician, isLoadingRole } = useRole();

  if (isLoadingRole) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        Determinando permisos para el calendario...
      </div>
    );
  }

  // Clientes ven calendario semanal
  // Admins y Técnicos ven calendario mensual
  if (isAdmin || isTechnician) {
    return <WorkCalendar />;
  }

  return <WeekCalendar />;
}
