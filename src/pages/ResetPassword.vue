<template>
    <div class="reset-password-page">
      <div class="form-container" v-motion
           :initial="{ opacity: 0, scale: 0.95 }"
           :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }">
        <h2>Réinitialisation du mot de passe</h2>
        <p>Entrez le code reçu par email et votre nouveau mot de passe.</p>
        <form @submit.prevent="handleReset">
          <label for="email">Adresse e-mail</label>
          <input v-model="email" type="email" id="email" required placeholder="Votre e-mail" />
          
          <label for="code">Code (6 chiffres)</label>
          <input v-model="code" type="text" id="code" required placeholder="000000" maxlength="6" />
          
          <label for="password">Nouveau mot de passe</label>
          <input v-model="password" type="password" id="password" required placeholder="Entrez un nouveau mot de passe" />
          
          <button type="submit" class="golden-button" :disabled="isLoading">
            {{ isLoading ? "Traitement..." : "Réinitialiser" }}
          </button>
          <p v-if="message" class="success-message">{{ message }}</p>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { resetPassword } from "@/services/AuthService";
  
  export default {
    data() {
      return {
        email: "",
        code: "",
        password: "",
        message: null,
        error: null,
        isLoading: false,
      };
    },
    methods: {
      async handleReset() {
        this.message = null;
        this.error = null;
        
        if (this.code.length !== 6 || !/^\d+$/.test(this.code)) {
          this.error = "❌ Le code doit contenir 6 chiffres.";
          return;
        }
        
        this.isLoading = true;
        try {
          await resetPassword(this.email, this.code, this.password);
          this.message = "✅ Mot de passe mis à jour ! Redirection vers la connexion...";
          setTimeout(() => {
            this.$router.push("/login-register");
          }, 2500);
        } catch (error) {
          console.error("❌ Erreur API :", error);
          if (error.response?.data?.error) {
            this.error = `❌ ${error.response.data.error}`;
          } else {
            this.error = "❌ Erreur lors de la mise à jour du mot de passe.";
          }
        } finally {
          this.isLoading = false;
        }
      },
    },
  };
  </script>
  <style scoped>
  /* ✅ Style de la page */
  .reset-password-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8f3e7;
    padding: 20px;
  }
  
  /* ✅ Conteneur du formulaire */
  .form-container {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
    width: 100%;
  }
  
  /* ✅ Titre */
  h2 {
    color: #333;
    margin-bottom: 10px;
  }
  
  /* ✅ Texte sous le titre */
  p {
    color: #666;
    font-size: 14px;
    margin-bottom: 15px;
  }
  
  /* ✅ Labels */
  label {
    display: block;
    text-align: left;
    margin: 10px 0 5px;
    font-weight: bold;
  }
  
  /* ✅ Champ de texte */
  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
  
  /* ✅ Bouton doré */
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
  }
  
  .golden-button:hover {
    background-color: #c58954;
  }
  
  /* ✅ Messages de confirmation et d'erreur */
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
  
  /* ✅ Responsive pour mobile */
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
  
  