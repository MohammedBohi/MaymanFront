import axios from 'axios';

const baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// 📌 Attacher automatiquement le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 📌 Gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        console.warn("🔑 Token expiré ou invalide, déconnexion.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
