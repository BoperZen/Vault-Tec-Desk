import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'category';

/**
 * Servicio para gestionar las operaciones CRUD de categorías de tickets
 * Endpoints base: http://localhost:81/Vault-Tec-Desk/api/category
 */
class CategoryService {
  /**
   * Obtiene todas las categorías del sistema
   * GET http://localhost:81/Vault-Tec-Desk/api/category
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getCategories() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtiene una categoría específica por su ID
   * GET http://localhost:81/Vault-Tec-Desk/api/category/{id}
   * @param {number} categoryId - ID de la categoría
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getCategoryById(categoryId) {
    return axios.get(`${BASE_URL}/${categoryId}`);
  }

  /**
   * Crea una nueva categoría en el sistema
   * POST http://localhost:81/Vault-Tec-Desk/api/category
   * @param {object} category - Objeto con los datos de la categoría a crear
   * @returns {Promise} - Promise con la respuesta de axios
   */
  createCategory(category) {
    return axios.post(BASE_URL, category);
  }

  /**
   * Actualiza una categoría existente
   * PUT http://localhost:81/Vault-Tec-Desk/api/category
   * @param {object} category - Objeto con los datos de la categoría a actualizar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  updateCategory(category) {
    return axios.put(BASE_URL, category);
  }

  /**
   * Elimina una categoría del sistema
   * DELETE http://localhost:81/Vault-Tec-Desk/api/category/{id}
   * @param {number} categoryId - ID de la categoría a eliminar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  deleteCategory(categoryId) {
    return axios.delete(`${BASE_URL}/${categoryId}`);
  }
}

export default new CategoryService();
