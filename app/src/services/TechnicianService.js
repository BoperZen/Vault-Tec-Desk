import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'technician';

/**
 * Servicio para gestionar las operaciones CRUD de técnicos
 * Endpoints base: http://localhost:81/Vault-Tec-Desk/api/technician
 */
class TechnicianService {
  /**
   * Obtiene todos los técnicos del sistema
   * GET http://localhost:81/Vault-Tec-Desk/api/technician
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getTechnicians() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtiene un técnico específico por su ID
   * GET http://localhost:81/Vault-Tec-Desk/api/technician/{id}
   * @param {number} technicianId - ID del técnico
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getTechnicianById(technicianId) {
    return axios.get(`${BASE_URL}/${technicianId}`);
  }

  /**
   * Crea un nuevo técnico en el sistema
   * POST http://localhost:81/Vault-Tec-Desk/api/technician
   * @param {object} technician - Objeto con los datos del técnico a crear
   * @returns {Promise} - Promise con la respuesta de axios
   */
  createTechnician(technician) {
    return axios.post(BASE_URL, technician);
  }

  /**
   * Actualiza un técnico existente
   * PUT http://localhost:81/Vault-Tec-Desk/api/technician
   * @param {object} technician - Objeto con los datos del técnico a actualizar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  updateTechnician(technician) {
    return axios.put(BASE_URL, technician);
  }

  /**
   * Elimina un técnico del sistema
   * DELETE http://localhost:81/Vault-Tec-Desk/api/technician/{id}
   * @param {number} technicianId - ID del técnico a eliminar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  deleteTechnician(technicianId) {
    return axios.delete(`${BASE_URL}/${technicianId}`);
  }
}

export default new TechnicianService();
