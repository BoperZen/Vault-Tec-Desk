import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'category';

class CategoryService {
  // Obtener todas las categorías
  // GET http://localhost:81/Vault-Tec-Desk/api/category
  getCategories() {
    return axios.get(BASE_URL);
  }

  // Obtener una categoría por ID
  // GET http://localhost:81/Vault-Tec-Desk/api/category/{id}
  getCategoryById(categoryId) {
    return axios.get(`${BASE_URL}/${categoryId}`);
  }

  // Crear una nueva categoría
  // POST http://localhost:81/Vault-Tec-Desk/api/category
  createCategory(category) {
    return axios.post(BASE_URL, category);
  }

  // Actualizar una categoría
  // PUT http://localhost:81/Vault-Tec-Desk/api/category
  updateCategory(category) {
    return axios.put(BASE_URL, category);
  }

  // Eliminar una categoría
  // DELETE http://localhost:81/Vault-Tec-Desk/api/category/{id}
  deleteCategory(categoryId) {
    return axios.delete(`${BASE_URL}/${categoryId}`);
  }
}

export default new CategoryService();
