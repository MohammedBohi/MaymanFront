<template>
  <div class="reservation-page">
    <div class="calendar-section">
      <h2 v-motion
          :initial="{ opacity: 0, y: -30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">Choisissez un jour et un créneau</h2>
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

        <div class="departement-select-row" v-motion
             :initial="{ opacity: 0, y: 10 }"
             :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
          <template v-if="!isSalonDay(selectedDate)">
            <div class="select-wrapper">
              <h3>Choisir votre département :</h3>
              <select v-model="selectedDepartment" required>
                <option v-for="dept in departments" :key="dept.code" :value="dept">
                  {{ dept.nom }} ({{ dept.code }})
                </option>
              </select>
            </div>

            <div v-if="departments.length" class="departement-info-inline">
              <p>
                <strong>Départements desservis :</strong>
              </p>
              <ul>
                <li v-for="dept in departments" :key="dept.code">
                  {{ dept.nom }} ({{ dept.code }})
                </li>
              </ul>
              <p v-if="selectedDate.getDay() === 0" class="dimanche-note">
                ⚠️ Dimanche = travail occasionnel selon disponibilité
              </p>
            </div>
          </template>
          <template v-else>
            <div class="departement-info-inline" style="flex:1">
              <p><strong>🏛️ Salon May'Man</strong></p>
              <p>176 Route de Montauban, 12200 Villefranche-de-Rouergue</p>
            </div>
          </template>
        </div>

        <button
          class="reserve-button"
          :disabled="!selectedSlot || (!isSalonDay(selectedDate) && !selectedDepartment)"
          @click="validerReservation"
        >
          Continuer
        </button>
        <button class="back-button" @click="router.back()">⬅ Retour</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCreneauxDisponibles } from "@/services/CreneauService";
import api from "@/services/api";

const route = useRoute();
const router = useRouter();

const selectedDate = ref(null);
const selectedSlot = ref(null);
const availableSlots = ref([]);
const departments = ref([]);
const selectedDepartment = ref(null);
const duree = parseInt(route.query.duree, 10);
const planningData = ref(null); // Stocker les données du planning

const joursSemaine = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"
];
const SALON = { nom: "Salon May'Man - 176 Route de Montauban, Villefranche-de-Rouergue", code: "SALON" };

const calendarAttributes = ref([
  {
    key: "past-dates",
    dates: (date) => date < new Date().setHours(0, 0, 0, 0),
    excludeMode: "soft",
    class: "unavailable",
  },
]);

const formatDate = (date) =>
  date.getFullYear() + "-" +
  String(date.getMonth() + 1).padStart(2, "0") + "-" +
  String(date.getDate()).padStart(2, "0");

const getDepartmentsForDay = (day) => {
  if (!planningData.value) return [];
  
  const jourSemaine = day.getDay(); // 0=dimanche, 1=lundi, etc.
  const planning = planningData.value.find(p => p.jour_semaine === jourSemaine);
  
  if (!planning || !planning.actif) return [];
  
  if (planning.mode === 'SALON') {
    return [SALON];
  } else if (planning.mode === 'DOMICILE') {
    // Retourner les départements depuis la BDD
    return planning.departements || [];
  }
  
  return [];
};

// Charger les données du planning au montage
onMounted(async () => {
  try {
    const res = await api.get('/planning-hebdo');
    planningData.value = res.data;
  } catch (error) {
    console.error('Erreur chargement planning:', error);
    planningData.value = [];
  }
});

const onDateSelected = async ({ date }) => {
  if (!date) return;

  const now = new Date();
  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (selected < now) {
    alert("😅 Ah, tu savais qu'on ne pouvait pas réserver dans le passé ?");
    return;
  }

  selectedDate.value = new Date(date);
  departments.value = [];
  await nextTick();
  const list = getDepartmentsForDay(selectedDate.value);
  departments.value = [...list];
  
  // Pour les jours SALON, pas de sélection de département requise
  if (isSalonDay(selectedDate.value)) {
    selectedDepartment.value = null;
  } else {
    // Pour DOMICILE, sélectionner le premier département
    selectedDepartment.value = departments.value[0] || null;
  }

  await getAvailableSlots();
};

const getAvailableSlots = async () => {
  if (!selectedDate.value || !duree) return;
  const formatted = formatDate(selectedDate.value);
  try {
    const data = await getCreneauxDisponibles(formatted, duree);
    availableSlots.value = data || [];
  } catch (e) {
    console.error("Erreur chargement créneaux :", e);
    availableSlots.value = [];
  }
};

const selectSlot = (slot) => {
  selectedSlot.value = slot;
};

const isSalonDay = (date) => {
  const d = date.getDay();
  return d === 3 || d === 4 || d === 5 || d === 6; // Mer->Sam
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

const computeMode = (date) => (isSalonDay(date) ? "SALON" : "DOMICILE");

const validerReservation = () => {
  const mode = computeMode(selectedDate.value);
  const payload = {
    date: formatDate(selectedDate.value),
    slot: selectedSlot.value,
    departement: selectedDepartment.value, // null pour SALON, { code: '46' } pour DOMICILE
    mode,
  };
  localStorage.setItem("reservation_date", JSON.stringify(payload));
  router.push("/confirmation");
};
</script>
<style scoped>
.reservation-page {
  padding: 20px;
  background-color: #f8f3e7;
  max-width: 800px;
  margin: auto;
}
.calendar-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.details-section {
  margin-top: 20px;
}
.selected-date-info {
  background: linear-gradient(135deg, #d4a373 0%, #c58954 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  margin-top: 10px;
}
.slot-buttons button {
  padding: 10px 15px;
  background-color: #d4a373;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}
.slot-buttons button.active {
  background-color: #c58954;
}
.reserve-button, .back-button {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  border-radius: 5px;
}
.reserve-button {
  background-color: #d4a373;
  color: white;
  border: none;
}
.reserve-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.back-button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  color: #333;
  cursor: pointer;
}

/* ✅ Ligne select + infos à droite */
.departement-select-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 15px;
  flex-wrap: wrap;
}
.select-wrapper {
  flex: 1;
}
.departement-info-inline {
  background: #fdf9f1;
  padding: 12px;
  border-left: 5px solid #d4a373;
  border-radius: 6px;
  min-width: 280px;
  max-width: 300px;
}
.dimanche-note {
  color: #b85c00;
  margin-top: 5px;
  font-style: italic;
}
.info-message {
  margin-top: 10px;
  font-style: italic;
  color: #a65c00;
}
</style>