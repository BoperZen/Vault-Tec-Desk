import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'notification';

class NotificationService {
  // GET /notification/{idUser}
  getAll(idUser) {
    return axios.get(`${BASE_URL}/${idUser}`);
  }

  // POST /notification/read/{idNotification}
  markAsRead(idNotification) {
    return axios.post(`${BASE_URL}/read/${idNotification}`);
  }

  // POST /notification/readall/{idUser}
  markAllAsRead(idUser) {
    return axios.post(`${BASE_URL}/readall/${idUser}`);
  }
}

export default new NotificationService();
