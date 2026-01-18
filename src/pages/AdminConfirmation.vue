<template>
  <div class="confirmation-page" v-if="ready">
    <h2 v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">🧾 Récapitulatif de la réservation</h2>

    <!-- Client -->
    <div class="section" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400 } }">
      <h3>👤 Client</h3>
      <p><strong>Nom :</strong> {{ reservation.client.nom }}</p>
      <p><strong>Prénom :</strong> {{ reservation.client.prenom }}</p>
      <p><strong>Email :</strong> {{ reservation.client.email }}</p>
      <p><strong>Téléphone :</strong> {{ reservation.client.telephone }}</p>
      <p><strong>Adresse :</strong> {{ reservation.client.adresse }}</p><p><strong>Prestation :</strong> {{ getPrestation(reservation.client.prestation_id) }}</p>
<p><strong>Soin :</strong> {{ reservation.client.avec_soin ? 'Oui (+10€)' : 'Non' }}</p>
<p><strong>Prix :</strong> {{ getPrix(reservation.client) }} €</p>

    </div>

    <!-- Participants -->
    <div v-if="reservation.participants.length" class="section" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 100 } }">
      <h3>👥 Participants</h3>
      <div v-for="(p, index) in reservation.participants" :key="index" v-motion
           :initial="{ opacity: 0, y: 10 }"
           :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 150 + index * 50 } }">
        <p><strong>Nom :</strong> {{ p.nom }}</p>
        <p><strong>Prénom :</strong> {{ p.prenom }}</p>
        <p><strong>Prestation :</strong> {{ getPrestation(p.prestation_id) }}</p>
        <p><strong>Soin :</strong> {{ p.avec_soin ? 'Oui (+10€)' : 'Non' }}</p>
        <hr v-if="index < reservation.participants.length - 1" />
      </div>
    </div>

    <!-- Détails -->
    <div class="section" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 200 } }">
      <h3>📅 Détails</h3>
      <p><strong>Date :</strong> {{ formatDate(dateInfo.date) }}</p>
      <p><strong>Créneau :</strong> {{ dateInfo.slot }} → {{ heureFin }}</p>
      <p><strong>Durée totale :</strong> {{ formatDuree(reservation.duree_totale) }}</p>
      <p><strong>Mode :</strong> {{ afficherMode(dateInfo.mode) }}</p>
      <template v-if="dateInfo.mode === 'SALON'">
        <p>🏛️ Salon May'Man - 176 Route de Montauban, 12200 Villefranche-de-Rouergue</p>
      </template>
      <template v-else>
        <p><strong>Département :</strong> {{ dateInfo.departement }}</p>
      </template>
    </div>

    <!-- Paiement -->
    <div class="section">
      <h3>💰 Tarif</h3>
      <p><strong>Total à payer :</strong> {{ reservation.tarif_total }} €</p>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button @click="router.push('/admin/reservation-creneau')">⬅ Modifier créneau</button>
      <button class="confirm-btn" @click="validerReservation">✅ Valider</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { getPrestations } from "@/services/PrestationService";

const router = useRouter();
const reservation = ref(null);
const dateInfo = ref(null);
const prestations = ref([]);
const heureFin = ref("");
const ready = ref(false);

onMounted(async () => {
  reservation.value = JSON.parse(localStorage.getItem("admin_reservation") || "{}");
  dateInfo.value = JSON.parse(localStorage.getItem("admin_reservation_date") || "{}");

  const data = await getPrestations();
  prestations.value = data;

  if (reservation.value && dateInfo.value?.slot) {
    const [h, m] = dateInfo.value.slot.split(":").map(Number);
    const total = h * 60 + m + reservation.value.duree_totale;
    const hFin = String(Math.floor(total / 60)).padStart(2, "0");
    const mFin = String(total % 60).padStart(2, "0");
    heureFin.value = `${hFin}:${mFin}`;
  }

  ready.value = true;
});

const getPrestation = (id) => {
  const p = prestations.value.find(pr => pr.id === id);
  return p ? `${p.nom} (${p.duree_minutes}min - ${p.prix}€)` : "Inconnue";
};
const getPrix = (personne) => {
  const p = prestations.value.find(pr => pr.id === personne.prestation_id);
  if (!p) return "Inconnu";
  const base = parseFloat(p.prix);
  const soin = personne.avec_soin ? 10 : 0;
  return (base + soin).toFixed(2);
};

const afficherMode = (mode) => {
  if (mode === 'SALON') return '🏛️ Salon';
  if (mode === 'DOMICILE') return '🏠 Domicile';
  return '—';
};


const formatDuree = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m || ""}` : `${m} min`;
};

const formatDate = (str) =>
  new Date(str).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

const validerReservation = async () => {
  try {
    const { client, participants, mode, departement } = reservation.value;
    const { date, slot } = dateInfo.value;

    const body = {
      utilisateur_id: null,
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone,
      adresseReservation: client.adresse,
      jour: date,
      heure_debut: slot,
      mode,
      ...(mode === 'DOMICILE' && departement ? { departement } : {}),
      personnes: [
        {
          nom: client.nom,
          prenom: client.prenom,
          prestation_id: client.prestation_id,
          avec_soin: client.avec_soin
        },
        ...participants
      ]
    };

    const res = await api.post("/admin/reservations", body);
    localStorage.removeItem("admin_reservation");
    localStorage.removeItem("admin_reservation_date");

    router.push({ name: "AdminSuccess", query: { id: res.data.reservation_id } });
  } catch (e) {
    console.error("Erreur :", e);
    alert("Erreur lors de la validation.");
  }
};
</script>

<style scoped>
.confirmation-page {
  max-width: 900px;
  margin: 30px auto;
  padding: 30px;
  background-color: #f8f3e7;
  border-radius: 12px;
  font-family: 'Segoe UI', sans-serif;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

h2 {
  font-size: 1.8rem;
  color: #5a3d2b;
  margin-bottom: 25px;
  text-align: center;
}

.section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.section h3 {
  margin-bottom: 10px;
  color: #3e2723;
  font-size: 1.2rem;
}

p {
  margin-bottom: 6px;
  line-height: 1.5;
}

hr {
  border: none;
  border-top: 1px dashed #ccc;
  margin: 10px 0;
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
}

button {
  padding: 14px 22px;
  border-radius: 8px;
  border: none;
  font-size: 1.05rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex: 1;
}

.confirm-btn {
  background-color: #6a994e;
  color: white;
}
.confirm-btn:hover {
  background-color: #588b42;
}

.actions button:first-child {
  background-color: #d4a373;
  color: white;
}
.actions button:first-child:hover {
  background-color: #c78d56;
}

@media (max-width: 600px) {
  .actions {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}

</style>