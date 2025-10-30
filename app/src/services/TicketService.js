import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'ticket';

class TicketService {
  // Obtener todos los tickets
  // GET http://localhost:81/Vault-Tec-Desk/api/ticket
  getTickets() {
    return axios.get(BASE_URL);
  }

  // Obtener tickets de un usuario específico
  // GET http://localhost:81/Vault-Tec-Desk/api/ticket/UTicket/{idUser}
  getTicketsByUser(idUser) {
    return axios.get(`${BASE_URL}/UTicket/${idUser}`);
  }

  // Crear un nuevo ticket
  // POST http://localhost:81/Vault-Tec-Desk/api/ticket
  createTicket(ticket) {
    return axios.post(BASE_URL, ticket);
  }

  // Actualizar un ticket
  // PUT http://localhost:81/Vault-Tec-Desk/api/ticket
  updateTicket(ticket) {
    return axios.put(BASE_URL, ticket);
  }

  // Eliminar un ticket
  // DELETE http://localhost:81/Vault-Tec-Desk/api/ticket/{id}
  deleteTicket(ticketId) {
    return axios.delete(`${BASE_URL}/${ticketId}`);
  }
}

export default new TicketService();
