import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL ,
  withCredentials: true, // Permet d'envoyer les cookies d'authentification si nécessaire
});

// 📌 Intercepteur pour attacher automatiquement le token d’authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 📌 Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🚨 Erreur API :", error.response?.data || error.message);

    if (error.response) {
      // 📌 Gestion des erreurs 401 (Token invalide/expiré)
      if (error.response.status === 401) {
        console.warn("🔑 Token expiré ou invalide, déconnexion en cours...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login-register"; // Redirection vers la connexion
      }
      // 📌 Gestion des erreurs 403 (Accès refusé)
      if (error.response.status === 403) {
        alert("🚫 Vous n'avez pas les permissions nécessaires pour effectuer cette action.");
      }
      // 📌 Gestion des erreurs 500 (Erreur serveur)
      if (error.response.status === 500) {
        alert("❌ Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
