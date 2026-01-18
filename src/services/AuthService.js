import api from "./api";

// ✅ Connexion utilisateur
export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, motdepasse: password });

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
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur d'inscription :", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Vérification du profil via token
export const checkAuth = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await api.get("/auth/profil", {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.setItem("user", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
  console.warn("🔐 Token invalide ou expiré.");
  logout(); // ✅ pour forcer le nettoyage
  return null;
}

};


// ✅ Demander code de réinitialisation (email)
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/auth/reset-password", { email });
    return response.data; // { message: "Code envoyé" }
  } catch (error) {
    console.error("❌ Erreur demande reset :", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Réinitialiser mot de passe avec email+code
export const resetPassword = async (email, code, nouveauMotDePasse) => {
  try {
    const response = await api.put("/auth/reset-password", { 
      email, 
      code, 
      nouveauMotDePasse 
    });
    return response.data; // { message: "Mot de passe réinitialisé" }
  } catch (error) {
    console.error("❌ Erreur réinitialisation :", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Changer mot de passe (utilisateur connecté)
export const changerMotDePasse = async (ancienMotDePasse, nouveauMotDePasse) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.put("/auth/changer-motdepasse", { 
      ancienMotDePasse, 
      nouveauMotDePasse 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // { message: "Mot de passe changé" }
  } catch (error) {
    console.error("❌ Erreur changement mot de passe :", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Rôle utilisateur
export const getRole = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.typeutilisateur || null;
};

// ✅ Déconnexion
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};