import api from "./api";

// ✅ Connexion utilisateur
export const login = async (email, password) => {
  try {
    const response = await api.post("/utilisateurs/login", { email, motDePasse: password });


    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.utilisateur));
      return response.data.utilisateur;
    } else {
      throw new Error("Token manquant !");
    }
  } catch (error) {
    console.error("❌ Erreur de connexion :", error.response?.data || error.message);
    throw error;
  }
};


// ✅ Inscription utilisateur
export const register = async (userData) => {
  try {
    const response = await api.post("/utilisateurs/inscription", userData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur d'inscription :", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Vérification du profil connecté
export const checkAuth = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {

    const response = await api.get("/utilisateurs/profil", {
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.setItem("user", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("❌ Erreur d'authentification :", error.response?.data || error.message);
    logout();
    return null;
  }
};
// ✅ Demande de réinitialisation du mot de passe (envoie un email)
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/utilisateurs/reinitialiser-mot-de-passe", { email });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de réinitialisation :", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Réinitialisation du mot de passe (via le lien reçu par email)
export const resetPassword = async (token, nouveauMotDePasse) => {
  try {
    const response = await api.put("/utilisateurs/reinitialiser-mot-de-passe", { token, nouveauMotDePasse });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation du mot de passe :", error.response?.data || error.message);
    throw error;
  }
};


// ✅ Récupération du rôle de l'utilisateur (Admin / Client)
export const getRole = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? user.typeutilisateur : null;
};


// ✅ Déconnexion
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.reload();
};
