/**
 * Hook para generar URLs de avatar de DiceBear
 * Centraliza la lógica de generación de avatares para técnicos
 */

const DICEBEAR_BASE_URL = 'https://api.dicebear.com/7.x';
const DEFAULT_STYLE = 'avataaars';

/**
 * Genera la URL del avatar para un técnico
 * @param {Object} technician - Objeto del técnico con AvatarStyle, AvatarSeed y Username
 * @returns {string} URL del avatar de DiceBear
 */
export function getTechnicianAvatarUrl(technician) {
  if (!technician) return `${DICEBEAR_BASE_URL}/${DEFAULT_STYLE}/svg?seed=default`;
  
  const style = technician.AvatarStyle || DEFAULT_STYLE;
  const seed = technician.AvatarSeed || technician.Username || 'default';
  
  return `${DICEBEAR_BASE_URL}/${style}/svg?seed=${seed}`;
}

/**
 * Genera las iniciales del nombre de un técnico
 * @param {string} name - Nombre del técnico
 * @returns {string} Iniciales (máximo 2 caracteres)
 */
export function getTechnicianInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '—';
}

/**
 * Hook que provee utilidades para avatares de técnicos
 * @returns {Object} Objeto con funciones de utilidad
 */
export function useAvatar() {
  return {
    getAvatarUrl: getTechnicianAvatarUrl,
    getInitials: getTechnicianInitials,
  };
}

export default useAvatar;
