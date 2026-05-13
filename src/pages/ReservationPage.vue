<template>
  <div class="reservation-page">
    <div class="top-layout">
      <!-- Calendrier + légende -->
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

        <div class="calendar-legend">
          <span class="legend-item"><span class="legend-dot salon"></span> Salon</span>
          <span class="legend-item"><span class="legend-dot domicile"></span> Domicile</span>
          <span class="legend-item"><span class="legend-dot ferme"></span> Fermé</span>
          <span class="legend-item"><span class="legend-dot sature"></span> Saturé</span>
        </div>
      </div>

      <!-- Rappel du mode choisi -->
      <div v-if="modeReservation" class="mode-reminder" :class="modeReservation === 'SALON' ? 'mode-salon' : 'mode-domicile'"
           v-motion
           :initial="{ opacity: 0, x: 30 }"
           :enter="{ opacity: 1, x: 0, transition: { duration: 450 } }">

        <!-- SALON -->
        <template v-if="modeReservation === 'SALON'">
          <div class="mode-reminder-header">
            <span class="mode-icon">✂️</span>
            <span class="mode-label">Mode choisi : <strong>Salon</strong></span>
          </div>
          <div class="mode-address">
            <p class="address-line">📍 12 rue Champs des Chartreux</p>
            <p class="address-line">Villefranche-de-Rouergue</p>
          </div>
          <div class="salon-note">
            <p class="note-icon">💡 À noter</p>
            <p class="note-text">
              Le salon May'Man ne dispose pas de bac à shampooing, c'est pourquoi je vous conseille de venir avec les cheveux propres. Merci beaucoup pour votre compréhension et au plaisir de vous accueillir ✨
            </p>
          </div>
        </template>

        <!-- DOMICILE -->
        <template v-else>
          <div class="mode-reminder-header">
            <span class="mode-icon">🏠</span>
            <span class="mode-label">Mode choisi : <strong>Domicile</strong></span>
          </div>
          <p class="domicile-desc">Je me déplace directement chez vous à l'adresse que vous indiquerez lors de la réservation.</p>
        </template>
      </div>
    </div>

    <div class="details-card">
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
          <select v-model="selectedDepartment" @change="onDepartementChange" class="department-select" required>
            <option :value="null" disabled>Sélectionnez une ville</option>
            <option v-for="dept in departments" :key="dept.code_postal + dept.nom" :value="dept">
              {{ dept.nom }} ({{ dept.code_postal }})
            </option>
          </select>
        </div>

        <!-- Info SALON -->
        <div v-else class="salon-info" v-motion
             :initial="{ opacity: 0, y: 10 }"
             :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }">
          <p><strong>📍 Adresse :</strong></p>
          <p>12 rue Champs des Chartreux, Villefranche-de-Rouergue</p>
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
          :disabled="!selectedSlot || (!isSalonDay(selectedDate) && !selectedDepartment) || isSubmittingReservation"
          @click="validerReservation"
        >
          {{ isSubmittingReservation ? 'Traitement...' : 'Continuer' }}
        </button>
        <button class="back-button" @click="router.back()">⬅ Retour</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCreneauxDisponibles, getDisponibiliteMois } from "@/services/CreneauService";
import api from "@/services/api";

const route = useRoute();
const router = useRouter();

const selectedDate = ref(null);
const selectedSlot = ref(null);
const availableSlots = ref([]);
const departments = ref([]);
const selectedDepartment = ref(null);
const selectionData = ref(null); // Données de la sélection prestation
const duree = ref(0);
const modeReservation = ref(null);
const planningData = ref(null); // Stocker les données du planning
const disponibiliteMois = ref([]); // Disponibilité batch du mois
const isLoadingSlots = ref(false); // anti double-clic sur les dates

const joursSemaine = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"
];
const SALON = { nom: "Salon May'Man - 12 rue Champs des Chartreux, Villefranche-de-Rouergue", code: "SALON" };

