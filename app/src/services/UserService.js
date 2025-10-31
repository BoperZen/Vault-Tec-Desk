import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'user';

/**
 * Servicio para gestionar las operaciones CRUD de usuarios y autenticación
 * Endpoints base: http://localhost:81/Vault-Tec-Desk/api/user
 */
class UserService {
  /**
   * Obtiene todos los usuarios del sistema
   * GET http://localhost:81/Vault-Tec-Desk/api/user
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getUsers() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtiene un usuario específico por su ID
   * GET http://localhost:81/Vault-Tec-Desk/api/user/{id}
   * @param {number} userId - ID del usuario
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getUserById(userId) {
    return axios.get(`${BASE_URL}/${userId}`);
  }

  /**
   * Crea un nuevo usuario en el sistema
   * POST http://localhost:81/Vault-Tec-Desk/api/user
   * @param {object} user - Objeto con los datos del usuario a crear
   * @returns {Promise} - Promise con la respuesta de axios
   */
  createUser(user) {
    return axios.post(BASE_URL, user);
  }

  /**
   * Actualiza un usuario existente
   * PUT http://localhost:81/Vault-Tec-Desk/api/user
   * @param {object} user - Objeto con los datos del usuario a actualizar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  updateUser(user) {
    return axios.put(BASE_URL, user);
  }

  /**
   * Elimina un usuario del sistema
   * DELETE http://localhost:81/Vault-Tec-Desk/api/user/{id}
   * @param {number} userId - ID del usuario a eliminar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  deleteUser(userId) {
    return axios.delete(`${BASE_URL}/${userId}`);
  }

  /**
   * Realiza el login de un usuario
   * POST http://localhost:81/Vault-Tec-Desk/api/user/login
   * @param {object} credentials - Objeto con las credenciales (username, password)
   * @returns {Promise} - Promise con la respuesta de axios incluyendo token
   */
  login(credentials) {
    return axios.post(`${BASE_URL}/login`, credentials);
  }
}

export default new UserService();
