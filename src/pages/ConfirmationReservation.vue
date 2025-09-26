<template>
  <div class="confirmation-page">
    <h2>🧾 Récapitulatif de votre réservation</h2>

    <!-- Client -->
    <div class="section">
      <h3>👤 Client</h3>
      <p><strong>Nom :</strong> {{ reservation.client.nom }}</p>
      <p><strong>Prénom :</strong> {{ reservation.client.prenom }}</p>
      <p><strong>Téléphone :</strong> {{ reservation.client.telephone }}</p>
      <p><strong>Prestation :</strong> {{ getPrestationName(reservation.client.prestation_id) }}</p>
      <p><strong>Soin visage/barbe :</strong> {{ reservation.client.avec_soin ? 'Oui (+7 €)' : 'Non' }}</p>
      <p><strong>Prix :</strong> {{ getPrixDetail(reservation.client) }}</p>
    </div>

    <!-- Participants (hors client) -->
    <div v-if="participants.length" class="section">
      <h3>👥 Personnes incluses dans la réservation</h3>
      <div v-for="(p, index) in participants" :key="index" class="participant">
        <p><strong>Nom :</strong> {{ p.nom }}</p>
        <p><strong>Prénom :</strong> {{ p.prenom }}</p>
        <p><strong>Prestation :</strong> {{ getPrestationName(p.prestation_id) }}</p>
        <p><strong>Soin :</strong> {{ p.avec_soin ? 'Oui (+7 €)' : 'Non' }}</p>
        <p><strong>Prix :</strong> {{ getPrixDetail(p) }}</p>
        <hr v-if="index < participants.length - 1" />
      </div>
    </div>

    <!-- Détails réservation -->
    <div class="section">
      <h3>📅 Détails de la réservation</h3>
      <p><strong>Date :</strong> {{ dateFormatted }}</p>
      <p><strong>Créneau :</strong> {{ dateRes.slot }} → {{ getHeureFin() }}</p>
      <p><strong>Durée estimée :</strong> {{ formatDuree(reservation.duree_totale) }}</p>
    </div>

    <!-- Lieu -->
    <div class="section">
      <h3>📍 Adresse de la prestation</h3>
      <p><strong>Adresse :</strong> {{ reservation.client.adresse }}</p>
      <p><strong>Département :</strong> {{ dateRes.departement.nom }} ({{ dateRes.departement.codePostal }})</p>
    </div>

    <!-- Paiement -->
    <div class="section">
      <h3>💰 Paiement</h3>
      <p><strong>Total à payer :</strong> {{ reservation.tarif_total }} €</p>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="back" @click="retourCalendrier">← Changer de créneau</button>
      <button class="confirm" @click="validerReservation">Confirmer la réservation</button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { getPrestations } from "@/services/PrestationService";
import api from "@/services/api";

const router = useRouter();
const reservation = JSON.parse(localStorage.getItem("reservation_en_cours")) || { client: {}, participants: [] };
const dateRes = JSON.parse(localStorage.getItem("reservation_date")) || {};

const prestations = ref([]);
const participants = computed(() => reservation.participants || []);
const isSubmitting = ref(false); // ✅ anti double-clic

const dateFormatted = new Date(dateRes.date).toLocaleDateString("fr-FR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric"
});

const fetchPrestations = async () => {
  try { prestations.value = await getPrestations(); }
  catch (e) { console.error("Erreur chargement prestations :", e); }
};
fetchPrestations();

const getPrestationName = (id) => {
  if (id === "groupe") return "Prestation de groupe (sur devis)";
  const presta = prestations.value.find(p => String(p.id) === String(id));
  return presta ? presta.nom : "Inconnue";
};

const getPrixDetail = (personne) => {
  const presta = prestations.value.find(p => String(p.id) === String(personne.prestation_id));
  if (!presta) return "Inconnu";
  const base = parseFloat(presta.prix);
  const soin = personne.avec_soin ? 7 : 0;
  return `${base} €${soin ? ` + ${soin} € (soin)` : ""} = ${(base + soin).toFixed(2)} €`;
};