const calendarAttributes = computed(() => {
  const attrs = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Dates passées → grisées
  attrs.push({
    key: "past-dates",
    dates: { start: null, end: new Date(today.getTime() - 86400000) },
    class: "unavailable",
  });

  // 2. Dots basés sur disponibiliteMois (SALON / DOMICILE / fermé / saturé)
  const salonDates = [];
  const domicileDates = [];
  const fermeDates = [];
  const satureDates = [];

  for (const entry of disponibiliteMois.value) {
    const d = new Date(entry.date + 'T12:00:00');
    if (d < today) continue; // Pas de dot sur les dates passées

    if (!entry.mode) {
      fermeDates.push(d);
    } else if (!entry.disponible) {
      satureDates.push(d);
    } else if (entry.mode === 'SALON') {
      salonDates.push(d);
    } else if (entry.mode === 'DOMICILE') {
      domicileDates.push(d);
    }
  }

  if (salonDates.length) {
    attrs.push({ key: 'salon-days', dates: salonDates, dot: { style: { backgroundColor: '#8e44ad' } } });
  }
  if (domicileDates.length) {
    attrs.push({ key: 'domicile-days', dates: domicileDates, dot: { style: { backgroundColor: '#27ae60' } } });
  }
  if (fermeDates.length) {
    attrs.push({ key: 'closed-days', dates: fermeDates, dot: { style: { backgroundColor: '#95a5a6' } } });
  }
  if (satureDates.length) {
    attrs.push({ key: 'saturated-days', dates: satureDates, dot: { style: { backgroundColor: '#e74c3c' } } });
  }

  // 3. Jours du mauvais mode → non-cliquables
  if (planningData.value && modeReservation.value) {
    const wrongModeDates = [];
    for (const entry of disponibiliteMois.value) {
      const d = new Date(entry.date + 'T12:00:00');
      if (d < today) continue;
      if (!entry.mode || entry.mode !== modeReservation.value) {
        wrongModeDates.push(d);
      }
    }
    if (wrongModeDates.length) {
      attrs.push({ key: 'wrong-mode', dates: wrongModeDates, class: 'unavailable' });
    }
  }

  return attrs;
});

const formatDate = (date) =>
  date.getFullYear() + "-" +
  String(date.getMonth() + 1).padStart(2, "0") + "-" +
  String(date.getDate()).padStart(2, "0");

const chargerDisponibiliteMois = async () => {
  if (!duree.value) return;
  const now = new Date();
  const debut = formatDate(now);
  // Charger 2 mois à l'avance
  const finDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const fin = formatDate(finDate);
  disponibiliteMois.value = await getDisponibiliteMois(debut, fin, duree.value, selectedDepartment.value);
};

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
    // Charger le planning hebdomadaire
    const res = await api.get('/planning-hebdo');
    planningData.value = res.data;

    // Récupérer les données de la sélection prestation
    const savedSelection = localStorage.getItem("client_prestation_selection");
    if (!savedSelection) {
      alert("⚠️ Veuillez d'abord configurer votre réservation");
      router.push("/selection-prestation");
      return;
    }

    selectionData.value = JSON.parse(savedSelection);
    duree.value = selectionData.value.duree_totale;
    modeReservation.value = selectionData.value.mode;

    // Charger la disponibilité du mois pour les indicateurs du calendrier
    await chargerDisponibiliteMois();

  } catch (error) {
    console.error('Erreur chargement planning:', error);
    planningData.value = [];
  }
});

const onDateSelected = async ({ date }) => {
  if (!date || isLoadingSlots.value) return; // anti double-clic

  const now = new Date();
  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (selected < now) {
    alert("😅 Ah, tu savais qu'on ne pouvait pas réserver dans le passé ?");
    return;
  }

  // Vérifier que le jour correspond au mode choisi
  const jourSemaine = selected.getDay();
  const planning = planningData.value.find(p => p.jour_semaine === jourSemaine);

  if (!planning || !planning.actif || planning.mode !== modeReservation.value) {
    alert(`❌ Ce jour n'est pas disponible pour le mode ${modeReservation.value}`);
    return;
  }

  isLoadingSlots.value = true;

  try {
    selectedDate.value = new Date(date);
    selectedSlot.value = null;
    departments.value = [];
    selectedDepartment.value = null;

    await nextTick();

    const list = getDepartmentsForDay(selectedDate.value);
    departments.value = [...list];

    // Pour les jours SALON, pas de sélection de département requise
    if (isSalonDay(selectedDate.value)) {
      selectedDepartment.value = null;
    } else if (departments.value.length > 0) {
      // Pour DOMICILE, sélectionner le premier département
      selectedDepartment.value = departments.value[0];
    }

    await getAvailableSlots();
  } finally {
    isLoadingSlots.value = false;
  }
};

