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
      <input v-model="client.adresse" required />

      <label>Prestation</label>
      <div v-if="isGroupe">
        <select v-model="client.prestation_id" required>
          <option v-for="p in prestations" :key="p.id" :value="p.id">{{ p.nom }}</option>
        </select>
      </div>
      <div v-else>
        <input :value="prestation.nom" disabled />
      </div>

      <label>Soin visage/barbe ?</label>
      <select v-model="client.avec_soin">
        <option :value="true">Oui</option>
        <option :value="false">Non</option>
      </select>
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
      <label>Soin visage/barbe ?</label>
      <select v-model="p.avec_soin">
        <option :value="true">Oui</option>
        <option :value="false">Non</option>
      </select>
    </div>

    <button @click="passerAuCalendrier" :disabled="!formulaireComplet">Choisir le jour et le créneau</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { checkAuth } from "@/services/AuthService";
import { getPrestations } from "@/services/PrestationService";

const route = useRoute();
const router = useRouter();

const isGroupe = route.query?.type_id === "groupe";
const prestation = {
  id: route.query.type_id,
  nom: route.query.nom,
  prix: route.query.prix,
  duree_minutes: route.query.duree,
};

const prestations = ref([]);
const participants = ref([]);
const nombrePersonnes = ref(isGroupe ? 2 : 0);
const accompagne = ref(false);

const client = ref({
  nom: "",
  prenom: "",
  telephone: "",
  adresse: "",
  prestation_id: isGroupe ? null : prestation.id,
  avec_soin: false,
});

onMounted(async () => {
  const user = await checkAuth();
  if (!user) return router.push("/login-register");

  client.value.nom = user.nom;
  client.value.prenom = user.prenom;

  const data = await getPrestations();
  prestations.value = data.filter(p => !p.nom.toLowerCase().includes("soin seul"));

  if (isGroupe && prestations.value.length) {
    client.value.prestation_id = prestations.value[0].id;
  }

  genererParticipants();
});

const genererParticipants = () => {
  const nb = isGroupe ? nombrePersonnes.value : accompagne.value ? nombrePersonnes.value : 0;
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

const formulaireComplet = computed(() => {
  if (!client.value.nom || !client.value.prenom || !client.value.telephone || !client.value.adresse || !client.value.prestation_id) {
    return false;
  }
  return participants.value.every(p => p.nom && p.prenom && p.prestation_id);
});

const passerAuCalendrier = () => {
  let total = 0;
  let duree = 15;

  const toutes = [client.value, ...participants.value];
  for (const p of toutes) {
    const presta = prestations.value.find(pr => pr.id == p.prestation_id);
    if (!presta) continue;
    total += +presta.prix + (p.avec_soin ? 7 : 0);
    duree += +presta.duree_minutes + (p.avec_soin ? 10 : 0);
  }

  const reservationData = {
    client: client.value,
    participants: participants.value,
    type_id: isGroupe ? "groupe" : prestation.id,
    duree_totale: duree,
    tarif_total: total,
  };

  localStorage.setItem("reservation_en_cours", JSON.stringify(reservationData));
  router.push({ name: "Reservation", params: { id: "temp" }, query: { duree } });
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
</style>