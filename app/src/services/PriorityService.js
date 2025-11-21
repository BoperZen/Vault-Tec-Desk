import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'priority';

/**
 * Servicio para gestionar las operaciones de prioridades
 * Endpoints base: http://localhost:81/Vault-Tec-Desk/api/priority
 */
class PriorityService {
  /**
   * Obtiene todas las prioridades del sistema
   * GET http://localhost:81/Vault-Tec-Desk/api/priority
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getPriorities() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtiene una prioridad específica por su ID
   * GET http://localhost:81/Vault-Tec-Desk/api/priority/{id}
   * @param {number} priorityId - ID de la prioridad
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getPriority(priorityId) {
    return axios.get(`${BASE_URL}/${priorityId}`);
  }
}

export default new PriorityService();