<template>
  <div class="confirmation-page">
    <h2>🧾 Récapitulatif de votre réservation</h2>

    <!-- Contact -->
    <div class="section" v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      <h3>📞 Informations de contact</h3>
      <p><strong>Email :</strong> {{ reservation.contact?.email }}</p>
      <p><strong>Téléphone :</strong> {{ reservation.contact?.telephone }}</p>
    </div>

    <!-- Participants -->
    <div v-if="reservation.participants && reservation.participants.length" class="section" v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 50 } }">
      <h3>👥 Participants</h3>
      <div v-for="(p, index) in reservation.participants" :key="index" class="participant">
        <h4>👤 Participant {{ index + 1 }}</h4>
        <p><strong>Nom :</strong> {{ p.nomClient }}</p>
        <p><strong>Prénom :</strong> {{ p.prenomClient }}</p>
        <p><strong>Prestation :</strong> {{ p.nom }}</p>
        <p v-if="p.avecSoin" class="avec-soin">✨ Avec soin visage (+10€)</p>
        <p><strong>Prix :</strong> {{ p.prix.toFixed(2) }}€{{ p.avecSoin ? ' + 10€ (soin)' : '' }}</p>
        <hr v-if="index < reservation.participants.length - 1" />
      </div>
    </div>

    <!-- Détails réservation -->
    <div class="section" v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 150 } }">
      <h3>📅 Détails de la réservation</h3>
      <p><strong>Date :</strong> {{ dateFormatted }}</p>
      <p><strong>Créneau :</strong> {{ reservation.slot }} → {{ getHeureFin() }}</p>
      <p><strong>Durée estimée :</strong> {{ formatDuree(reservation.duree_totale) }}</p>
    </div>

    <!-- Lieu -->
    <div class="section" v-motion
         :initial="{ opacity: 0, y: 10 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }">
      <h3>📍 Adresse de la prestation</h3>
      <template v-if="reservation.mode === 'SALON'">
        <p>Salon May'Man - 176 Route de Montauban, Villefranche-de-Rouergue (12200)</p>
      </template>
      <template v-else>
        <p><strong>Adresse :</strong> {{ reservation.contact?.adresse }}</p>
        <p v-if="reservation.departement && reservation.departement.nom && reservation.departement.code_postal"><strong>Département :</strong> {{ reservation.departement.nom }} ({{ reservation.departement.code_postal }})</p>
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

const router = useRouter();
const reservation = JSON.parse(localStorage.getItem("reservation_finale")) || { contact: {}, participants: [] };

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

const dateFormatted = new Date(reservation.date).toLocaleDateString("fr-FR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric"
});

const getHeureFin = () => {
  if (!reservation.slot || !reservation.duree_totale) return "";
  const [h, m] = reservation.slot.split(":").map(Number);
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
  router.push({ name: "ReservationPage" });
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

    // Mapper les participants vers le format attendu par le backend
    const personnes = (reservation.participants || []).map(p => ({
      nom: p.nomClient,
      prenom: p.prenomClient,
      prestation_id: Number(p.id), // ID de la prestation
      avec_soin: Boolean(p.avecSoin)
    }));

    // Préparer le département à envoyer: code_postal pour DOMICILE, sinon rien
    let departementToSend = undefined;
    if (reservation.mode === 'DOMICILE') {
      if (reservation.departement && typeof reservation.departement === 'object') {
        if (reservation.departement.code_postal) {
          departementToSend = String(reservation.departement.code_postal);
        } else if (reservation.departement.codePostal) {
          departementToSend = String(reservation.departement.codePostal);
        } else {
          departementToSend = JSON.stringify(reservation.departement);
        }
      } else if (typeof reservation.departement === 'string') {
        departementToSend = reservation.departement;
      }
    }

    // Utiliser le premier participant comme client principal (celui qui réserve)
    const premierParticipant = reservation.participants?.[0] || {};

    const body = {
      nom: premierParticipant.nomClient || "",
      prenom: premierParticipant.prenomClient || "",
      telephone: reservation.contact?.telephone,
      adresseReservation: reservation.contact?.adresse,
      jour: reservation.date,           // "YYYY-MM-DD"
      heure_debut: reservation.slot,    // "HH:mm"
      ...(reservation.mode ? { mode: reservation.mode } : {}),
      ...(reservation.mode === 'DOMICILE' && departementToSend ? { departement: departementToSend } : {}),
      personnes
    };

    const resp = await api.post("/reservations", body, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    });

    const reservationId = resp?.data?.reservation_id;
    if (!reservationId) throw new Error("Réservation créée mais ID manquant.");

    // Débloquer AVANT navigation
    localStorage.removeItem("reservation_finale");
    localStorage.removeItem("reservation_date");
    localStorage.removeItem("selected_prestation");
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
          String(r.jour).startsWith(reservation.date) &&
          String(r.heure_debut).startsWith(reservation.slot)
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