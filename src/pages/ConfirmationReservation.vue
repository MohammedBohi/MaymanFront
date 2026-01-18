<template>
  <div class="confirmation-page">
    <h2>🧾 Récapitulatif de votre réservation</h2>

    <!-- Client -->
    <div class="section" v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      <h3>👤 Client</h3>
      <p><strong>Nom :</strong> {{ reservation.client.nom }}</p>
      <p><strong>Prénom :</strong> {{ reservation.client.prenom }}</p>
      <p><strong>Téléphone :</strong> {{ reservation.client.telephone }}</p>
      <p><strong>Prestation :</strong> {{ getPrestationName(reservation.client.prestation_id) }}</p>
      <p><strong>Soin visage/barbe :</strong> {{ reservation.client.avec_soin ? 'Oui (+10 €)' : 'Non' }}</p>
      <p><strong>Prix :</strong> {{ getPrixDetail(reservation.client) }}</p>
    </div>

    <!-- Participants (hors client) -->
    <div v-if="participants.length" class="section" v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 50 } }">
      <h3>👥 Personnes incluses dans la réservation</h3>
      <div v-for="(p, index) in participants" :key="index" class="participant">
        <p><strong>Nom :</strong> {{ p.nom }}</p>
        <p><strong>Prénom :</strong> {{ p.prenom }}</p>
        <p><strong>Prestation :</strong> {{ getPrestationName(p.prestation_id) }}</p>
        <p><strong>Soin :</strong> {{ p.avec_soin ? 'Oui (+10 €)' : 'Non' }}</p>
        <p><strong>Prix :</strong> {{ getPrixDetail(p) }}</p>
        <hr v-if="index < participants.length - 1" />
      </div>
    </div>

    <!-- Détails réservation -->
    <div class="section" v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 150 } }">
      <h3>📅 Détails de la réservation</h3>
      <p><strong>Date :</strong> {{ dateFormatted }}</p>
      <p><strong>Créneau :</strong> {{ dateRes.slot }} → {{ getHeureFin() }}</p>
      <p><strong>Durée estimée :</strong> {{ formatDuree(reservation.duree_totale) }}</p>
    </div>

    <!-- Lieu -->
    <div class="section" v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }">
      <h3>📍 Adresse de la prestation</h3>
      <template v-if="dateRes.mode === 'SALON'">
        <p>Salon May'Man - 176 Route de Montauban, Villefranche-de-Rouergue (12200)</p>
      </template>
      <template v-else>
        <p><strong>Adresse :</strong> {{ reservation.client.adresse }}</p>
        <p v-if="dateRes.departement && dateRes.departement.nom && dateRes.departement.code"><strong>Département :</strong> {{ dateRes.departement.nom }} ({{ dateRes.departement.code }})</p>
      </template>
    </div>

    <!-- Paiement -->
    <div class="section" v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 } }">
      <h3>💰 Paiement</h3>
      <p><strong>Total à payer :</strong> {{ reservation.tarif_total }} €</p>
    </div>

    <!-- Actions -->
    <div class="actions" v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 250 } }">
      <button class="back" @click="retourCalendrier">← Changer de créneau</button>
      <button class="confirm" :disabled="isSubmitting" @click="validerReservation">
        {{ isSubmitting ? 'Validation...' : 'Confirmer la réservation' }}
      </button>
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
const isSubmitting = ref(false); // anti double-clic
function goToSuccess(id) {
  // 🔓 débloque l’UI avant la nav
  isSubmitting.value = false;

  const target = { name: "SuccessPage", query: { id } };

  // 🚀 lance la nav sans bloquer
  const nav = router.replace(target);

  // 🛡️ watchdog: si pour une raison quelconque la nav ne prend pas,
  // on tente un push après 600ms
  setTimeout(() => {
    const r = router.currentRoute.value;
    const onSuccess = r.name === "SuccessPage" && String(r.query?.id || "") === String(id);
    if (!onSuccess) {
      router.push(target);
    }
  }, 600);
}

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
  const soin = personne.avec_soin ? 10 : 0;
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

// Fallback: si POST échoue mais que la résa existe déjà, on la retrouve
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
  if (isSubmitting.value) return; // anti double-clic
  isSubmitting.value = true;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      isSubmitting.value = false;
      router.push("/login-register");
      return;
    }

    const personnes = [
      {
        nom: reservation.client.nom,
        prenom: reservation.client.prenom,
        prestation_id: Number(reservation.client.prestation_id), // cast number
        avec_soin: Boolean(reservation.client.avec_soin)
      },
      ...(participants.value || []).map(p => ({
        ...p,
        prestation_id: Number(p.prestation_id),                  // cast number
        avec_soin: Boolean(p.avec_soin)
      }))
    ];

    // Préparer le département à envoyer: code pur pour DOMICILE, sinon rien
    let departementToSend = undefined;
    if (dateRes.mode === 'DOMICILE') {
      if (dateRes.departement && typeof dateRes.departement === 'object') {
        if (dateRes.departement.code) {
          departementToSend = String(dateRes.departement.code);
        } else if (dateRes.departement.codePostal) {
          departementToSend = String(dateRes.departement.codePostal).substring(0,2);
        } else {
          departementToSend = JSON.stringify(dateRes.departement);
        }
      } else if (typeof dateRes.departement === 'string') {
        departementToSend = dateRes.departement;
      }
    }

    const body = {
      nom: reservation.client.nom,
      prenom: reservation.client.prenom,
      telephone: reservation.client.telephone,
      adresseReservation: reservation.client.adresse,
      jour: dateRes.date,           // "YYYY-MM-DD"
      heure_debut: dateRes.slot,    // "HH:mm"
      ...(dateRes.mode ? { mode: dateRes.mode } : {}),
      ...(dateRes.mode === 'DOMICILE' && departementToSend ? { departement: departementToSend } : {}),
      personnes
    };

    const resp = await api.post("/reservations", body, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    });

    const reservationId = resp?.data?.reservation_id;
    if (!reservationId) throw new Error("Réservation créée mais ID manquant.");

    // Débloquer AVANT navigation
localStorage.removeItem("reservation_en_cours");
localStorage.removeItem("reservation_date");
goToSuccess(reservationId);


  } catch (e) {
    console.error("❌ POST /reservations :", e?.response?.status, e?.response?.data || e);

    // Fallback: retrouver la résa si créée malgré l'erreur (conflit/email)
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const { data: mesRes } = await api.get("/reservations/mes", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        const found = (mesRes || []).find(r =>
          String(r.jour).startsWith(dateRes.date) &&
          String(r.heure_debut).startsWith(dateRes.slot)
        );
        if (found?.id) {
        localStorage.removeItem("reservation_en_cours");
localStorage.removeItem("reservation_date");
goToSuccess(found.id);
return;
        }
      }
    } catch (recErr) {
      console.error("❌ Fallback /reservations/mes KO :", recErr?.response?.data || recErr);
    }

    const msg = e?.response?.data?.error || e?.message || "Une erreur est survenue, veuillez réessayer.";
    alert(msg);
  } finally {
    // filet de sécurité si aucune navigation n'a eu lieu
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