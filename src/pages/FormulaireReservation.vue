<template>
  <div class="reservation-form">
    <h2>Détails de réservation</h2>

    <!-- 🔹 Informations du client principal -->
    <div class="person-block">
      <h3>👤 Client principal</h3>
      <label>Nom</label>
      <input v-model="client.nom" required />
      <label>Prénom</label>
      <input v-model="client.prenom" required />
      <label>Téléphone</label>
      <input v-model="client.telephone" required />
      <label>Adresse</label>
      <input v-model="client.adresse" :readonly="reservationData?.mode === 'SALON'" required :class="{ 'readonly-field': reservationData?.mode === 'SALON' }" />
      <small v-if="reservationData?.mode === 'SALON'" style="color: #d4a373; font-weight: 600;">📍 Prestation au salon</small>
      <small v-else style="color: #999;">📍 Veuillez saisir votre adresse complète</small>

      <label>Prestation</label>
      <div v-if="isGroupe">
        <select v-model="client.prestation_id" required>
          <option v-for="p in prestations" :key="p.id" :value="p.id">{{ p.nom }}</option>
        </select>
      </div>
      <div v-else>
        <input :value="prestation.nom" disabled />
      </div>

      <label>Soin visage/barbe ? <small>(+10€, uniquement au salon)</small></label>
      <select v-model="client.avec_soin" :disabled="reservationData?.mode !== 'SALON'">
        <option :value="true">Oui</option>
        <option :value="false">Non</option>
      </select>
      <small v-if="reservationData?.mode !== 'SALON'" style="color: #999;">Le soin n'est disponible qu'au salon</small>
    </div>

    <!-- 🔹 Nombre de participants -->
    <div v-if="isGroupe">
      <label>Nombre de participants supplémentaires (2 à 14)</label>
      <input type="number" v-model.number="nombrePersonnes" min="2" max="14" @change="genererParticipants" />
    </div>
    <div v-else>
      <label>Êtes-vous accompagné(e) ?</label>
      <select v-model="accompagne" @change="genererParticipants">
        <option :value="false">Non</option>
        <option :value="true">Oui</option>
      </select>
      <div v-if="accompagne">
        <label>Nombre de personnes (1 ou 2)</label>
        <select v-model.number="nombrePersonnes" @change="genererParticipants">
          <option :value="1">1</option>
          <option :value="2">2</option>
        </select>
      </div>
    </div>

    <!-- 🔹 Participants -->
    <div v-for="(p, index) in participants" :key="index" class="person-block">
      <h3>👥 Participant {{ index + 1 }}</h3>
      <label>Nom</label>
      <input v-model="p.nom" required />
      <label>Prénom</label>
      <input v-model="p.prenom" required />
      <label>Prestation</label>
      <select v-model="p.prestation_id" required>
        <option v-for="presta in prestations" :key="presta.id" :value="presta.id">{{ presta.nom }}</option>
      </select>
      <label>Soin visage/barbe ? <small>(+10€, uniquement au salon)</small></label>
      <select v-model="p.avec_soin" :disabled="reservationData?.mode !== 'SALON'">
        <option :value="true">Oui</option>
        <option :value="false">Non</option>
      </select>
      <small v-if="reservationData?.mode !== 'SALON'" style="color: #999;">Le soin n'est disponible qu'au salon</small>
    </div>

    <button @click="passerAConfirmation" :disabled="!formulaireComplet">Confirmer et payer</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { checkAuth } from "@/services/AuthService";
import { getPrestations } from "@/services/PrestationService";

const ADRESSE_SALON = "Salon May'Man - 176 Route de Montauban, 12200 Villefranche-de-Rouergue";

const route = useRoute();
const router = useRouter();

// Récupérer les données du calendrier et de la prestation
const reservationData = ref(null);
const prestationData = ref(null);

const prestations = ref([]);
const participants = ref([]);
const nombrePersonnes = ref(0);
const accompagne = ref(false);

const client = ref({
  nom: "",
  prenom: "",
  telephone: "",
  adresse: "",
  prestation_id: null,
  avec_soin: false,
});

onMounted(async () => {
  const user = await checkAuth();
  if (!user) return router.push("/login-register");

  // Récupérer les données stockées
  const dateData = localStorage.getItem("reservation_date");
  const prestData = localStorage.getItem("selected_prestation");
  
  if (!dateData || !prestData) {
    alert("Données manquantes. Veuillez recommencer la réservation.");
    return router.push("/");
  }

  reservationData.value = JSON.parse(dateData);
  prestationData.value = JSON.parse(prestData);

  client.value.nom = user.nom;
  client.value.prenom = user.prenom;
  client.value.prestation_id = prestationData.value.id;

  // Pré-remplir l'adresse selon le mode
  if (reservationData.value.mode === 'SALON') {
    client.value.adresse = ADRESSE_SALON;
  } else if (reservationData.value.departement) {
    // Pour DOMICILE, laisser vide pour que l'utilisateur saisisse
    client.value.adresse = "";
  }

  const data = await getPrestations();
  prestations.value = data.filter(p => !p.nom.toLowerCase().includes("soin seul"));

  genererParticipants();
});

const isGroupe = computed(() => {
  return prestationData.value?.nom?.toLowerCase().includes("groupe");
});

const prestation = computed(() => prestationData.value || {});

const genererParticipants = () => {
  const nb = accompagne.value ? nombrePersonnes.value : 0;
  participants.value = [];
  for (let i = 0; i < nb; i++) {
    participants.value.push({
      nom: "",
      prenom: "",
      prestation_id: prestations.value[0]?.id || null,
      avec_soin: false,
    });
  }
};

const avecSoin = computed(() => {
  // Soin uniquement disponible au salon
  if (reservationData.value?.mode !== 'SALON') return false;
  if (client.value.avec_soin) return true;
  return participants.value.some(p => p.avec_soin);
});

// Watcher pour bloquer l'adresse si mode SALON
watch(avecSoin, (newVal) => {
  if (newVal || reservationData.value?.mode === 'SALON') {
    client.value.adresse = ADRESSE_SALON;
  }
});

const formulaireComplet = computed(() => {
  if (!client.value.nom || !client.value.prenom || !client.value.telephone || !client.value.adresse || !client.value.prestation_id) {
    return false;
  }
  return participants.value.every(p => p.nom && p.prenom && p.prestation_id);
});

const passerAConfirmation = () => {
  let total = 0;
  let duree = 15;

  const toutes = [client.value, ...participants.value];
  for (const p of toutes) {
    const presta = prestations.value.find(pr => pr.id == p.prestation_id);
    if (!presta) continue;
    total += +presta.prix + (p.avec_soin ? 10 : 0);
    duree += +presta.duree_minutes + (p.avec_soin ? 10 : 0);
  }

  const finalData = {
    ...reservationData.value, // date, créneau, département, mode
    client: client.value,
    participants: participants.value,
    duree_totale: duree,
    tarif_total: total,
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
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.readonly-field {
  background-color: #f0f0f0;
  cursor: not-allowed;
  font-weight: 600;
  color: #333;
}
</style>