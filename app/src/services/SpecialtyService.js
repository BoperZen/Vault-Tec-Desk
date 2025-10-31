import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'specialty';

/**
 * Servicio para gestionar las especialidades de los técnicos
 * Endpoints base: http://localhost:81/Vault-Tec-Desk/api/specialty
 */
class SpecialtyService {
  /**
   * Obtiene todas las especialidades del sistema
   * GET http://localhost:81/Vault-Tec-Desk/api/specialty
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getSpecialties() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtiene una especialidad específica por su ID
   * GET http://localhost:81/Vault-Tec-Desk/api/specialty/{id}
   * @param {number} specialtyId - ID de la especialidad
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getSpecialtyById(specialtyId) {
    return axios.get(`${BASE_URL}/${specialtyId}`);
  }

  /**
   * Crea una nueva especialidad en el sistema
   * POST http://localhost:81/Vault-Tec-Desk/api/specialty
   * @param {object} specialty - Objeto con los datos de la especialidad a crear
   * @returns {Promise} - Promise con la respuesta de axios
   */
  createSpecialty(specialty) {
    return axios.post(BASE_URL, specialty);
  }

  /**
   * Actualiza una especialidad existente
   * PUT http://localhost:81/Vault-Tec-Desk/api/specialty
   * @param {object} specialty - Objeto con los datos de la especialidad a actualizar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  updateSpecialty(specialty) {
    return axios.put(BASE_URL, specialty);
  }

  /**
   * Elimina una especialidad del sistema
   * DELETE http://localhost:81/Vault-Tec-Desk/api/specialty/{id}
   * @param {number} specialtyId - ID de la especialidad a eliminar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  deleteSpecialty(specialtyId) {
    return axios.delete(`${BASE_URL}/${specialtyId}`);
  }
}

export default new SpecialtyService();
