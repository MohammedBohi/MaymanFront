<template>
  <div class="homepage">
    <div class="intro-section">
      <h2>Profitez des meilleures prestations coiffure directement chez vous !</h2>
      <p>
        May'Man vous offre un service de coiffure haut de gamme directement chez vous, sans contrainte ni déplacement. Disponible dans plusieurs départements d'Occitanie, notamment le Tarn-et-Garonne, l'Aveyron et le Lot. Connectez-vous dès maintenant et réservez votre créneau en quelques clics !
      </p>
    </div>
    <div class="prestations-container">
      <h2>Nos Prestations</h2>
      <div class="prestations-grid">
        <div v-for="prestation in prestations" :key="prestation.id" class="prestation-card">
          <div class="image-wrapper">
            <img :src="prestation.image" :alt="prestation.nom" class="prestation-image" />
          </div>
          <h3>{{ prestation.nom }}</h3>
          <p>{{ prestation.prix }} €</p>
          <button 
  class="reserve-btn"
  @click="goToReservation(prestation.id)"
>
  Réserver
</button>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
import prestations from "@/data/prestations.js";

export default {
  data() {
    return {
      prestations 
       };
  },
  methods: {
    goToReservation(id) {
  const prestation = this.prestations.find(p => p.id === id);
  if (!id) {
    console.error("❌ Erreur : ID de prestation manquant !");
    return;
  }
  if (!prestation) {
    console.error("❌ Erreur : Prestation introuvable avec ID :", id);
    return;
  }
  console.log("✅ Prestation trouvée :", prestation); // Debugging


  this.$router.push({
    name: "Reservation",
    query: {
      id: String(prestation.id),  // 🔥 Convertir en string pour éviter les erreurs
      prestationName: prestation.nom,
      prestationPrice: prestation.prix,
      prestationImage: prestation.image
    }
  });
  console.log("🔄 Redirection vers Reservation avec :", {
    id: String(prestation.id),
    prestationName: prestation.nom,
    prestationPrice: prestation.prix,
    prestationImage: prestation.image
  });
}

  },
};
</script>
<style scoped>
.homepage {
  background-color: #f8f3e7;
  padding: 20px;
  text-align: center;
}

/* ✅ Section d'introduction */
.intro-section {
  max-width: 800px;
  margin: 0 auto 40px;
  text-align: center;
  text-align: justify;  /* ✅ Ajoute la justification du texte */
    line-height: 1.6;  /* ✅ Espacement entre les lignes */


}

.intro-section h2 {
  font-size: 2rem;
  color: #5a3d2b;
  margin-bottom: 10px;
}

.intro-section p {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 20px;
}

/* ✅ Section Prestations */
.prestations-container {
  max-width: 1200px;
  margin: 0 auto;
}

.prestations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* ✅ Cartes de prestation */
.prestation-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 15px;
  overflow: hidden;
}

.image-wrapper {
  height: 300px;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.prestation-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h3 {
  font-size: 1.2rem;
  color: #5a3d2b;
  margin: 10px 0;
}

p {
  font-size: 1rem;
  color: #333;
  margin: 5px 0;
}

/* ✅ Bouton Réserver */
.reserve-btn {
  background-color: #d4a373;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.reserve-btn:hover {
  background-color: #c58954;
}

/* ✅ 📱 Responsive Mobile (écrans < 768px) */
@media (max-width: 768px) {
  .prestations-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .prestation-card {
    width: 90%;
    max-width: 350px;
    margin: 0 auto;
  }

  .image-wrapper {
    height: 220px;
  }

  .reserve-btn {
    width: 100%;
    padding: 12px;
    font-size: 0.9rem;
  }

  .intro-section {
    max-width: 90%;
  }

  .intro-section h2 {
    font-size: 1.5rem;
  }

  .intro-section p {
    font-size: 1rem;
  }
}

/* ✅ 📊 Responsive Tablette (écrans < 1024px) */
@media (max-width: 1024px) {
  .prestations-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .prestation-card {
    max-width: 400px;
  }

  .image-wrapper {
    height: 250px;
  }

  .reserve-btn {
    width: 100%;
  }
}
</style>
