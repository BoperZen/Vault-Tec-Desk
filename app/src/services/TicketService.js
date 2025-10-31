import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'ticket';

/**
 * Servicio para gestionar las operaciones CRUD de tickets
 * Endpoints base: http://localhost:81/Vault-Tec-Desk/api/ticket
 */
class TicketService {
  /**
   * Obtiene todos los tickets del sistema
   * GET http://localhost:81/Vault-Tec-Desk/api/ticket
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getTickets() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtiene los tickets de un usuario específico
   * GET http://localhost:81/Vault-Tec-Desk/api/ticket/UTicket/{idUser}
   * @param {number} idUser - ID del usuario
   * @returns {Promise} - Promise con la respuesta de axios
   */
  getTicketsByUser(idUser) {
    return axios.get(`${BASE_URL}/UTicket/${idUser}`);
  }

  /**
   * Crea un nuevo ticket en el sistema
   * POST http://localhost:81/Vault-Tec-Desk/api/ticket
   * @param {object} ticket - Objeto con los datos del ticket a crear
   * @returns {Promise} - Promise con la respuesta de axios
   */
  createTicket(ticket) {
    return axios.post(BASE_URL, ticket);
  }

  /**
   * Actualiza un ticket existente
   * PUT http://localhost:81/Vault-Tec-Desk/api/ticket
   * @param {object} ticket - Objeto con los datos del ticket a actualizar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  updateTicket(ticket) {
    return axios.put(BASE_URL, ticket);
  }

  /**
   * Elimina un ticket del sistema
   * DELETE http://localhost:81/Vault-Tec-Desk/api/ticket/{id}
   * @param {number} ticketId - ID del ticket a eliminar
   * @returns {Promise} - Promise con la respuesta de axios
   */
  deleteTicket(ticketId) {
    return axios.delete(`${BASE_URL}/${ticketId}`);
  }
}

export default new TicketService();
