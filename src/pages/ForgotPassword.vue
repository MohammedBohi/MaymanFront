<template>
    <div class="forgot-password-page">
      <div class="form-container">
        <h2>Réinitialisation du mot de passe</h2>
        <p>Entrez votre adresse e-mail, nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
        <form @submit.prevent="sendResetEmail">
          <label for="email">Adresse e-mail</label>
          <input v-model="email" type="email" id="email" required placeholder="Entrez votre e-mail" />
          
          <button type="submit" class="golden-button">Envoyer</button>
          <p v-if="message" class="success-message">{{ message }}</p>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { requestPasswordReset } from "@/services/AuthService";
  
  export default {
    data() {
      return {
        email: "",
        message: null,
        error: null,
      };
    },
    methods: {
      async sendResetEmail() {
        this.message = null;
        this.error = null;
        try {
          await requestPasswordReset(this.email);
          this.message = "📩 Un email de réinitialisation a été envoyé !";
          setTimeout(() => this.$router.push("/login"), 5000);

        } catch (error) {
          this.error = "❌ Erreur lors de l'envoi de l'email.";
        }
      },
    },
  };
  </script>
  <style scoped>
  /* ✅ Style de la page */
  .forgot-password-page {
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
  
  