const getAvailableSlots = async () => {
  if (!selectedDate.value || !duree.value) return;
  const formatted = formatDate(selectedDate.value);

  try {
    const data = await getCreneauxDisponibles(formatted, duree.value, selectedDepartment.value);
    availableSlots.value = data || [];
  } catch (e) {
    console.error("Erreur chargement créneaux :", e);
    availableSlots.value = [];
  }
};

// Appelé quand l'utilisateur change manuellement le département dans le select
const onDepartementChange = async () => {
  if (!selectedDepartment.value) return;
  selectedSlot.value = null;
  await Promise.all([
    getAvailableSlots(),
    chargerDisponibiliteMois(),
  ]);
};

const selectSlot = (slot) => {
  selectedSlot.value = slot;
};

const isSubmittingReservation = ref(false);

const isSalonDay = (date) => {
  if (!planningData.value || !date) return false;
  
  const jourSemaine = date.getDay(); // 0=dimanche, 1=lundi, etc.
  const planning = planningData.value.find(p => p.jour_semaine === jourSemaine);
  
  // Le jour est considéré SALON si le planning existe, est actif, et est en mode SALON
  return planning && planning.actif && planning.mode === 'SALON';
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
  if (isSubmittingReservation.value) return; // anti double-clic
  isSubmittingReservation.value = true;

  try {
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
  } finally {
    isSubmittingReservation.value = false;
  }
};
</script>
<style scoped>
.reservation-page {
  padding: 20px;
  background-color: #f8f3e7;
  max-width: 960px;
  margin: auto;
}

/* Layout haut : calendrier + rappel mode côte à côte */
.top-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.top-layout .calendar-section {
  flex: 1 1 340px;
}

/* Carte de rappel du mode */
.mode-reminder {
  flex: 0 1 280px;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  align-self: flex-start;
  position: sticky;
  top: 20px;
}

.mode-salon {
  background: linear-gradient(145deg, #f5eeff, #ede0ff);
  border: 1.5px solid #b89cdb;
}

.mode-domicile {
  background: linear-gradient(145deg, #edfff5, #d6f5e6);
  border: 1.5px solid #7fcea0;
}

.mode-reminder-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.mode-icon {
  font-size: 1.6rem;
}

.mode-label {
  font-size: 1rem;
  color: #333;
}

.mode-label strong {
  font-size: 1.05rem;
}

.mode-salon .mode-label strong {
  color: #6b3fa0;
}

.mode-domicile .mode-label strong {
  color: #1e7a47;
}

.mode-address {
  background: rgba(255,255,255,0.6);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 14px;
}

.address-line {
  margin: 3px 0;
  font-size: 0.9rem;
  color: #444;
}

.salon-note {
  background: rgba(255,255,255,0.75);
  border-left: 4px solid #8e44ad;
  border-radius: 0 8px 8px 0;
  padding: 12px 14px;
}

.note-icon {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b3fa0;
  margin: 0 0 8px 0;
}

.note-text {
  font-size: 0.88rem;
  color: #444;
  line-height: 1.55;
  margin: 0;
  font-style: italic;
}

.domicile-desc {
  font-size: 0.9rem;
  color: #2d6b45;
  line-height: 1.5;
  margin: 0;
}

/* Carte du bas (date + créneaux) */
.details-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
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
  transition: all 0.2s;
}
.reserve-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
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

.calendar-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 15px 0;
  padding: 10px;
  background: #fdf9f1;
  border-radius: 8px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #555;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.legend-dot.salon { background-color: #8e44ad; }
.legend-dot.domicile { background-color: #27ae60; }
.legend-dot.ferme { background-color: #95a5a6; }
.legend-dot.sature { background-color: #e74c3c; }

/* Responsive : sur mobile, le rappel mode passe en dessous du calendrier */
@media (max-width: 680px) {
  .top-layout {
    flex-direction: column;
  }
  .mode-reminder {
    flex: 1 1 auto;
    width: 100%;
    position: static;
  }
}
</style>