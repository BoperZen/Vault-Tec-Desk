import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'assign';

class AssignService {
  // Obtener todas las asignaciones
  // GET http://localhost:81/Vault-Tec-Desk/api/assign
  getAssignments() {
    return axios.get(BASE_URL);
  }

  // Obtener una asignación por ID
  // GET http://localhost:81/Vault-Tec-Desk/api/assign/{id}
  getAssignmentById(assignId) {
    return axios.get(`${BASE_URL}/${assignId}`);
  }

  // Crear una nueva asignación
  // POST http://localhost:81/Vault-Tec-Desk/api/assign
  createAssignment(assignment) {
    return axios.post(BASE_URL, assignment);
  }

  // Actualizar una asignación
  // PUT http://localhost:81/Vault-Tec-Desk/api/assign
  updateAssignment(assignment) {
    return axios.put(BASE_URL, assignment);
  }

  // Eliminar una asignación
  // DELETE http://localhost:81/Vault-Tec-Desk/api/assign/{id}
  deleteAssignment(assignId) {
    return axios.delete(`${BASE_URL}/${assignId}`);
  }
}

export default new AssignService();