const getHeureFin = () => {
  if (!dateRes.slot || !reservation.duree_totale) return "";
  const [h, m] = dateRes.slot.split(":").map(Number);
  const total = h * 60 + m + reservation.duree_totale;
  const hFin = String(Math.floor(total / 60)).padStart(2, "0");
  const mFin = String(total % 60).padStart(2, "0");
  return `${hFin}:${mFin}`;
};

const formatDuree = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h ? `${h}h${m ? m : ""}` : `${m} min`;
};

const retourCalendrier = () => {
  router.push({ name: "Reservation", params: { id: 'temp' }, query: { duree: reservation.duree_totale } });
};

// 🔁 Fallback: si POST échoue mais que la résa a été créée en BDD,
// on va la retrouver via /reservations/mes par jour + heure_debut
async function tryRecoverReservationId(token, jourISO, heureDebut) {
  try {
    const { data } = await api.get("/reservations/mes", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const found = (data || []).find(r =>
      String(r.jour).startsWith(jourISO) && String(r.heure_debut).startsWith(heureDebut)
    );
    return found?.id || null;
  } catch (e) {
    console.error("❌ Fallback /reservations/mes KO :", e?.response?.data || e);
    return null;
  }
}

const validerReservation = async () => {
  if (isSubmitting.value) return; // ✅ anti double-clic
  isSubmitting.value = true;

  try {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login-register");

    const personnes = [
      {
        nom: reservation.client.nom,
        prenom: reservation.client.prenom,
        prestation_id: reservation.client.prestation_id,
        avec_soin: reservation.client.avec_soin
      },
      ...(participants.value || [])
    ];

    // ✅ sérialiser le département pour la BDD (VARCHAR)
    const departementStr = typeof dateRes.departement === "string"
      ? dateRes.departement
      : JSON.stringify(dateRes.departement ?? {});

    const body = {
      nom: reservation.client.nom,
      prenom: reservation.client.prenom,
      telephone: reservation.client.telephone,
      adresseReservation: reservation.client.adresse,
      jour: dateRes.date,            // ex: "2025-07-11"
      heure_debut: dateRes.slot,     // ex: "14:30"
      departement: departementStr,   // toujours une string
      personnes
    };

    // 👉 POST principal
    const resp = await api.post("/reservations", body, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // ✅ Succès normal
    const reservationId = resp?.data?.reservation_id;
    if (!reservationId) throw new Error("Réservation créée mais ID manquant.");
    localStorage.removeItem("reservation_en_cours");
    localStorage.removeItem("reservation_date");
    return router.replace({ name: "SuccessPage", query: { id: reservationId } });

  } catch (e) {
    console.error("❌ Erreur POST /reservations :", e?.response?.data || e);

    // 🛟 Fallback: tenter de retrouver la résa créée
    const token = localStorage.getItem("token");
    const jourISO = dateRes.date;        // "YYYY-MM-DD"
    const heureDebut = dateRes.slot;     // "HH:mm"
    const recoveredId = await tryRecoverReservationId(token, jourISO, heureDebut);

    if (recoveredId) {
      // On a retrouvé la résa -> on nettoie et on redirige
      localStorage.removeItem("reservation_en_cours");
      localStorage.removeItem("reservation_date");
      return router.replace({ name: "SuccessPage", query: { id: recoveredId } });
    }

    // Sinon message clair
    const msg = e?.response?.data?.error || e?.message || "Une erreur est survenue, veuillez réessayer.";
    alert(msg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>


<style scoped>
.confirmation-page {
  max-width: 800px;
  margin: 30px auto;
  padding: 30px;
  background-color: #f8f3e7;
  border-radius: 10px;
  font-family: 'Segoe UI', sans-serif;
}
.section {
  margin-bottom: 25px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.participant {
  margin-bottom: 15px;
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}
button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
.back {
  background-color: #ccc;
  color: black;
}
.confirm {
  background-color: #d4a373;
  color: white;
}
.confirm:hover {
  background-color: #c58954;
}
</style>