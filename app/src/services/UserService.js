import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'user';

class UserService {
  // Obtener todos los usuarios
  // GET http://localhost:81/Vault-Tec-Desk/api/user
  getUsers() {
    return axios.get(BASE_URL);
  }

  // Obtener un usuario por ID
  // GET http://localhost:81/Vault-Tec-Desk/api/user/{id}
  getUserById(userId) {
    return axios.get(`${BASE_URL}/${userId}`);
  }

  // Crear un nuevo usuario
  // POST http://localhost:81/Vault-Tec-Desk/api/user
  createUser(user) {
    return axios.post(BASE_URL, user);
  }

  // Actualizar un usuario
  // PUT http://localhost:81/Vault-Tec-Desk/api/user
  updateUser(user) {
    return axios.put(BASE_URL, user);
  }

  // Eliminar un usuario
  // DELETE http://localhost:81/Vault-Tec-Desk/api/user/{id}
  deleteUser(userId) {
    return axios.delete(`${BASE_URL}/${userId}`);
  }

  // Login de usuario
  // POST http://localhost:81/Vault-Tec-Desk/api/user/login
  login(credentials) {
    return axios.post(`${BASE_URL}/login`, credentials);
  }
}

export default new UserService();
