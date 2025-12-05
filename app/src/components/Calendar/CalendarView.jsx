import { useTranslation } from 'react-i18next';
import { useRole } from '@/hooks/use-role';
import WorkCalendar from './WorkCalendar';
import WeekCalendar from './WeekCalendar';

export default function CalendarView() {
  const { t } = useTranslation();
  const { isAdmin, isTechnician, isLoadingRole } = useRole();

  if (isLoadingRole) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        {t('calendar.determiningPermissions')}
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
