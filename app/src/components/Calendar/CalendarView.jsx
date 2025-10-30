import { useRole } from '@/hooks/use-role';
import WorkCalendar from './WorkCalendar';
import WeekCalendar from './WeekCalendar';

export default function CalendarView() {
  const { isAdmin, isTechnician } = useRole();

  // Clientes ven calendario semanal
  // Admins y Técnicos ven calendario mensual
  if (isAdmin || isTechnician) {
    return <WorkCalendar />;
  }

  return <WeekCalendar />;
}
