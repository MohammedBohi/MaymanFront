<template>
  <div class="homepage">
    <!-- ✅ Présentation + Photo salon -->
    <div class="presentation-salon">
      <div class="presentation-texte" v-motion
           :initial="{ opacity: 0, y: 20 }"
           :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">
        <h2 class="accroche-titre">Nouveau lieu, même ambiance chaleureuse !</h2>
        <p>
          Le salon <strong>May’Man</strong> vous accueille le <strong>jeudi</strong>, <strong>vendredi</strong> et <strong>samedi</strong>.
        </p>
        <p>
          Les prestations à domicile sont disponibles le <strong>lundi</strong>, <strong>mardi</strong> et <strong>mercredi</strong>.
        </p>
        <p class="adresse">
          <span class="pin">📍</span> <strong>12 rue Champs des Chartreux, Villefranche-de-Rouergue</strong>
        </p>
        <p class="cta-text">
          <strong>Prenez rendez-vous dès maintenant !</strong>
        </p>
      </div>

      <div class="presentation-image">
        <img src="@/assets/images/ImageSalon.jpeg" alt="Le salon May'Man" />
      </div>
    </div>

    <!-- ✅ Liste des prestations -->
    <div class="prestations-container">
      <h2> Prestations</h2>
      <div class="prestations-grid">
        <div v-for="prestation in prestations" :key="prestation.id" class="prestation-card">
          <div class="image-wrapper">
            <img :src="getImage(prestation.nom, prestation.prix)" :alt="prestation.nom" class="prestation-image" />
          </div>
          <h3>{{ prestation.nom }}</h3>
          <p v-if="prestation.nom.toLowerCase().includes('enfant')" class="note-age">De 1 à 10 ans</p>
          <p>{{ prestation.prix }} €</p>
          <button 
            class="reserve-btn" 
            @click="goToReservation(prestation)">
            Réserver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPrestations } from "@/services/PrestationService";

export default {
  data() {
    return {
      prestations: []
    };
  },
  methods: {
    async mounted() {
      try {
        const response = await getPrestations();
        this.prestations = response.filter(
          (p) => !p.nom.toLowerCase().includes("soin seul")
        );
      } catch (error) {
        console.error("Erreur lors du chargement des prestations :", error);
      }
    },

    goToReservation(prestation) {
      // Bloquer la réservation si mode maintenance activé
      // if (this.modeMaintenanceActif) {
      //   alert("⚠️ Les réservations en ligne ne sont pas disponibles pour le moment.\n\nMerci de nous contacter directement.");
      //   return;
      // }

      // Stocker la prestation sélectionnée dans localStorage
      localStorage.setItem("selected_prestation", JSON.stringify({
        id: prestation.id,
        nom: prestation.nom,
        prix: prestation.prix,
        duree: prestation.duree_minutes,
        soin_dispo: prestation.soin_disponible
      }));
      
      // Rediriger vers la page de sélection des participants
      this.$router.push({ name: "SelectionPrestation" });
    },

    getImage(nom) {
      const mapping = {
        "coupe étudiante": "coupeEtudiante.jpeg",
        "coupe homme": "coupeHomme.jpeg",
        "coupe tondeuse": "coupeTondeuse.jpeg",
        "rasage barbe à l ancienne": "RasageBarbeAncienne.jpeg",
        "coupe enfant": "CoupeEnfant.jpeg",
        "barbe tondeuse": "BarbeTondeuse.jpeg",
        "coupe homme + barbe tondeuse": "CoupeHommeBarbeTondeuse.jpeg",
        "coupe homme + barbe rasage à l ancienne": "CoupeHommeBarbeRasageAncienne.jpeg"
      };

      const nomNorm = nom.toLowerCase().trim().replace(/\s+/g, ' ');
      const fileName = mapping[nomNorm] || "PhotoAccueil.jpeg";
      return require(`@/assets/images/${fileName}`);
    }
  },
  mounted() {
    this.mounted();
  },
};
</script>

<style scoped>
.homepage {
  background-color: #f8f3e7;
  padding: 20px;
  text-align: center;
}

/* Présentation + Photo salon */
.presentation-salon {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto 30px auto;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  text-align: left;
}

.presentation-texte {
  flex: 1.2;
  color: #5a3d2b;
  line-height: 1.6;
  font-size: 1.05rem;
}

.presentation-texte p { margin: 10px 0; }
.presentation-texte .adresse { font-size: 1.1rem; }
.presentation-texte .pin { margin-right: 6px; }

.accroche-titre {
  color: #d4a373;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 15px 0;
}

.cta-text {
  color: #d4a373;
  font-size: 1.1rem;
  margin-top: 15px;
}

.presentation-image {
  flex: 1;
  max-width: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.presentation-image img {
  width: 100%;
  height: 320px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.presentation-image img:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
}

/* Bloc Nouveautés */
.nouveautes-annonce {
  background-color: #fffaf3;
  border: 2px solid #d4a373;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 10px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.03);
}

.nouveautes-content {
  display: flex;
  align-items: center;
  gap: 25px;
  flex-wrap: wrap;
}

.soin-image {
  width: 180px;
  height: 180px;
  border-radius: 10px;
  object-fit: cover;
}

.texte {
  flex: 1;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #5a3d2b;
}

.texte h3 {
  margin-bottom: 10px;
  font-size: 1.4rem;
  color: #5a3d2b;
}

.texte ul {
  list-style: none;
  padding-left: 0;
  margin-bottom: 15px;
}

.texte li {
  margin-bottom: 8px;
}
.planning-info {
  background-color: #fdf5e6;
  border: 2px solid #f3d9b1;
  color: #5a3d2b;
  padding: 18px;
  margin-bottom: 25px;
  border-radius: 10px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.1rem;
  line-height: 1.5;
  text-align: center;
}

.cta-btn {
  display: inline-block;
  background-color: #d4a373;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.cta-btn:hover {
  background-color: #c58954;
}

/*  Alerte de connexion */
.alerte-connexion {
  background-color: #fdf5e6;
  color: #7b5b2f;
  border: 2px solid #f3d9b1;
  padding: 20px 30px;
  margin-bottom: 30px;
  border-radius: 10px;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.6;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
}

/*  Alerte groupe */
.alerte-groupe {
  background-color: #f1f8f5;
  color: #2b6653;
  border: 2px solid #cce8dd;
  padding: 15px 25px;
  margin-bottom: 25px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
}

/* Intro */
.intro-section {
  max-width: 800px;
  margin: 0 auto 40px;
  text-align: justify;
  line-height: 1.6;
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

/* Prestations */
.prestations-container {
  max-width: 1200px;
  margin: 0 auto;
}

.prestations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

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

.note-age {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
  margin: 2px 0;
}

.reserve-btn {
  background-color: #d4a373;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.reserve-btn:hover {
  background-color: #c58954;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-disabled {
  background-color: #ccc !important;
  color: #666 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.btn-disabled:hover {
  background-color: #ccc !important;
  transform: none !important;
  box-shadow: none !important;
}


/* ✅ Responsive */
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

  .nouveautes-content {
    flex-direction: column;
    align-items: center;
  }

  .soin-image {
    width: 100%;
    max-width: 280px;
  }

  .texte {
    text-align: center;
  }

  .presentation-salon { flex-direction: column; text-align: center; }
  .presentation-texte { text-align: left; }
  .presentation-image { max-width: 100%; }
}

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