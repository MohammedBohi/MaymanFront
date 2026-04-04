<template>
  <div class="admin-new-resa">
    <router-link to="/admin/reservation-creneau" class="back-btn">← Retour au calendrier</router-link>
    <h1 v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">➕ Étape 3 : Informations des participants</h1>

    <!-- Affichage de la date et l'adresse sélectionnées -->
    <div class="form-block" v-if="dateInfo" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400 } }">
      <h2>📅 Date et lieu sélectionnés</h2>
      <p><strong>Date :</strong> {{ formatDate(dateInfo.date) }}</p>
      <p><strong>Créneau :</strong> {{ dateInfo.slot }}</p>
      <p><strong>Mode :</strong> <span :class="dateInfo.mode === 'SALON' ? 'badge-salon' : 'badge-domicile'">{{ dateInfo.mode }}</span></p>
      <p><strong>Nombre de personnes :</strong> {{ selectionInfo?.nbPersonnes || participants.length }}</p>
      <p><strong>Durée totale :</strong> {{ selectionInfo?.duree_totale || 0 }} min</p>
      <p><strong>Tarif total :</strong> {{ (selectionInfo?.prix_total || 0).toFixed(2) }} €</p>
    </div>

    <!-- Informations de contact -->
    <div class="form-block" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 100 } }">
      <h2>📞 Informations de contact</h2>
      <label>Email :</label>
      <input v-model="contact.email" type="email" placeholder="Email du client" required />
      
      <label>Téléphone :</label>
      <input v-model="contact.telephone" type="tel" placeholder="Numéro de téléphone" required />
      
      <label>Adresse :</label>
      <input v-model="contact.adresse" placeholder="Adresse" :readonly="dateInfo?.mode === 'SALON'" required :class="{ 'readonly-field': dateInfo?.mode === 'SALON' }" />
      <small v-if="dateInfo?.mode === 'SALON'" style="color: #d4a373; font-weight: 600;">📍 Adresse du salon pré-remplie</small>
      <small v-else style="color: #666; font-style: italic;">📍 Adresse du domicile du client</small>
    </div>

    <!-- Participants -->
    <div class="form-block" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 200 } }">
      <h2>👥 Participants ({{ participants.length }})</h2>
      <div v-for="(p, index) in participants" :key="index" class="personne-box">
        <h4>👤 Personne {{ index + 1 }}</h4>
        <p class="prestation-info">
          <strong>Prestation :</strong> {{ p.nom }} - {{ p.duree }}min - {{ p.prix.toFixed(2) }}€
          <span v-if="p.avecSoin" class="badge-soin">+ Soin visage</span>
        </p>
        
        <label>Nom :</label>
        <input v-model="p.nomClient" placeholder="Nom" required />
        
        <label>Prénom :</label>
        <input v-model="p.prenomClient" placeholder="Prénom" required />
      </div>
    </div>

    <button @click="validerEtRediriger">➡ Voir le récapitulatif</button>
  </div>
</template>

<script>
const ADRESSE_SALON = "Salon May'Man - 12 rue Champs des Chartreux, Villefranche-de-Rouergue";

export default {
  data() {
    return {
      dateInfo: null,
      selectionInfo: null,
      contact: {
        email: "",
        telephone: "",
        adresse: ""
      },
      participants: []
    };
  },
  methods: {
    formatDate(str) {
      return new Date(str).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
    },
    validerEtRediriger() {
      // Validation email et téléphone
      if (!this.contact.email || !this.contact.telephone || !this.contact.adresse) {
        alert("❌ Veuillez remplir toutes les informations de contact");
        return;
      }

      // Validation que tous les participants ont un nom et prénom
      for (const p of this.participants) {
        if (!p.nomClient || !p.prenomClient) {
          alert("❌ Veuillez remplir le nom et prénom de tous les participants");
          return;
        }
      }

      // Sauvegarder toutes les données pour la confirmation
      localStorage.setItem("admin_reservation", JSON.stringify({
        contact: this.contact,
        participants: this.participants,
        duree_totale: this.selectionInfo.duree_totale,
        prix_total: this.selectionInfo.prix_total
      }));

      this.$router.push("/admin/confirmation");
    }
  },
  mounted() {
    // Charger les données de la date depuis le calendrier
    const savedDate = localStorage.getItem("admin_reservation_date");
    if (!savedDate) {
      alert("⚠️ Veuillez d'abord choisir une date et un créneau");
      this.$router.push("/admin/reservation-creneau");
      return;
    }
    this.dateInfo = JSON.parse(savedDate);

    // Charger les participants sélectionnés
    const savedSelection = localStorage.getItem("admin_prestation_selection");
    if (!savedSelection) {
      alert("⚠️ Veuillez d'abord sélectionner les prestations");
      this.$router.push("/admin/selection-prestation");
      return;
    }
    this.selectionInfo = JSON.parse(savedSelection);

    // Initialiser les participants avec les prestations déjà choisies
    // Ajouter les champs nomClient et prenomClient pour la saisie
    this.participants = this.selectionInfo.participants.map(p => ({
      ...p,
      nomClient: "",
      prenomClient: ""
    }));

    // Pré-remplir l'adresse selon le mode
    if (this.dateInfo.mode === 'SALON') {
      this.contact.adresse = ADRESSE_SALON;
    }
  }
};
</script>

<style scoped>
.admin-new-resa {
  max-width: 900px;
  margin: 30px auto;
  padding: 30px;
  background-color: #f8f3e7;
  border-radius: 12px;
  font-family: 'Segoe UI', sans-serif;
}

.back-btn {
  display: inline-block;
  margin-bottom: 20px;
  padding: 8px 14px;
  background-color: #d4a373;
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.back-btn:hover {
  background-color: #c78d56;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-align: center;
  color: #5a3d2b;
}

input,
select {
  width: 100%;
  padding: 10px;
  font-size: 15px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.form-block {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.personne-box {
  background-color: #fff7f1;
  padding: 20px;
  margin-top: 15px;
  border-left: 5px solid #d4a373;
  border-radius: 8px;
}

.readonly-field {
  background-color: #f0f0f0 !important;
  cursor: not-allowed;
  font-weight: 600;
  color: #333;
}

.prestation-info {
  background-color: #e8f4f8;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #333;
}

.badge-soin {
  display: inline-block;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
}

.badge-salon {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 600;
}

.badge-domicile {
  display: inline-block;
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 600;
}

label {
  display: block;
  margin-top: 12px;
  margin-bottom: 5px;
  font-weight: 600;
  color: #5a3d2b;
}

button {
  background-color: #457b9d;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  width: 100%;
  margin-top: 20px;
  cursor: pointer;
}

button:hover {
  background-color: #376a88;
}
</style>