/**
 * Hook para obtener información del rol del usuario actual
 * 
 * Roles disponibles:
 * 1 - Técnico
 * 2 - Cliente
 * 3 - Admin
 */
export function useRole() {
  const userRole = parseInt(import.meta.env.VITE_USER_ROLE) || 2; // Default: Cliente

  return {
    role: userRole,
    isTechnician: userRole === 1,
    isClient: userRole === 2,
    isAdmin: userRole === 3,
    canViewAllTickets: userRole === 1 || userRole === 3, // Técnicos y Admins
    canManageTechnicians: userRole === 3, // Solo Admins
    canManageCategories: userRole === 3, // Solo Admins
    canAssignTickets: userRole === 1 || userRole === 3, // Técnicos y Admins
    canCloseTickets: userRole === 1 || userRole === 3, // Técnicos y Admins
  };
}
