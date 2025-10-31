import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'label';

/**
 * Servicio para gestionar las etiquetas de clasificación de tickets
 * Endpoints base: http://localhost:81/Vault-Tec-Desk/api/label
 */
class LabelService {
  /**
   * Obtiene todas las etiquetas del sistema
   * GET http://localhost:81/Vault-Tec-Desk/api/label
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getLabels() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtiene una etiqueta específica por su ID
   * GET http://localhost:81/Vault-Tec-Desk/api/label/{id}
   * @param {number} labelId - ID de la etiqueta
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getLabelById(labelId) {
    return axios.get(`${BASE_URL}/${labelId}`);
  }

  /**
   * Crea una nueva etiqueta en el sistema
   * POST http://localhost:81/Vault-Tec-Desk/api/label
   * @param {object} label - Objeto con los datos de la etiqueta a crear
   * @returns {Promise} - Promise con la respuesta de axios
   */
  createLabel(label) {
    return axios.post(BASE_URL, label);
  }

  /**
   * Actualiza una etiqueta existente
   * PUT http://localhost:81/Vault-Tec-Desk/api/label
   * @param {object} label - Objeto con los datos de la etiqueta a actualizar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  updateLabel(label) {
    return axios.put(BASE_URL, label);
  }

  /**
   * Elimina una etiqueta del sistema
   * DELETE http://localhost:81/Vault-Tec-Desk/api/label/{id}
   * @param {number} labelId - ID de la etiqueta a eliminar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  deleteLabel(labelId) {
    return axios.delete(`${BASE_URL}/${labelId}`);
  }
}

export default new LabelService();
