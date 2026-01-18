<template>
  <div class="admin-new-resa">
    <router-link to="/admin" class="back-btn">← Retour</router-link>
    <h1 v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">➕ Nouvelle réservation (Admin)</h1>

    <!-- Mode et Département -->
    <div class="form-block" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400 } }">
      <h2>Lieu de la prestation</h2>
      <label>Mode :</label>
      <select v-model="selectedMode" @change="resetDepartement">
        <option value="SALON">🏛️ Salon</option>
        <option value="DOMICILE">🏠 Domicile</option>
      </select>

      <div v-if="selectedMode === 'DOMICILE'">
        <label>Département :</label>
        <select v-model="selectedDepartement">
          <option disabled value="">Choisir un département</option>
          <option value="46">Lot (46)</option>
          <option value="82">Tarn-et-Garonne (82)</option>
        </select>
      </div>

      <div v-else>
        <p style="color: #666; margin-top: 10px;">✅ Salon May'Man - 176 Route de Montauban, 12200 Villefranche-de-Rouergue</p>
      </div>
    </div>

    <!-- Infos client principal -->
    <div class="form-block" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 100 } }">
      <h2>Client principal</h2>
      <input v-model="client.nom" placeholder="Nom" required />
      <input v-model="client.prenom" placeholder="Prénom" required />
      <input v-model="client.email" placeholder="Email" required />
      <input v-model="client.telephone" placeholder="Téléphone" required />
      <input v-model="client.adresse" placeholder="Adresse" :readonly="selectedMode === 'SALON'" required :class="{ 'readonly-field': selectedMode === 'SALON' }" />
      <small v-if="selectedMode === 'SALON'" style="color: #d4a373; font-weight: 600;">📍 Adresse du salon pré-remplie</small>

      <label>Prestation :</label>
      <select v-model="client.prestation_id">
        <option disabled value="">Choisir une prestation</option>
        <option v-for="p in prestations" :key="p.id" :value="p.id">
          {{ p.nom }} ({{ p.duree_minutes }} min - {{ p.prix }} €)
        </option>
      </select>

      <label v-if="selectedMode === 'SALON' && soinDisponible(client.prestation_id)" class="checkbox-label">
        <input type="checkbox" v-model="client.avec_soin" />
        Supplément soin (+10 min, +10 €)
      </label>
    </div>

    <!-- Ajout de participants -->
    <div class="form-block" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 200 } }">
      <label>Souhaitez-vous ajouter des personnes ?</label>
      <select v-model="ajoutParticipants" @change="genererParticipants">
        <option :value="false">Non</option>
        <option :value="true">Oui</option>
      </select>

      <div v-if="ajoutParticipants">
        <label>Nombre de personnes (1 à 14)</label>
        <input type="number" v-model.number="nombre" min="1" max="14" @change="genererParticipants" />
      </div>
    </div>

    <!-- Participants -->
    <div v-if="participants.length > 0" class="form-block">
      <h2>Participants</h2>
      <div v-for="(p, index) in participants" :key="index" class="personne-box">
        <h4>👤 Personne {{ index + 1 }}</h4>
        <input v-model="p.nom" placeholder="Nom" required />
        <input v-model="p.prenom" placeholder="Prénom" required />
        <label>Prestation :</label>
        <select v-model="p.prestation_id">
          <option disabled value="">Choisir une prestation</option>
          <option v-for="pres in prestations" :key="pres.id" :value="pres.id">
            {{ pres.nom }} ({{ pres.duree_minutes }} min - {{ pres.prix }} €)
          </option>
        </select>
        <label v-if="selectedMode === 'SALON' && soinDisponible(p.prestation_id)" class="checkbox-label">
          <input type="checkbox" v-model="p.avec_soin" />
          Supplément soin (+10 min, +10 €)
        </label>
      </div>
    </div>

    <button @click="validerEtRediriger">➡ Choisir le créneau</button>
  </div>
</template>

<script>
import api from "@/services/api";

const ADRESSE_SALON = "Salon May'Man - 176 Route de Montauban, 12200 Villefranche-de-Rouergue";

export default {
  data() {
    return {
      client: {
        nom: "", prenom: "", email: "mayliss.mazet24@gmail.com", telephone: "07 68 44 16 10", adresse: "",
        prestation_id: "", avec_soin: false
      },
      prestations: [],
      participants: [],
      ajoutParticipants: false,
      nombre: 1,
      selectedMode: "SALON",
      selectedDepartement: "",
    };
  },
  methods: {
    async fetchPrestations() {
      try {
        const res = await api.get("/prestations");
        this.prestations = res.data;
      } catch (err) {
        console.error("Erreur chargement prestations :", err);
      }
    },
    soinDisponible(id) {
      const p = this.prestations.find(p => p.id === id);
      return p?.soin_disponible;
    },
    genererParticipants() {
      this.participants = [];
      for (let i = 0; i < this.nombre; i++) {
        this.participants.push({
          nom: "", prenom: "", prestation_id: "", avec_soin: false
        });
      }
    },
    resetDepartement() {
      this.selectedDepartement = "";
      // Pré-remplir l'adresse selon le mode
      if (this.selectedMode === 'SALON') {
        this.client.adresse = ADRESSE_SALON;
      } else {
        this.client.adresse = "";
      }
    },
    validerEtRediriger() {
      // Validation
      if (!this.client.nom || !this.client.prenom || !this.client.email || !this.client.telephone || !this.client.adresse) {
        alert("❌ Veuillez remplir tous les champs du client");
        return;
      }

      if (this.selectedMode === "DOMICILE" && !this.selectedDepartement) {
        alert("❌ Veuillez sélectionner un département pour le mode domicile");
        return;
      }

      let total = 0;
      let duree = 15;

      const toutes = [
        { ...this.client, isClient: true },
        ...this.participants.map(p => ({ ...p, isClient: false }))
      ];

      for (const p of toutes) {
        const pres = this.prestations.find(pr => pr.id == p.prestation_id);
        if (!pres) continue;
        total += parseFloat(pres.prix) + (p.avec_soin ? 10 : 0);
        duree += pres.duree_minutes + (p.avec_soin ? 10 : 0);
      }

      localStorage.setItem("admin_reservation", JSON.stringify({
        client: this.client,
        participants: this.participants,
        mode: this.selectedMode,
        departement: this.selectedMode === "DOMICILE" ? this.selectedDepartement : null,
        duree_totale: duree,
        tarif_total: total
      }));

      this.$router.push("/admin/reservation-creneau");
    }
  },
  mounted() {
    this.fetchPrestations();
    // Initialiser l'adresse du salon si mode SALON par défaut
    if (this.selectedMode === 'SALON') {
      this.client.adresse = ADRESSE_SALON;
    }
  }
};
</script>

<style scoped>
.admin-new-resa {
  padding: 40px 20px;
  max-width: 900px;
  margin: auto;
  background-color: #f9f4ee;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-top: 10px;
}

.readonly-field {
  background-color: #f0f0f0 !important;
  cursor: not-allowed;
  font-weight: 600;
  color: #333;
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