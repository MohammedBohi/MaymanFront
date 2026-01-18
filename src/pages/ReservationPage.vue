<template>
  <div class="reservation-page">
    <div class="calendar-section">
      <h2 v-motion
          :initial="{ opacity: 0, y: -30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
        📅 Étape 1 : Choisissez votre date
      </h2>
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
          <h3>📅 {{ formatSelectedDate(selectedDate) }}</h3>
        </div>

        <!-- ÉTAPE 2 : Département (uniquement si DOMICILE) -->
        <div v-if="!isSalonDay(selectedDate)" class="step-section" v-motion
             :initial="{ opacity: 0, y: 10 }"
             :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }">
          <h3>📍 Étape 2 : Choisissez votre ville</h3>
          <select v-model="selectedDepartment" class="department-select" required>
            <option :value="null" disabled>Sélectionnez une ville</option>
            <option v-for="dept in departments" :key="dept.code + dept.nom" :value="dept">
              {{ dept.nom }} ({{ dept.code }})
            </option>
          </select>
        </div>

        <!-- Info SALON -->
        <div v-else class="salon-info" v-motion
             :initial="{ opacity: 0, y: 10 }"
             :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }">
          <p><strong>📍 Adresse :</strong></p>
          <p>176 Route de Montauban, 12200 Villefranche-de-Rouergue</p>
        </div>

        <!-- ÉTAPE 3 : Créneaux -->
        <div class="step-section" v-motion
             :initial="{ opacity: 0, y: 10 }"
             :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 } }">
          <h3>⏰ {{ isSalonDay(selectedDate) ? 'Étape 2' : 'Étape 3' }} : Choisissez votre créneau</h3>
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
          <p v-else class="no-slots">Aucun créneau disponible pour cette date.</p>
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
    departement: selectedDepartment.value, // null pour SALON, { code, nom } pour DOMICILE
    mode,
  };
  localStorage.setItem("reservation_date", JSON.stringify(payload));
  
  // Rediriger vers le formulaire pour saisir les détails
  router.push("/formulaire-reservation");
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

.instruction-text {
  text-align: center;
  color: #666;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.details-section {
  margin-top: 20px;
}

.selected-date-info {
  background: linear-gradient(135deg, #d4a373 0%, #c58954 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.selected-date-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.mode-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.salon-mode {
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid white;
}

.domicile-mode {
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid white;
}

.step-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #d4a373;
}

.step-section h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.1rem;
}

.salon-info {
  background: #f0f7ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #5a9fd4;
  text-align: center;
}

.info-note {
  color: #5a9fd4;
  font-weight: 600;
  margin-top: 5px;
}

.department-select {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.department-select:focus {
  outline: none;
  border-color: #d4a373;
}
.slot-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.slot-buttons button {
  padding: 12px 20px;
  background-color: #d4a373;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
}

.slot-buttons button:hover {
  background-color: #c58954;
  transform: scale(1.05);
}

.slot-buttons button.active {
  background-color: #c58954;
  box-shadow: 0 0 0 3px rgba(197, 137, 84, 0.3);
  transform: scale(1.05);
}

.no-slots {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 20px;
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