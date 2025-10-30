import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'label';

class LabelService {
  // Obtener todas las etiquetas
  // GET http://localhost:81/Vault-Tec-Desk/api/label
  getLabels() {
    return axios.get(BASE_URL);
  }

  // Obtener una etiqueta por ID
  // GET http://localhost:81/Vault-Tec-Desk/api/label/{id}
  getLabelById(labelId) {
    return axios.get(`${BASE_URL}/${labelId}`);
  }

  // Crear una nueva etiqueta
  // POST http://localhost:81/Vault-Tec-Desk/api/label
  createLabel(label) {
    return axios.post(BASE_URL, label);
  }

  // Actualizar una etiqueta
  // PUT http://localhost:81/Vault-Tec-Desk/api/label
  updateLabel(label) {
    return axios.put(BASE_URL, label);
  }

  // Eliminar una etiqueta
  // DELETE http://localhost:81/Vault-Tec-Desk/api/label/{id}
  deleteLabel(labelId) {
    return axios.delete(`${BASE_URL}/${labelId}`);
  }
}

export default new LabelService();
