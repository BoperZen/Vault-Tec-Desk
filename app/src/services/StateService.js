import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'state';

/**
 * Servicio para gestionar los estados de tickets
 * Estados: Pendiente, Asignado, En Proceso, Resuelto, Cerrado
 * Endpoints base: http://localhost:81/Vault-Tec-Desk/api/state
 */
class StateService {
  /**
   * Obtiene un estado específico por su ID
   * GET http://localhost:81/Vault-Tec-Desk/api/state/{id}
   * @param {number} stateId - ID del estado
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getStateById(stateId) {
    return axios.get(`${BASE_URL}/${stateId}`);
  }

  /**
   * Obtiene todos los estados del sistema
   * GET http://localhost:81/Vault-Tec-Desk/api/state
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getStates() {
    return axios.get(BASE_URL);
  }

  /**
   * Crea un nuevo estado en el sistema
   * POST http://localhost:81/Vault-Tec-Desk/api/state
   * @param {object} state - Objeto con los datos del estado a crear
   * @returns {Promise} - Promise con la respuesta de axios
   */
  createState(state) {
    return axios.post(BASE_URL, state);
  }

  /**
   * Actualiza un estado existente
   * PUT http://localhost:81/Vault-Tec-Desk/api/state
   * @param {object} state - Objeto con los datos del estado a actualizar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  updateState(state) {
    return axios.put(BASE_URL, state);
  }

  /**
   * Elimina un estado del sistema
   * DELETE http://localhost:81/Vault-Tec-Desk/api/state/{id}
   * @param {number} stateId - ID del estado a eliminar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  deleteState(stateId) {
    return axios.delete(`${BASE_URL}/${stateId}`);
  }
}

export default new StateService();
