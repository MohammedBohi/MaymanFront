<template>
  <div class="success-page" v-if="reservation">
    <h2>🎉 Réservation enregistrée avec succès</h2>

    <!-- Client -->
    <div class="section">
      <h3>👤 Client principal</h3>
      <p><strong>Nom :</strong> {{ reservation.nom }}</p>
      <p><strong>Prénom :</strong> {{ reservation.prenom }}</p>
      <p><strong>Email :</strong> {{ reservation.email }}</p>
      <p><strong>Téléphone :</strong> {{ reservation.telephone }}</p>
      <p><strong>Adresse :</strong> {{ reservation.adressereservation }}</p>
      <p><strong>Prestation :</strong> {{ prestationClient }}</p>
<p><strong>Soin :</strong> {{ reservation.avec_soin ? 'Oui (+10 €)' : 'Non' }}</p>

    </div>

    <!-- Participants -->
    <div v-if="autres.length" class="section">
      <h3>👥 Participants</h3>
      <div v-for="(p, i) in autres" :key="i" class="participant">
        <p><strong>Nom :</strong> {{ p.nom }}</p>
        <p><strong>Prénom :</strong> {{ p.prenom }}</p>
        <p><strong>Prestation :</strong> {{ p.nom_prestation }}</p>
        <p><strong>Soin :</strong> {{ p.avec_soin ? "Oui (+10 €)" : "Non" }}</p>
        <p><strong>Prix :</strong> {{ getPrix(p) }} €</p>
        <hr v-if="i < autres.length - 1" />
      </div>
    </div>

    <!-- Détails réservation -->
    <div class="section">
      <h3>📅 Détails</h3>
      <p><strong>Date :</strong> {{ formattedDate }}</p>
      <p><strong>Créneau :</strong> {{ reservation.heure_debut }} → {{ heureFin }}</p>
      <p><strong>Durée :</strong> {{ formatDuree(reservation.duree_totale_minutes) }}</p>
      <p v-if="reservation.mode === 'SALON'"><strong>Lieu :</strong> Salon May'Man - 176 Route de Montauban, 12200 Villefranche-de-Rouergue</p>
      <p v-else-if="reservation.departement_nom && reservation.departement_code"><strong>Département :</strong> {{ reservation.departement_nom }} ({{ reservation.departement_code }})</p>
      <p v-else-if="reservation.departement"><strong>Département :</strong> {{ reservation.departement }}</p>
    </div>

    <!-- Paiement -->
    <div class="section">
      <h3>💰 Paiement</h3>
      <p><strong>Total à payer :</strong> {{ reservation.tarif }} €</p>
    </div>

    <router-link to="/admin" class="btn-retour">Retour au menu admin</router-link>
  </div>

  <div v-else class="loading">
    Chargement...
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";

const route = useRoute();
const router = useRouter();

const reservation = ref(null);
const autres = ref([]);
const formattedDate = ref("");
const heureFin = ref("");

const formatDuree = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h ? `${h}h${m ? m : ""}` : `${m} min`;
};

const getPrix = (p) => {
  const base = parseFloat(p.prix);
  return (base + (p.avec_soin ? 10 : 0)).toFixed(2);
};
const prestationClient = ref("Inconnue");

const getPrixClient = () => {
  const base = parseFloat(reservation.value.prix || 0);
  const soin = reservation.value.avec_soin ? 7 : 0;
  return (base + soin).toFixed(2);
};

onMounted(async () => {
  const id = route.query.id;
  if (!id) return router.push("/admin");

  try {
    const { data } = await api.get(`/admin/reservations/${id}`);
    reservation.value = data;

    const allPrestations = await api.get("/prestations");
    const prestation = allPrestations.data.find(p => p.id === data.personnes?.[0]?.prestation_id);
    if (prestation) {
      prestationClient.value = `${prestation.nom} (${prestation.duree_minutes}min - ${prestation.prix}€)`;
    }

    formattedDate.value = new Date(data.jour).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const d = data.duree_totale_minutes;
    const [h, m] = data.heure_debut.split(":").map(Number);
    const fin = h * 60 + m + d;
    const hFin = String(Math.floor(fin / 60)).padStart(2, "0");
    const mFin = String(fin % 60).padStart(2, "0");
    heureFin.value = `${hFin}:${mFin}`;

    const personnes = data.personnes || [];
    autres.value = personnes.length > 1 ? personnes.slice(1) : [];

  } catch (err) {
    console.error("Erreur récupération réservation :", err);
    router.push("/admin");
  }
});
</script>

<style scoped>
.success-page {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  background-color: #f8f3e7;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 25px;
  color: #5a3d2b;
}

.section {
  background: white;
  padding: 20px 25px;
  border-radius: 10px;
  margin-bottom: 25px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

h3 {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #3e2723;
}

p {
  margin-bottom: 6px;
  line-height: 1.5;
}

.participant {
  margin-bottom: 15px;
}

hr {
  border: none;
  border-top: 1px dashed #ccc;
  margin: 12px 0;
}

.btn-retour {
  display: inline-block;
  margin-top: 25px;
  padding: 14px 28px;
  background-color: #d4a373;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.2s ease;
}
.btn-retour:hover {
  background-color: #c58954;
}

.loading {
  text-align: center;
  margin-top: 60px;
  font-size: 1.2rem;
  color: #444;
}

</style>