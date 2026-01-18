<template>
  <div class="change-password-page">
    <div class="form-container" v-motion
         :initial="{ opacity: 0, scale: 0.95 }"
         :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }">
      <h2>Changer votre mot de passe</h2>
      <p>Saisissez votre mot de passe actuel et votre nouveau mot de passe.</p>
      
      <form @submit.prevent="handleChangePassword">
        <label for="old-password">Mot de passe actuel</label>
        <input 
          v-model="oldPassword" 
          type="password" 
          id="old-password" 
          required 
          placeholder="Votre mot de passe actuel" 
        />
        
        <label for="new-password">Nouveau mot de passe</label>
        <input 
          v-model="newPassword" 
          type="password" 
          id="new-password" 
          required 
          placeholder="Votre nouveau mot de passe" 
        />
        
        <label for="confirm-password">Confirmer le nouveau mot de passe</label>
        <input 
          v-model="confirmPassword" 
          type="password" 
          id="confirm-password" 
          required 
          placeholder="Confirmez votre nouveau mot de passe" 
        />
        
        <button type="submit" class="golden-button" :disabled="isLoading">
          {{ isLoading ? "Traitement..." : "Changer le mot de passe" }}
        </button>
        
        <p v-if="message" class="success-message">{{ message }}</p>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      
      <router-link to="/login-register" class="back-link">← Retour</router-link>
    </div>
  </div>
</template>

<script>
import { checkAuth } from "@/services/AuthService";
import { changerMotDePasse } from "@/services/AuthService";

export default {
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      message: null,
      error: null,
      isLoading: false,
    };
  },
  
  async mounted() {
    // Vérifier que l'utilisateur est connecté
    const user = await checkAuth();
    if (!user) {
      this.$router.push("/login-register");
    }
  },
  
  methods: {
    async handleChangePassword() {
      this.message = null;
      this.error = null;
      
      // Validation
      if (this.newPassword.length < 6) {
        this.error = "❌ Le nouveau mot de passe doit contenir au moins 6 caractères.";
        return;
      }
      
      if (this.newPassword !== this.confirmPassword) {
        this.error = "❌ Les mots de passe ne correspondent pas.";
        return;
      }
      
      if (this.newPassword === this.oldPassword) {
        this.error = "❌ Le nouveau mot de passe ne doit pas être identique à l'ancien.";
        return;
      }
      
      this.isLoading = true;
      try {
        await changerMotDePasse(this.oldPassword, this.newPassword);
        this.message = "✅ Mot de passe changé avec succès ! Redirection...";
        setTimeout(() => {
          this.$router.push("/login-register");
        }, 2500);
      } catch (error) {
        console.error("❌ Erreur API :", error);
        if (error.response?.data?.error) {
          this.error = `❌ ${error.response.data.error}`;
        } else {
          this.error = "❌ Erreur lors du changement de mot de passe.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Style de la page */
.change-password-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f3e7;
  padding: 20px;
}

/* Conteneur du formulaire */
.form-container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

/* Titre */
h2 {
  color: #333;
  margin-bottom: 10px;
}

/* Texte sous le titre */
p {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

/* Labels */
label {
  display: block;
  text-align: left;
  margin: 10px 0 5px;
  font-weight: bold;
}

/* Champ de texte */
input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #d4a373;
  box-shadow: 0 0 5px rgba(212, 163, 115, 0.3);
}

/* Bouton doré */
.golden-button {
  background-color: #d4a373;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  transition: background 0.3s;
  margin-bottom: 15px;
}

.golden-button:hover:not(:disabled) {
  background-color: #c58954;
}

.golden-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Messages de confirmation et d'erreur */
.success-message {
  color: green;
  margin-top: 15px;
  font-weight: bold;
}

.error-message {
  color: red;
  margin-top: 15px;
  font-weight: bold;
}

/* Lien retour */
.back-link {
  display: inline-block;
  color: #d4a373;
  text-decoration: none;
  font-weight: 600;
  margin-top: 10px;
}

.back-link:hover {
  text-decoration: underline;
}

/* Responsive pour mobile */
@media (max-width: 480px) {
  .form-container {
    width: 90%;
    padding: 20px;
  }
  
  input, .golden-button {
    font-size: 14px;
  }
}
</style>
