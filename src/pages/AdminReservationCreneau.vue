<template>
  <div class="reservation-page">
    <router-link to="/admin/nouvelle-reservation" class="back-btn">← Retour au formulaire</router-link>

    <h2 v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">📅 Choisissez un jour et un créneau</h2>
    <v-calendar
      mode="single"
      is-expanded
      :attributes="calendarAttributes"
      @dayclick="onDateSelected"
    />

    <div v-if="selectedDate" class="details-section" v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      <div class="selected-date-info">
        <h3>📅 Date sélectionnée : {{ formatSelectedDate(selectedDate) }}</h3>
      </div>
      <h3>Créneaux disponibles :</h3>
      <div v-if="availableSlots.length" class="slot-buttons">
        <button
          v-for="(slot, idx) in availableSlots"
          :key="slot"
          @click="selectSlot(slot)"
          :class="{ active: slot === selectedSlot }"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 300, delay: idx * 50 } }"
        >
          {{ slot }}
        </button>
      </div>
      <p v-else>Aucun créneau disponible pour cette date.</p>

      <!-- Affichage mode et département -->
      <div class="departement-select-row" v-if="adminReservationData">
        <div v-if="adminReservationData.mode === 'DOMICILE'" class="select-wrapper">
          <h3>Département :</h3>
          <select v-model="selectedDepartment">
            <option disabled value="">Choisir un département</option>
            <option value="46">Lot (46)</option>
            <option value="82">Tarn-et-Garonne (82)</option>
          </select>
        </div>

        <div class="departement-info-inline">
          <p v-if="adminReservationData.mode === 'SALON'">
            <strong>🏛️ Salon May'Man</strong><br />
            176 Route de Montauban, 12200 Villefranche-de-Rouergue
          </p>
          <div v-else>
            <p><strong>🏠 Domicile (Départements 46 et 82)</strong></p>
            <p>Département sélectionné : <strong>{{ selectedDepartment || "—" }}</strong></p>
          </div>
        </div>
      </div>

      <button
        class="reserve-button"
        :disabled="!selectedSlot || (adminReservationData?.mode === 'DOMICILE' && !selectedDepartment)"
        @click="validerReservation"
      >
        ➡ Valider et voir récapitulatif
      </button>
      <button class="back-button" @click="router.back()">⬅ Retour</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCreneauxDisponibles } from "@/services/CreneauService";

const router = useRouter();

const selectedDate = ref(null);
const selectedSlot = ref(null);
const availableSlots = ref([]);
const departments = ref([]);
const selectedDepartment = ref(null);
const duree = ref(0);

const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const SALON = {
  nom: "Salon May'Man - 176 Route de Montauban, Villefranche-de-Rouergue",
  codePostal: "12200"
};

const departementsParJour = [
  [],         // Dimanche
  "DOMICILE",   // Lundi
  "DOMICILE",   // Mardi
  "SALON",    // Mercredi
  "SALON",    // Jeudi
  "SALON",    // Vendredi
  "SALON",    // Samedi
];

const modePourJour = (day) => departementsParJour[day.getDay()] || null;

const adminReservationData = ref(null);

const getDepartmentsForDay = (day) => {
  const mode = modePourJour(day);
  if (mode === 'SALON') return [];
  // Pour DOMICILE, retourner les codes 46/82
  if (mode === 'DOMICILE') {
    return [
      { nom: "Lot", code: "46" },
      { nom: "Tarn-et-Garonne", code: "82" }
    ];
  }
  return [];
};

onMounted(() => {
  const data = localStorage.getItem("admin_reservation");
  if (data) {
    adminReservationData.value = JSON.parse(data);
    duree.value = adminReservationData.value.duree_totale;
  }
});

const onDateSelected = async ({ date }) => {
  if (!date) return;

  selectedDate.value = new Date(date);
  departments.value = [];
  await nextTick();
  departments.value = getDepartmentsForDay(selectedDate.value);
  selectedDepartment.value = departments.value[0] || null;

  await getAvailableSlots();
};

const getAvailableSlots = async () => {
  if (!selectedDate.value || !duree.value) return;

  const formatted = formatDate(selectedDate.value);
  try {
    const data = await getCreneauxDisponibles(formatted, duree.value);
    availableSlots.value = data || [];
  } catch (e) {
    console.error("Erreur chargement créneaux :", e);
    availableSlots.value = [];
  }
};

const selectSlot = (slot) => {
  selectedSlot.value = slot;
};

const formatSelectedDate = (date) => {
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const jour = jours[date.getDay()];
  const numJour = date.getDate();
  const nomMois = mois[date.getMonth()];
  const annee = date.getFullYear();
  return `${jour} ${numJour} ${nomMois} ${annee}`;
};

const validerReservation = () => {
  const payload = {
    date: formatDate(selectedDate.value),
    slot: selectedSlot.value,
    mode: adminReservationData.value.mode,
    departement: adminReservationData.value.mode === 'DOMICILE' ? selectedDepartment.value : null,
  };
  localStorage.setItem("admin_reservation_date", JSON.stringify(payload));
  router.push("/admin/confirmation");
};

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem("admin_reservation") || "{}");
  duree.value = saved.duree_totale || 0;
});
</script>
<style scoped>
.reservation-page {
  padding: 40px 20px;
  background-color: #f9f4ee;
  max-width: 900px;
  margin: auto;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  font-size: 1.6rem;
  margin-bottom: 20px;
  color: #5a3d2b;
  text-align: center;
}

.details-section {
  margin-top: 30px;
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.selected-date-info {
  background: linear-gradient(135deg, #457b9d 0%, #1d3557 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  text-align: center;
}
.selected-date-info h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.slot-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}

.slot-buttons button {
  padding: 10px 15px;
  background-color: #d4a373;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}
.slot-buttons button.active {
  background-color: #c58954;
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

.reserve-button,
.back-button {
  width: 100%;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 6px;
  margin-top: 25px;
}

.reserve-button {
  background-color: #6a994e;
  color: white;
  border: none;
}
.reserve-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.back-button {
  background-color: #d4a373;
  color: white;
  border: none;
}
.back-button:hover {
  background-color: #c78d56;
}

.departement-select-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 25px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.select-wrapper {
  flex: 1;
  min-width: 250px;
}

select {
  width: 100%;
  padding: 10px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-top: 8px;
}

.departement-info-inline {
  background: #fdf9f1;
  padding: 15px;
  border-left: 5px solid #d4a373;
  border-radius: 8px;
  min-width: 280px;
  max-width: 300px;
}
</style>