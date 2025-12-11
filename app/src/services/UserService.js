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
   * Crea un nuevo usuario en el sistema (Admin)
   * POST http://localhost:81/Vault-Tec-Desk/api/user/create
   * @param {object} user - Objeto con los datos del usuario a crear
   * @returns {Promise} - Promise con la respuesta de axios
   */
  createUser(user) {
    return axios.post(`${BASE_URL}/create`, user);
  }

  /**
   * Actualiza un usuario existente (sin contraseña)
   * PUT http://localhost:81/Vault-Tec-Desk/api/user/update/{id}
   * @param {number} userId - ID del usuario
   * @param {object} user - Objeto con los datos del usuario a actualizar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  updateUser(userId, user) {
    return axios.put(`${BASE_URL}/update/${userId}`, user);
  }

  /**
   * Elimina un usuario del sistema
   * DELETE http://localhost:81/Vault-Tec-Desk/api/user/delete/{id}
   * @param {number} userId - ID del usuario a eliminar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  deleteUser(userId) {
    return axios.delete(`${BASE_URL}/delete/${userId}`);
  }

  /**
   * Restablece la contraseña de un usuario
   * POST http://localhost:81/Vault-Tec-Desk/api/user/resetPassword
   * @param {number} userId - ID del usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise} - Promise con el resultado
   */
  resetPassword(userId, newPassword) {
    return axios.post(`${BASE_URL}/resetPassword`, { idUser: userId, newPassword });
  }

  /**
   * Obtiene usuarios por rol
   * GET http://localhost:81/Vault-Tec-Desk/api/user/role/{idRol}
   * @param {number} idRol - ID del rol (1=Técnico, 2=Cliente, 3=Admin)
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getUsersByRole(idRol) {
    return axios.get(`${BASE_URL}/role/${idRol}`);
  }

  /**
   * Realiza el login de un usuario
   * POST http://localhost:81/Vault-Tec-Desk/api/user/login
   * @param {object} credentials - Objeto con las credenciales (identifier, password)
   * @returns {Promise} - Promise con la respuesta de axios incluyendo token
   */
  login(credentials) {
    return axios.post(`${BASE_URL}/login`, credentials);
  }

  /**
   * Registra un nuevo usuario (cliente)
   * POST http://localhost:81/Vault-Tec-Desk/api/user/register
   * @param {object} userData - Objeto con los datos (Username, Email, Password)
   * @returns {Promise} - Promise con la respuesta de axios incluyendo token
   */
  register(userData) {
    return axios.post(`${BASE_URL}/register`, userData);
  }

  /**
   * Cambia la contraseña del usuario actual
   * POST http://localhost:81/Vault-Tec-Desk/api/user/changePassword
   * @param {object} data - {idUser, currentPassword, newPassword}
   * @returns {Promise} - Promise con el resultado
   */
  changePassword(data) {
    return axios.post(`${BASE_URL}/changePassword`, data);
  }

  /**
   * Verifica si el token actual es válido
   * POST http://localhost:81/Vault-Tec-Desk/api/user/verify
   * @param {string} token - Token JWT
   * @returns {Promise} - Promise con la respuesta de axios
   */
  verifyToken(token) {
    return axios.post(`${BASE_URL}/verify`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

export default new UserService();
