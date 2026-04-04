<template>
  <div class="reservation-form">
    <h2>📝 Informations des participants</h2>

    <!-- Récapitulatif de la réservation -->
    <div class="recap-block" v-if="selectionData">
      <h3>📊 Récapitulatif</h3>
      <p><strong>Mode :</strong> <span :class="selectionData.mode === 'SALON' ? 'badge-salon' : 'badge-domicile'">{{ selectionData.mode }}</span></p>
      <p><strong>Nombre de personnes :</strong> {{ selectionData.nbPersonnes }}</p>
      <p><strong>Durée totale :</strong> {{ selectionData.duree_totale }} min</p>
      <p><strong>Prix total :</strong> {{ selectionData.prix_total.toFixed(2) }}€</p>
    </div>

    <!-- Informations de contact -->
    <div class="person-block">
      <h3>📞 Informations de contact</h3>
      <label>Email</label>
      <input v-model="contact.email" type="email" required />
      <label>Téléphone</label>
      <input v-model="contact.telephone" type="tel" required />
      <label>Adresse {{ selectionData?.mode === 'DOMICILE' ? 'de déplacement' : '' }}</label>
      <input v-model="contact.adresse" :readonly="selectionData?.mode === 'SALON'" required :class="{ 'readonly-field': selectionData?.mode === 'SALON' }" placeholder="Votre adresse complète..." />
      <small v-if="selectionData?.mode === 'SALON'" style="color: #d4a373; font-weight: 600;">📍 Rendez-vous au salon : {{ ADRESSE_SALON }}</small>
      <small v-else style="color: #e74c3c; font-weight: 600;">📍 Veuillez indiquer l'adresse complète de votre domicile pour le déplacement</small>
    </div>

    <!-- 🔹 Participants -->
    <div v-for="(p, index) in participants" :key="index" class="person-block">
      <h3>👤 Participant {{ index + 1 }}</h3>
      <p class="prestation-info">
        <strong>Prestation :</strong> {{ p.nom }} - {{ p.duree }}min - {{ p.prix.toFixed(2) }}€
        <span v-if="p.avecSoin" class="badge-soin">+ Soin visage</span>
      </p>
      <label>Nom</label>
      <input v-model="p.nomClient" required />
      <label>Prénom</label>
      <input v-model="p.prenomClient" required />
    </div>

    <button @click="passerAConfirmation" :disabled="!formulaireComplet">Confirmer la réservation</button>
    <button class="back-button" @click="$router.back()">⬅ Retour</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { checkAuth } from "@/services/AuthService";

const ADRESSE_SALON = "Salon May'Man - 12 rue Champs des Chartreux, Villefranche-de-Rouergue";

const router = useRouter();

// Récupérer les données du calendrier et de la sélection
const reservationData = ref(null);
const selectionData = ref(null);
const participants = ref([]);

const contact = ref({
  email: "",
  telephone: "",
  adresse: ""
});

onMounted(async () => {
  const user = await checkAuth();
  if (!user) return router.push("/login-register");

  // Récupérer les données stockées
  const dateData = localStorage.getItem("reservation_date");
  const selectionSaved = localStorage.getItem("client_prestation_selection");
  
  if (!dateData || !selectionSaved) {
    alert("Données manquantes. Veuillez recommencer la réservation.");
    return router.push("/");
  }

  reservationData.value = JSON.parse(dateData);
  selectionData.value = JSON.parse(selectionSaved);

  // Pré-remplir l'email avec l'utilisateur connecté
  contact.value.email = user.email || "";

  // Pré-remplir l'adresse selon le mode
  if (selectionData.value.mode === 'SALON') {
    contact.value.adresse = ADRESSE_SALON;
  }

  // Initialiser les participants avec les prestations déjà choisies
  participants.value = selectionData.value.participants.map(p => ({
    ...p,
    nomClient: "",
    prenomClient: ""
  }));
});

const formulaireComplet = computed(() => {
  if (!contact.value.email || !contact.value.telephone || !contact.value.adresse) {
    return false;
  }
  return participants.value.every(p => p.nomClient && p.prenomClient);
});

const passerAConfirmation = () => {
  const finalData = {
    ...reservationData.value, // date, créneau, département, mode
    contact: contact.value,
    participants: participants.value,
    duree_totale: selectionData.value.duree_totale,
    tarif_total: selectionData.value.prix_total,
  };

  localStorage.setItem("reservation_finale", JSON.stringify(finalData));
  router.push({ name: "ConfirmationReservation" });
};
</script>

<style scoped>
.reservation-form {
  background-color: #f8f3e7;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 800px;
  margin: 30px auto;
}
.person-block {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 5px solid #d4a373;
  border-radius: 8px;
}

.recap-block {
  background: linear-gradient(135deg, #e8f4f8 0%, #d4e8f0 100%);
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 10px;
  border-left: 5px solid #457b9d;
}

.recap-block h3 {
  margin-top: 0;
  color: #5a3d2b;
}

.recap-block p {
  margin: 8px 0;
  font-size: 1.05rem;
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
  margin-bottom: 5px;
  font-weight: 600;
}

input,
select {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: #d4a373;
  color: white;
  padding: 12px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  width: 100%;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.back-button {
  background-color: #6c757d;
}

.back-button:hover {
  background-color: #5a6268;
}

.readonly-field {
  background-color: #f0f0f0;
  cursor: not-allowed;
  font-weight: 600;
  color: #333;
}
</style>