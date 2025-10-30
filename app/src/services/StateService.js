import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'state';

class StateService {
  // Obtener un estado por ID
  // GET http://localhost:81/Vault-Tec-Desk/api/state/{id}
  getStateById(stateId) {
    return axios.get(`${BASE_URL}/${stateId}`);
  }

  // Obtener todos los estados
  // GET http://localhost:81/Vault-Tec-Desk/api/state
  getStates() {
    return axios.get(BASE_URL);
  }

  // Crear un nuevo estado
  // POST http://localhost:81/Vault-Tec-Desk/api/state
  createState(state) {
    return axios.post(BASE_URL, state);
  }

  // Actualizar un estado
  // PUT http://localhost:81/Vault-Tec-Desk/api/state
  updateState(state) {
    return axios.put(BASE_URL, state);
  }

  // Eliminar un estado
  // DELETE http://localhost:81/Vault-Tec-Desk/api/state/{id}
  deleteState(stateId) {
    return axios.delete(`${BASE_URL}/${stateId}`);
  }
}

export default new StateService();
