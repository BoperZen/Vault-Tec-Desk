import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'assign';
const WORKFLOW_URL = import.meta.env.VITE_BASE_URL + 'workflowrules';

/**
 * Servicio para gestionar las asignaciones de tickets a técnicos
 * Relaciona tickets con técnicos para su resolución
 * Endpoints base: http://localhost:81/Vault-Tec-Desk/api/assign
 */
class AssignService {
  /**
   * Obtiene todas las asignaciones del sistema
   * GET http://localhost:81/Vault-Tec-Desk/api/assign
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getAssignments() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtiene una asignación específica por su ID
   * GET http://localhost:81/Vault-Tec-Desk/api/assign/{id}
   * @param {number} assignId - ID de la asignación
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getAssignmentById(assignId) {
    return axios.get(`${BASE_URL}/${assignId}`);
  }

  /**
   * Crea una nueva asignación de ticket a técnico
   * POST http://localhost:81/Vault-Tec-Desk/api/assign
   * @param {object} assignment - Objeto con los datos de la asignación (ticket, técnico)
   * @returns {Promise} - Promise con la respuesta de axios
   */
  createAssignment(assignment) {
    return axios.post(BASE_URL, assignment);
  }

  /**
   * Actualiza una asignación existente
   * PUT http://localhost:81/Vault-Tec-Desk/api/assign
   * @param {object} assignment - Objeto con los datos de la asignación a actualizar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  updateAssignment(assignment) {
    return axios.put(BASE_URL, assignment);
  }

  /**
   * Elimina una asignación del sistema
   * DELETE http://localhost:81/Vault-Tec-Desk/api/assign/{id}
   * @param {number} assignId - ID de la asignación a eliminar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  deleteAssignment(assignId) {
    return axios.delete(`${BASE_URL}/${assignId}`);
  }

  /**
   * Obtiene todas las reglas de workflow para auto-triage ordenadas por OrderPriority
   * GET http://localhost:81/Vault-Tec-Desk/api/workflowrules
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getWorkFlowRules() {
    return axios.get(WORKFLOW_URL);
  }
}

export default new AssignService();
