import { useUser } from '@/context/UserContext';

/**
 * Hook para obtener información del rol del usuario actual
 *
 * Roles disponibles:
 * 1 - Técnico
 * 2 - Cliente
 * 3 - Admin
 */
export function useRole() {
  const { currentUser, isUserLoading } = useUser();
  const parsedRole = Number(currentUser?.idRol);
  const resolvedRole = Number.isFinite(parsedRole) && parsedRole > 0
    ? parsedRole
    : 2; // Cliente por defecto mientras se carga

  return {
    role: resolvedRole,
    isTechnician: resolvedRole === 1,
    isClient: resolvedRole === 2,
    isAdmin: resolvedRole === 3,
    canViewAllTickets: resolvedRole === 3,
    canManageTechnicians: resolvedRole === 3,
    canManageCategories: resolvedRole === 3,
    canAssignTickets: resolvedRole === 3,
    canCloseTickets: resolvedRole === 2 || resolvedRole === 3,
    isLoadingRole: isUserLoading,
  };
}
