<template>
  <div class="homepage">
   <!-- ✅ Bandeau d'information -->

   <!-- 🔔 Bandeau info e-mails indisponibles -->
<!-- 🔔 Bannière info 
<div class="maintenance-banner">
  ⚠️ L’envoi des e-mails de confirmation et d’annulation est
  <strong>temporairement indisponible</strong>.  
  Merci de bien <strong>noter la date et l’heure</strong> de votre réservation affichées à l’écran.  
  Nous faisons le maximum pour rétablir le service rapidement 🙏
</div>
-->
<!-- 🔔 Information planning -->
<div class="planning-info">
  <p>
    <strong>Information importante :</strong><br />
    <strong>Mercredi, jeudi, vendredi et samedi</strong> : rendez-vous <strong>au salon</strong>
    (176 Route de Montauban, 12200 Villefranche-de-Rouergue).<br /><br />
    <strong>Lundi et mardi</strong> : rendez-vous <strong>à domicile</strong> uniquement dans les secteurs :
    <strong>46260</strong> (Limogne-en-Quercy, Varaire) et <strong>82160</strong> (Caylus, Parisot).
  </p>
</div>


<div class="nouveautes-annonce">
  <div class="nouveautes-content">
    <img src="@/assets/images/Soins_visage.jpeg" alt="Supplément soins" class="soin-image" />
    <div class="texte">
      <h3>✨ Nouveautés</h3>
      <ul>
        <li>➕ Ajoutez jusqu’à <strong>2 personnes</strong> dans une prestation normale.</li>
        <li>👥 Choisissez la <strong>prestation de groupe</strong> pour 3 à 15 personnes.</li>
        <li>💆 Ajoutez un <strong>supplément soin visage/barbe</strong> à toute coupe pour seulement +7 €.</li>
      </ul>
      <p class="connect-msg">👉 <strong>Connectez-vous pour réserver dès maintenant !</strong></p>
      <router-link class="cta-btn" to="/login-register">Connexion / Inscription</router-link>
    </div>
  </div>
</div>


   

    

    <!-- ✅ Intro -->
    <div class="intro-section">
      <h2>Profitez des meilleures prestations coiffure directement chez vous !</h2>
      <p>
        May'Man vous offre un service de coiffure à domicile sans contrainte. Nous intervenons dans le Tarn-et-Garonne, l'Aveyron et le Lot.
        Réservez votre créneau facilement, pour vous ou en groupe, avec supplément soins visage si vous le souhaitez.
      </p>
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
          <button class="reserve-btn" @click="goToReservation(prestation)">
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
      prestations: [],
      prestationGroupe: {
        id: "groupe",
        nom: "Prestation de groupe",
        prix: "Sur devis",
        duree_minutes: null,
        soin_disponible: false
      }
    };
  },
  methods: {
    async mounted() {
      try {
        const response = await getPrestations();
        const filtrees = response.filter(
          (p) => !p.nom.toLowerCase().includes("soin seul")
        );
        this.prestations = [...filtrees, this.prestationGroupe];
      } catch (error) {
        console.error("Erreur lors du chargement des prestations :", error);
      }
    },

    goToReservation(prestation) {
      this.$router.push({
        name: "FormulaireReservation",
        query: {
          type_id: prestation.id,
          nom: prestation.nom,
          prix: prestation.prix,
          duree: prestation.duree_minutes,
          soin_dispo: prestation.soin_disponible
        }
      });
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
        "Coupe homme + Barbe rasage à l ancienne": "CoupeHommeBarbeRasageAncienne.jpeg",
        "Prestation de groupe": "PrestationGroupe.jpeg",
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
}

.reserve-btn:hover {
  background-color: #c58954;
}
.maintenance-banner {
  background-color: #fff3cd;
  color: #856404;
  padding: 15px 25px;
  margin-bottom: 20px;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  font-size: 1.1rem;
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