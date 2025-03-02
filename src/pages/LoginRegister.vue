<template>
  <div class="auth-page">
    <div class="form-container">
      <h2>Connexion</h2>
      <form @submit.prevent="handleLogin">
        <label for="email">Adresse e-mail</label>
        <input v-model="email" type="email" id="email" required placeholder="Entrez votre e-mail" autocomplete="email" />
        
        <label for="password">Mot de passe</label>
        <input v-model="password" type="password" id="password" required placeholder="Entrez votre mot de passe" autocomplete="current-password" />
        
        <button type="submit" class="golden-button">Se connecter</button>
        <p class="forgot-password">
    <router-link to="/forgot-password">Mot de passe oublié ?</router-link>
  </p>
        <p v-if="loginError" class="error-message">{{ loginError }}</p>
      </form>
    </div>

    <div class="form-container">
      <h2>Inscription</h2>
      <form @submit.prevent="handleRegister">
        <label for="register-email">Adresse e-mail</label>
        <input v-model="registerEmail" type="email" id="register-email" required placeholder="Entrez votre e-mail" autocomplete="email" />
        
        <label for="register-password">Mot de passe</label>
        <input v-model="registerPassword" type="password" id="register-password" required placeholder="Entrez votre mot de passe" autocomplete="new-password" />
        
        <label for="name">Nom</label>
        <input v-model="name" type="text" id="name" required placeholder="Entrez votre nom" autocomplete="given-name" />
        
        <label for="surname">Prénom</label>
        <input v-model="surname" type="text" id="surname" required placeholder="Entrez votre prénom" autocomplete="family-name" />
        
        <button type="submit" class="golden-button">S'inscrire</button>
        <p v-if="registerError" class="error-message">{{ registerError }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { login, register, getRole } from "@/services/AuthService";

export default {
  data() {
    return {
      email: "",
      password: "",
      registerEmail: "",
      registerPassword: "",
      name: "",
      surname: "",
      loginError: null,
      registerError: null,
      redirect: null,
    };
  },
  mounted() {
    // Garde en mémoire la page où l'utilisateur était avant de se connecter
    const query = this.$route.query;
    this.redirect = query.redirect || "/";
  },
  methods: {
    async handleLogin() {
  this.loginError = null;
  try {
    await login(this.email, this.password);
    const role = getRole();

    // 🔄 Stocker l'utilisateur dans localStorage
    const utilisateur = JSON.parse(localStorage.getItem("user"));
    if (utilisateur) {
      window.dispatchEvent(new Event("user-updated")); // 💥 Déclencher l'événement
    }

    if (role === "Admin") {
      this.$router.push("/admin");
    } else {
      // Vérifier s'il y a une réservation en attente
      const pendingReservation = localStorage.getItem("pendingReservation");
      
      if (pendingReservation) {

        localStorage.removeItem("pendingReservation");

        this.$router.push({
          name: "FormulaireReservation",
          query: JSON.parse(pendingReservation),
        });
      } else {
        this.$router.push("/");
      }
    }
  } catch (error) {
    this.loginError = "❌ Email ou mot de passe incorrect !";
  }
}


,

    async handleRegister() {
      this.registerError = null;

      if (!this.registerEmail || !this.registerPassword || !this.name || !this.surname) {
        this.registerError = "⚠️ Veuillez remplir tous les champs !";
        return;
      }

      try {
        await register({
          email: this.registerEmail,
          motDePasse: this.registerPassword,
          nom: this.name,
          prenom: this.surname,
        });

        alert("🎉 Inscription réussie ! Connectez-vous maintenant.");
        window.dispatchEvent(new Event("user-updated"));

      } catch (error) {
        this.registerError = "❌ Erreur lors de l'inscription !";
      
      if (error.response && error.response.status === 400 && error.response.data.error) {
      this.registerError = `❌ ${error.response.data.error}`;
    } else {
      this.registerError = "❌ Une erreur est survenue lors de l'inscription.";
    }}
    },
  },
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  background-color: #f8f3e7;
}

.form-container {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 45%;
  min-width: 300px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}

.golden-button {
  background-color: #d4a373;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}

.golden-button:hover {
  background-color: #c58954;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}

.forgot-password {
  text-align: center;
  margin-top: 10px;
}

.forgot-password a {
  color: #d4a373; /* 🔥 Or */
  text-decoration: none;
  font-weight: bold;
}

.forgot-password a:hover {
  text-decoration: underline;
}

/* 📱 Mode Responsive */
@media screen and (max-width: 768px) {
  .auth-page {
    flex-direction: column;
    align-items: center;
  }

  .form-container {
    width: 90%;
  }
}

@media screen and (max-width: 480px) {
  .form-container {
    width: 100%;
    padding: 20px;
  }

  input {
    font-size: 14px;
    padding: 10px;
  }

  .golden-button {
    font-size: 14px;
    padding: 10px;
  }
}


</style>
