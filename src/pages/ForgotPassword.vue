<template>
    <div class="forgot-password-page">
      <div class="form-container" v-motion
           :initial="{ opacity: 0, scale: 0.95 }"
           :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }">
        <h2>Réinitialisation du mot de passe</h2>
        
        <!-- 🔹 Étape 1: Demander le code -->
        <div v-if="!codeSent" class="step-1" v-motion
             :initial="{ opacity: 0, y: 20 }"
             :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }">
          <p>Entrez votre adresse e-mail, nous vous enverrons un code pour réinitialiser votre mot de passe.</p>
          <form @submit.prevent="sendResetEmail">
            <label for="email">Adresse e-mail</label>
            <input v-model="email" type="email" id="email" required placeholder="Entrez votre e-mail" />
            
            <button type="submit" class="golden-button" :disabled="isLoading">
              {{ isLoading ? "Envoi..." : "Envoyer le code" }}
            </button>
            <p v-if="message" class="success-message">{{ message }}</p>
            <p v-if="error" class="error-message">{{ error }}</p>
          </form>
        </div>

        <!-- 🔹 Étape 2: Entrer le code et nouveau mdp -->
        <div v-else class="step-2" v-motion
             :initial="{ opacity: 0, y: 20 }"
             :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }">
          <p>✅ Code envoyé à <strong>{{ email }}</strong></p>
          <p>Entrez le code reçu par email et votre nouveau mot de passe.</p>
          
          <form @submit.prevent="handleResetWithCode">
            <label for="code">Code (6 chiffres)</label>
            <input v-model="code" type="text" id="code" required placeholder="000000" maxlength="6" />
            
            <label for="new-password">Nouveau mot de passe</label>
            <input v-model="newPassword" type="password" id="new-password" required placeholder="Entrez un nouveau mot de passe" />
            
            <button type="submit" class="golden-button" :disabled="isLoading">
              {{ isLoading ? "Traitement..." : "Réinitialiser" }}
            </button>
            <p v-if="message" class="success-message">{{ message }}</p>
            <p v-if="error" class="error-message">{{ error }}</p>
          </form>

          <button @click="backToEmailForm" class="back-button">← Changer d'email</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { requestPasswordReset, resetPassword } from "@/services/AuthService";
  
  export default {
    data() {
      return {
        email: "",
        code: "",
        newPassword: "",
        message: null,
        error: null,
        codeSent: false,
        isLoading: false,
      };
    },
    methods: {
      async sendResetEmail() {
        this.message = null;
        this.error = null;
        this.isLoading = true;

        try {
          await requestPasswordReset(this.email);
          this.codeSent = true;
          this.message = "📩 Code envoyé à votre adresse e-mail !";
        } catch (error) {
          console.error("Erreur API :", error);
          if (error.response?.data?.error) {
            this.error = `❌ ${error.response.data.error}`;
          } else {
            this.error = "❌ Erreur lors de l'envoi du code.";
          }
        } finally {
          this.isLoading = false;
        }
      },

      async handleResetWithCode() {
        this.message = null;
        this.error = null;
        
        if (this.code.length !== 6 || !/^\d+$/.test(this.code)) {
          this.error = "❌ Le code doit contenir 6 chiffres.";
          return;
        }
        
        this.isLoading = true;
        try {
          await resetPassword(this.email, this.code, this.newPassword);
          this.message = "✅ Mot de passe réinitialisé ! Redirection vers la connexion...";
          setTimeout(() => {
            this.$router.push("/login-register");
          }, 2500);
        } catch (error) {
          console.error("Erreur API :", error);
          if (error.response?.data?.error) {
            this.error = `❌ ${error.response.data.error}`;
          } else {
            this.error = "❌ Erreur lors de la réinitialisation.";
          }
        } finally {
          this.isLoading = false;
        }
      },

      backToEmailForm() {
        this.codeSent = false;
        this.code = "";
        this.newPassword = "";
        this.message = null;
        this.error = null;
      },
    },
  };
  </script>
  
  <style scoped>
  .forgot-password-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f3e7;
    padding: 20px;
  }
  
  .form-container {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
    width: 100%;
  }
  
  h2 {
    color: #333;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 14px;
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    text-align: left;
    margin: 10px 0 5px;
    font-weight: bold;
  }
  
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
    margin-bottom: 10px;
  }
  
  .golden-button:hover:not(:disabled) {
    background-color: #c58954;
  }

  .golden-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
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

  .back-button {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ccc;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;
  }

  .back-button:hover {
    background-color: #e0e0e0;
  }
  
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
  
  