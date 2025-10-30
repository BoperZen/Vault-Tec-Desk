import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'technician';

class TechnicianService {
  // Obtener todos los técnicos
  // GET http://localhost:81/Vault-Tec-Desk/api/technician
  getTechnicians() {
    return axios.get(BASE_URL);
  }

  // Obtener un técnico por ID
  // GET http://localhost:81/Vault-Tec-Desk/api/technician/{id}
  getTechnicianById(technicianId) {
    return axios.get(`${BASE_URL}/${technicianId}`);
  }

  // Crear un nuevo técnico
  // POST http://localhost:81/Vault-Tec-Desk/api/technician
  createTechnician(technician) {
    return axios.post(BASE_URL, technician);
  }

  // Actualizar un técnico
  // PUT http://localhost:81/Vault-Tec-Desk/api/technician
  updateTechnician(technician) {
    return axios.put(BASE_URL, technician);
  }

  // Eliminar un técnico
  // DELETE http://localhost:81/Vault-Tec-Desk/api/technician/{id}
  deleteTechnician(technicianId) {
    return axios.delete(`${BASE_URL}/${technicianId}`);
  }
}

export default new TechnicianService();
