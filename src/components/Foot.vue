<template>
    <footer class="footer">
      <div class="footer-container">
        <!-- Logo Section -->
        <div class="logo-section">
          <img src="@/assets/icons/MaymanLogo.png" alt="May'Man Logo" class="footer-logo" />
          <p class="footer-text">Coiffeuse à domicile</p>
        </div>
        
        <!-- Info Section -->
        <div class="info-section">
          <div class="info-column">
            <div class="info-item">
              <a href="https://www.instagram.com/mayliss_man_/" target="_blank" rel="noopener noreferrer">
              <img src="@/assets/icons/Instagram.png" alt="Instagram" class="info-icon" />
              <span>@MAYLISS_MAN</span>
            </a>
            </div>
            <div class="info-item">
              <a href="https://www.facebook.com/profile.php?id=61562725125070" target="_blank" rel="noopener noreferrer">
              <img src="@/assets/icons/Facebook.png" alt="Facebook" class="info-icon" />
              <span>@MAYLISS_MAN</span>
            </a>
            </div>
          </div>
          <div class="info-column">
            <div class="info-item">
              <img src="@/assets/icons/Phone.png" alt="Phone" class="info-icon" />
              <span>07 88 44 16 10</span>
            </div>
            <div class="info-item">
              <img src="@/assets/icons/Gmail.png" alt="Email" class="info-icon" />
              <span>mayliss.mazet24@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
<style scoped>
/* ✅ Style général du footer */
.footer {
  background-color: #000;
  color: #f39c12;
  padding: 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ✅ Conteneur principal */
.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  max-width: 1200px;
}

/* ✅ Section du logo */
.logo-section {
  text-align: left;
  flex: 1;
}

.footer-logo {
  width: 80px;
  margin-bottom: 10px;
}

.footer-text {
  font-size: 14px;
}

/* ✅ Section des infos (2 colonnes) */
.info-section {
  flex: 2;
  display: flex;
  justify-content: space-between;
  gap: 80px; /* Augmente l'espace entre les colonnes */
}

/* ✅ Style des colonnes */
.info-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

/* ✅ Style des éléments */
.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-icon {
  width: 25px;
}
/* ✅ Style des liens Instagram et Facebook */
.info-item a {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f39c12; /* ✅ Gold */
  text-decoration: none;
  font-weight: bold; /* ✅ Rend le texte plus visible */
}

.info-item a:hover {
  text-decoration: underline;
  color: #ffb84d; /* ✅ Gold plus clair au survol */
}


/* 📱 ✅ **Adaptation pour mobile (< 768px)** */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column; /* 📌 Passe tout en colonne */
    align-items: center;
    text-align: center;
    gap: 20px;
    padding: 20px;
  }

  .logo-section {
    text-align: center;
    margin-bottom: 10px;
  }

  .footer-logo {
    width: 60px; /* ✅ Taille plus petite sur mobile */
  }

  .footer-text {
    font-size: 12px;
  }

  .info-section {
    flex-direction: column; /* 📌 Tout passe en colonne */
    align-items: center;
    gap: 15px;
  }

  .info-column {
    align-items: center;
  }

  .info-item {
    justify-content: center; /* 📌 Centre les icônes et le texte */
  }

  .info-icon {
    width: 18px; /* ✅ Plus petit sur mobile */
  }

  .info-item span {
    font-size: 14px;
  }
}

/* 📊 ✅ **Adaptation pour tablette (< 1024px)** */
@media (max-width: 1024px) {
  .footer-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info-section {
    flex-direction: column; /* 📌 Réorganisation en colonne */
    align-items: center;
    gap: 20px;
  }

  .info-column {
    align-items: center;
  }

  .info-item {
    justify-content: center; /* 📌 Aligne bien les éléments */
  }

  .info-icon {
    width: 20px; /* ✅ Ajuste la taille des icônes */
  }
}
</style>