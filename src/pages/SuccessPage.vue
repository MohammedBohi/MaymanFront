<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";

const route = useRoute();
const router = useRouter();

const reservation = ref(null);
const formattedDate = ref("");
const heureFin = ref("");
const dureeFormatee = ref("");
const clientPrestation = ref({ nom: "Inconnue", soin: false, prix: "?" });
const autres = ref([]);

const getPrix = (p) => {
  const base = parseFloat(p.prix);
  const total = base + (p.avec_soin ? 10 : 0);
  return total.toFixed(2);
};

const formatHeure = (heureStr) => {
  const [h, m] = heureStr.split(":");
  return `${h}:${m}`;
};

onMounted(async () => {
  const id = route.query.id;
  const token = localStorage.getItem("token");
  if (!id || !token) return router.push("/");

  try {
    const { data } = await api.get(`/reservations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Prépare les champs d'affichage selon le mode et la structure de departement
    let departementDisplay = null;
    if (data.mode === 'DOMICILE') {
      const dep = data.departement;
      if (typeof dep === 'string') {
        // code simple ("46") ou JSON stringifié
        if (/^\d{2,3}$/.test(dep)) {
          departementDisplay = { code: dep };
        } else {
          try {
            const parsed = JSON.parse(dep);
            if (parsed?.code) departementDisplay = { code: String(parsed.code) };
            else if (parsed?.codePostal) departementDisplay = { code: String(parsed.codePostal).substring(0,2) };
          } catch {}
        }
      } else if (dep && typeof dep === 'object') {
        if (dep.code) departementDisplay = { code: String(dep.code) };
        else if (dep.codePostal) departementDisplay = { code: String(dep.codePostal).substring(0,2) };
      }
    }

    reservation.value = { ...data, departementDisplay };

    formattedDate.value = new Date(data.jour).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    const d = data.duree_totale_minutes;
    dureeFormatee.value = d >= 60 ? `${Math.floor(d / 60)}h${d % 60 || ""}` : `${d} min`;

    const [h, m] = data.heure_debut.split(":").map(Number);
    const fin = h * 60 + m + d;
    heureFin.value = `${String(Math.floor(fin / 60)).padStart(2, "0")}:${String(fin % 60).padStart(2, "0")}`;

    const personnes = data.personnes || [];
    if (personnes.length) {
      const [first, ...rest] = personnes;
      clientPrestation.value = {
        nom: first.nom_prestation,
        soin: first.avec_soin,
        prix: getPrix(first)
      };
      autres.value = rest;
    }

  } catch (error) {
    console.error("❌ Erreur récupération :", error);
    router.push("/");
  }
});
</script>

<template>
  <div class="success-page" v-if="reservation">
    <h2 v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }">🎉 Merci {{ reservation.nom }} pour votre réservation !</h2>

    <!-- 👤 Client -->
    <div class="section" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 200 } }">
      <h3>👤 Informations du client</h3>
      <p><strong>Nom :</strong> {{ reservation.nom }}</p>
      <p><strong>Prénom :</strong> {{ reservation.prenom }}</p>
      <p><strong>Téléphone :</strong> {{ reservation.telephone }}</p>
      <p><strong>Prestation :</strong> {{ clientPrestation.nom }}</p>
      <p><strong>Soin visage/barbe :</strong> {{ clientPrestation.soin ? 'Oui (+10 €)' : 'Non' }}</p>
      <p><strong>Prix :</strong> {{ clientPrestation.prix }} €</p>
    </div>

    <!-- 👥 Participants -->
    <div class="section" v-if="autres.length" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 300 } }">
      <h3>👥 Personnes incluses avec le client</h3>
      <div v-for="(p, index) in autres" :key="index" class="participant" v-motion
           :initial="{ opacity: 0, y: 10 }"
           :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 350 + index * 50 } }">
        <p><strong>Nom :</strong> {{ p.nom }}</p>
        <p><strong>Prénom :</strong> {{ p.prenom }}</p>
        <p><strong>Prestation :</strong> {{ p.nom_prestation }}</p>
        <p><strong>Soin :</strong> {{ p.avec_soin ? 'Oui (+10 €)' : 'Non' }}</p>
        <p><strong>Prix :</strong> {{ getPrix(p) }} €</p>
        <hr v-if="index < autres.length - 1" />
      </div>
    </div>

    <!-- 📅 Détails -->
    <div class="section" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 400 } }">
      <h3>📅 Détails de la réservation</h3>
      <p><strong>Date :</strong> {{ formattedDate }}</p>
      <p><strong>Créneau :</strong> {{ formatHeure(reservation.heure_debut) }} → {{ heureFin }}</p>
      <p><strong>Durée estimée :</strong> {{ dureeFormatee }}</p>
      <p><strong>Adresse :</strong> {{ reservation.mode === 'SALON' ? 'Salon May\'Man - 176 Route de Montauban, 12200 Villefranche-de-Rouergue' : reservation.adressereservation }}</p>
    </div>

    <!-- 💸 Paiement -->
    <div class="section" v-motion
         :initial="{ opacity: 0, x: -30 }"
         :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 500 } }">
      <h3>💶 Paiement</h3>
      <p><strong>Total à payer :</strong> {{ reservation.tarif }} €</p>
    </div>

    <router-link to="/" class="btn-retour">Retour à l'accueil</router-link>
  </div>

  <div v-else class="loading">
    <p>Chargement de votre réservation...</p>
  </div>
</template>

<style scoped>
.success-page {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background-color: #f8f3e7;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
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
.btn-retour {
  display: inline-block;
  margin-top: 25px;
  padding: 12px 24px;
  background-color: #d4a373;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
}
.planning-info {
  background-color: #fffaf3;
  border: 2px solid #d4a373;
  padding: 18px;
  border-radius: 10px;
  margin-bottom: 25px;
  text-align: center;
  font-size: 1.05rem;
  color: #5a3d2b;
}

.adresse-salon,
.domicile-secteurs {
  margin-top: 10px;
  font-weight: 600;
  color: #333;
}

.btn-retour:hover {
  background-color: #c58954;
}
.loading {
  text-align: center;
  margin-top: 50px;
  font-size: 1.1rem;
}
</style>