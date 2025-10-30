import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'specialty';

class SpecialtyService {
  // Obtener todas las especialidades
  // GET http://localhost:81/Vault-Tec-Desk/api/specialty
  getSpecialties() {
    return axios.get(BASE_URL);
  }

  // Obtener una especialidad por ID
  // GET http://localhost:81/Vault-Tec-Desk/api/specialty/{id}
  getSpecialtyById(specialtyId) {
    return axios.get(`${BASE_URL}/${specialtyId}`);
  }

  // Crear una nueva especialidad
  // POST http://localhost:81/Vault-Tec-Desk/api/specialty
  createSpecialty(specialty) {
    return axios.post(BASE_URL, specialty);
  }

  // Actualizar una especialidad
  // PUT http://localhost:81/Vault-Tec-Desk/api/specialty
  updateSpecialty(specialty) {
    return axios.put(BASE_URL, specialty);
  }

  // Eliminar una especialidad
  // DELETE http://localhost:81/Vault-Tec-Desk/api/specialty/{id}
  deleteSpecialty(specialtyId) {
    return axios.delete(`${BASE_URL}/${specialtyId}`);
  }
}

export default new SpecialtyService();
