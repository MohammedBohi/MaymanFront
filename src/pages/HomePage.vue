<template>
  <div class="homepage">
    <!-- 🚨 Bannière annonce fermeture salon -->
    <div class="banner-fermeture">
      <div class="banner-icon">⚠️</div>
      <div class="banner-content">
        <h2>Le salon May'Man ferme définitivement ses portes.</h2>
        <p>
          C'est avec une grande déception que je vous annonce la fin de cette aventure.
          Un immense <strong>merci</strong> à ceux qui y ont participé.
        </p>
        <p class="banner-highlight">
          🚗 Le domicile reprend désormais <strong>à plein temps à partir du 8 avril</strong>.
          Le site sera mis à jour ce week-end.
        </p>
      </div>
    </div>

    <!-- ✅ Présentation + Photo salon -->
    <div class="presentation-salon">
      <div class="presentation-texte" v-motion
           :initial="{ opacity: 0, y: 20 }"
           :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">
        <p>
          <strong>MayMan</strong> vous propose des prestations <strong>à domicile</strong>,
          exclusivement le <strong>lundi</strong> et le <strong>mardi</strong>, dans les villages suivants :
          <strong>Caylus</strong>, <strong>Parisot</strong>, <strong>Varaire</strong>, <strong>Limogne-en-Quercy</strong>.
        </p>
        <p>
          Il s’agit d’un service entièrement à domicile : elle se déplace avec tout son matériel.
          <strong>Aucun déplacement de votre part</strong>, il ne vous reste plus qu’à profiter du moment.
        </p>
        <p>
          Vous pouvez également la retrouver dans <strong>son salon de barbier</strong>, situé à
          <strong>Villefranche-de-Rouergue</strong> :
        </p>
        <p class="adresse">
          <span class="pin">📍</span> <strong>176 route de Montauban</strong>
        </p>
        <p>
          <em>Toutes les prestations sont réalisées dans son salon, il ne vous reste plus qu’à vous installer !</em>
        </p>
      </div>
      <div class="presentation-image" v-motion
           :initial="{ opacity: 0, scale: 0.96 }"
           :enter="{ opacity: 1, scale: 1, transition: { duration: 600 } }">
        <img src="@/assets/images/PhotoSalon.jpeg" alt="Salon MayMan" />
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
      // ⚙️ MODE MAINTENANCE - Passez à true pour bloquer les réservations clients
      modeMaintenanceActif: true,
      
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
        "Coupe étudiante": "coupeEtudiante.jpeg",
        "Coupe homme": "coupeHomme.jpeg",
        "Coupe tondeuse": "coupeTondeuse.jpeg",
        "Rasage barbe à l ancienne": "RasageBarbeAncienne.jpeg",
        "Coupe enfant": "CoupeEnfant.jpeg",
        "Barbe tondeuse": "BarbeTondeuse.jpeg",
        "Coupe homme + Barbe tondeuse": "CoupeHommeBarbeTondeuse.jpeg",
        "Coupe homme + Barbe rasage à l ancienne": "CoupeHommeBarbeRasageAncienne.jpeg"
      };

      const fileName = mapping[nom] || "PhotoAccueil.jpeg";
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

/* � Bannière fermeture salon */
.banner-fermeture {
  background: linear-gradient(135deg, #5a3d2b 0%, #3e2a1c 100%);
  color: #fff;
  padding: 30px 25px;
  margin-bottom: 35px;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(90, 61, 43, 0.3);
  border-left: 6px solid #d4a373;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  animation: bannerSlideIn 0.6s ease-out;
}

.banner-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  margin-top: 4px;
}

.banner-content h2 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  color: #d4a373;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.banner-content p {
  margin: 0 0 10px 0;
  font-size: 1.05rem;
  line-height: 1.6;
  color: #f0e6d6;
}

.banner-highlight {
  background: rgba(212, 163, 115, 0.15);
  border: 1px solid rgba(212, 163, 115, 0.5);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff !important;
  font-size: 1.1rem !important;
  font-weight: 600;
}

@keyframes bannerSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .banner-fermeture {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 22px 18px;
  }
  .banner-content h2 {
    font-size: 1.25rem;
  }
  .banner-content p {
    font-size: 0.95rem;
  }
}

/* �🚧 Bannière de maintenance */
.maintenance-banner {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 25px 20px;
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(238, 90, 36, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.maintenance-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.maintenance-icon {
  font-size: 3rem;
  animation: rotate 3s linear infinite;
}

.maintenance-text {
  text-align: center;
}

.maintenance-text h3 {
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.maintenance-text p {
  margin: 5px 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 6px 20px rgba(238, 90, 36, 0.4);
  }
  50% {
    box-shadow: 0 6px 30px rgba(238, 90, 36, 0.6);
  }
}

@keyframes rotate {
  0%, 100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
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

.presentation-image { flex: 1; max-width: 420px; }
.presentation-image img {
  width: 100%;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
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