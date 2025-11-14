<template>
  <div class="auth-page">
    <div class="form-container">
      <h2>Connexion</h2>
      <form @submit.prevent="handleLogin">
        <label for="email">Adresse e-mail</label>
        <input v-model="email" type="email" id="email" required placeholder="Entrez votre e-mail" />
        <label for="password">Mot de passe</label>
        <input v-model="password" type="password" id="password" required placeholder="Entrez votre mot de passe" />
        <button type="submit" class="golden-button">Se connecter</button>
        <p class="forgot-password">
<!--      <router-link to="/forgot-password">Mot de passe oublié ?</router-link> -->
        </p>
        <p v-if="loginError" class="error-message">{{ loginError }}</p>
      </form>
    </div>

    <div class="form-container">
      <h2>Inscription</h2>
      <form @submit.prevent="handleRegister">
        <label for="register-email">Adresse e-mail</label>
        <input v-model="registerEmail" type="email" id="register-email" required placeholder="Entrez votre e-mail" />
        <label for="register-password">Mot de passe</label>
        <input v-model="registerPassword" type="password" id="register-password" required placeholder="Entrez votre mot de passe" />
        <label for="name">Nom</label>
        <input v-model="name" type="text" id="name" required placeholder="Entrez votre nom" />
        <label for="surname">Prénom</label>
        <input v-model="surname" type="text" id="surname" required placeholder="Entrez votre prénom" />
        <button type="submit" class="golden-button">S'inscrire</button>
        <p v-if="registerError" class="error-message">{{ registerError }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { login, register, checkAuth } from "@/services/AuthService";

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
    };
  },
  methods: {async handleLogin() {
  this.loginError = null;
  try {
    await login(this.email, this.password);

    // On attend que le profil soit bien en localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.typeutilisateur) {
      this.loginError = "❌ Problème d'identification utilisateur.";
      return;
    }

    window.dispatchEvent(new Event("user-updated"));

    // NE REDIRIGE PAS ICI → la garde s’en occupe
    this.$router.replace("/"); // juste un fallback temporaire, la garde va prendre le relais
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
          motdepasse: this.registerPassword,
          nom: this.name,
          prenom: this.surname,
        });

        alert("🎉 Inscription réussie ! Connectez-vous maintenant.");
        window.dispatchEvent(new Event("user-updated"));
      } catch (error) {
        if (error.response && error.response.data?.error) {
          this.registerError = `❌ ${error.response.data.error}`;
        } else {
          this.registerError = "❌ Une erreur est survenue lors de l'inscription.";
        }
      }
    },
  },
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  flex-wrap: wrap;
}
.form-container {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
button.golden-button {
  background-color: #d4a373;
  color: white;
  border: none;
  padding: 12px;
  width: 100%;
  border-radius: 5px;
  font-weight: bold;
}
button.golden-button:hover {
  background-color: #c68b5b;
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
  color: #d4a373;
  text-decoration: none;
  font-weight: bold;
}
</style>