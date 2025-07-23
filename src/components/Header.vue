<template>
  <header class="main-header">
    <!-- Logo May'Man en haut à gauche -->
    <div class="main-header-top-left">
      <img src="@/assets/icons/MaymanLogo.png" alt="May'Man Logo" class="logo-mayman" />
    </div>

    <!-- Photo au centre -->
    <div class="main-header-center">
      <img src="@/assets/images/PhotoAccueil.jpeg" alt="Photo accueil" class="photo-accueil" />
    </div>

    <!-- Logo Accueil en bas à gauche -->
    <div class="main-header-bottom-left">
      <router-link to="/">
        <img src="@/assets/icons/LogoAccueil.png" alt="Accueil" class="logo-accueil" />
      </router-link>
    </div>

    <!-- Section Connexion / Déconnexion -->
    <div class="main-header-bottom-right">
      <template v-if="user">
        <span class="user-info">👤 Bienvenue  {{ user.nom }} !</span>
        <button class="logout-button" @click="handleLogout">Se déconnecter</button>
      </template>
      <template v-else>
        <router-link to="/login-register">
          <img src="@/assets/icons/ConnexionLogo.png" alt="Connexion" class="logo-connexion" />
        </router-link>
      </template>
    </div>
  </header>
</template>

<script>
import { logout } from "@/services/AuthService";
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "MainHeader",
  setup() {
    const user = ref(null);

    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        user.value = storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error("❌ Erreur de parsing des données utilisateur :", error);
        user.value = null;
      }
    };

    // 🔄 Mettre à jour l'utilisateur dynamiquement
    const updateUser = () => {
      checkUser();
    };

    onMounted(() => {
      checkUser();
      window.addEventListener("user-updated", updateUser); // ✅ Ajout du listener
    });

    onUnmounted(() => {
      window.removeEventListener("user-updated", updateUser);
    });

    const handleLogout = () => {
      logout();
      localStorage.removeItem("user");
      user.value = null;
      window.dispatchEvent(new Event("user-updated")); // 🔄 Mise à jour immédiate
    };

    return { user, handleLogout };
  },
};
</script>

<style scoped>
.main-header {
  position: relative;
  background-color: #000; /* Fond noir */
  height: 250px; /* Hauteur ajustée */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.main-header-top-left {
  position: absolute;
  top: 10px; /* En haut à gauche */
  left: 20px;
}

.logo-mayman {
  width: 100px;
  height: auto;
}

.main-header-bottom-left,
.main-header-bottom-right {
  position: absolute;
  bottom: 10px; /* En bas */
}

.main-header-bottom-left {
  left: 20px; /* En bas à gauche */
}

.main-header-bottom-right {
  right: 20px; /* En bas à droite */
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-accueil,
.logo-connexion {
  width: 50px;
  height: 50px;
}

.main-header-center {
  position: absolute;
  top: 50%; /* Centre verticalement */
  left: 50%; /* Centre horizontalement */
  transform: translate(-50%, -50%);
}

.photo-accueil {
  width: 200px;
  height: 200px;
  border-radius: 50%; /* Forme ronde */
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

/* Style du bouton de déconnexion */
.logout-button {
  background-color: #d4a373;
  color: white;
  border: none;
  padding: 8px 12px;
  font-size: 0.9rem;
  border-radius: 5px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #c58954;
}

/* Style du texte utilisateur */
.user-info {
  color: white;
  font-size: 0.9rem;
}
/* ✅ 📱 Adaptation pour mobile */
@media (max-width: 768px) {
  .main-header {
    height: 200px;
    flex-direction: column;
    padding: 10px;
  }

  .main-header-top-left {
    position: absolute;
    top: 10px;
    left: 10px;
  }

  .logo-mayman {
    width: 50px; /* 📌 Plus petit pour mobile */
  }

  .main-header-center {
    top: 35%;
  }

  .photo-accueil {
    width: 150px;
    height: 150px;
    border: 3px solid #fff;
  }

  .main-header-bottom-left,
  .main-header-bottom-right {
    position: absolute;
    bottom: 5px;
  }

  .logo-accueil,
  .logo-connexion {
    width: 40px;
    height: 40px;
  }

  .logout-button {
    font-size: 0.8rem;
    padding: 6px 10px;
  }

  .user-info {
    font-size: 0.8rem;
  }
}

/* ✅ 📊 Adaptation pour tablette */
@media (max-width: 1024px) {
  .main-header {
    height: 220px;
  }

  .main-header-center {
    top: 40%;
  }

  .photo-accueil {
    width: 170px;
    height: 170px;
  }

  .logout-button {
    font-size: 0.85rem;
  }

  .user-info {
    font-size: 0.85rem;
  }
}

</style>