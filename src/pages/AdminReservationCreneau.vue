<template>
  <div class="reservation-page">
    <router-link to="/admin" class="back-btn">← Retour au tableau de bord</router-link>

    <!-- ÉTAPE 1 : Sélection prestation et nombre de personnes -->
    <div v-if="!prestationSelectionnee" class="prestation-section">
      <h2 v-motion
          :initial="{ opacity: 0, y: -30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
        📋 Étape 1 : Choisissez la prestation
      </h2>
      
      <div class="form-group">
        <label for="prestation">Prestation :</label>
        <select id="prestation" v-model="selectedPrestation" @change="calculerDuree">
          <option :value="null" disabled>Sélectionnez une prestation</option>
          <option v-for="p in prestations" :key="p.id" :value="p">
            {{ p.nom }} - {{ p.duree }}min - {{ p.prix }}€
          </option>
        </select>
      </div>

      <div class="form-group" v-if="selectedPrestation">
        <label for="nb-personnes">Nombre de personnes :</label>
        <input 
          type="number" 
          id="nb-personnes" 
          v-model.number="nbPersonnes" 
          min="1" 
          max="10"
          @input="calculerDuree"
        />
      </div>

      <div v-if="dureeCalculee > 0" class="duree-info">
        <p>⏱️ Durée totale : <strong>{{ dureeCalculee }} minutes</strong></p>
      </div>

      <button 
        class="reserve-button" 
        :disabled="!selectedPrestation || nbPersonnes < 1"
        @click="validerPrestation"
      >
        ➡ Continuer vers le calendrier
      </button>
    </div>

    <!-- ÉTAPE 2 : Sélection date et créneau -->
    <div v-else>
      <h2 v-motion
          :initial="{ opacity: 0, y: -30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
        📅 Étape 2 : Choisissez un jour et un créneau
      </h2>
      
      <div class="prestation-recap">
        <p><strong>Prestation :</strong> {{ selectedPrestation.nom }}</p>
        <p><strong>Nombre de personnes :</strong> {{ nbPersonnes }}</p>
        <p><strong>Durée totale :</strong> {{ dureeCalculee }} min</p>
        <button class="btn-modifier" @click="modifierPrestation">✏️ Modifier</button>
      </div>

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
      <div class="departement-select-row" v-if="selectedDate">
        <div v-if="!isSalonDay(selectedDate) && departments.length > 0" class="select-wrapper">
          <h3>Ville :</h3>
          <select v-model="selectedDepartment">
            <option disabled :value="null">Choisir une ville</option>
            <option v-for="dept in departments" :key="dept.code + dept.nom" :value="dept">
              {{ dept.nom }} ({{ dept.code }})
            </option>
          </select>
        </div>

        <div class="departement-info-inline" v-if="selectedDate">
          <p v-if="isSalonDay(selectedDate)">
            <strong>📍 Adresse :</strong><br />
            176 Route de Montauban, 12200 Villefranche-de-Rouergue
          </p>
          <div v-else-if="selectedDepartment">
            <p>Ville sélectionnée : <strong>{{ selectedDepartment.nom }} ({{ selectedDepartment.code }})</strong></p>
          </div>
        </div>
      </div>

      <button
        class="reserve-button"
        :disabled="!selectedSlot || (!isSalonDay(selectedDate) && !selectedDepartment)"
        @click="validerReservation"
      >
        ➡ Continuer vers le formulaire
      </button>
      <button class="back-button" @click="router.back()">⬅ Retour</button>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCreneauxDisponibles } from "@/services/CreneauService";
import { getPrestations } from "@/services/PrestationService";
import api from "@/services/api";

const router = useRouter();

// Étape 1 : Prestation
const prestations = ref([]);
const selectedPrestation = ref(null);
const nbPersonnes = ref(1);
const dureeCalculee = ref(0);
const prestationSelectionnee = ref(false);

// Étape 2 : Calendrier
const selectedDate = ref(null);
const selectedSlot = ref(null);
const availableSlots = ref([]);
const departments = ref([]);
const selectedDepartment = ref(null);
const planningData = ref(null);

const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const calendarAttributes = ref([
  {
    key: "past-dates",
    dates: (date) => date < new Date().setHours(0, 0, 0, 0),
    excludeMode: "soft",
    class: "unavailable",
  },
]);

const calculerDuree = () => {
  if (selectedPrestation.value && nbPersonnes.value > 0) {
    dureeCalculee.value = selectedPrestation.value.duree * nbPersonnes.value;
  } else {
    dureeCalculee.value = 0;
  }
};

const validerPrestation = () => {
  if (selectedPrestation.value && nbPersonnes.value > 0) {
    prestationSelectionnee.value = true;
  }
};

const modifierPrestation = () => {
  prestationSelectionnee.value = false;
  selectedDate.value = null;
  selectedSlot.value = null;
  availableSlots.value = [];
};

const getDepartmentsForDay = (day) => {
  if (!planningData.value) return [];
  
  const jourSemaine = day.getDay();
  const planning = planningData.value.find(p => p.jour_semaine === jourSemaine);
  
  if (!planning || !planning.actif) return [];
  
  if (planning.mode === 'SALON') return [];
  if (planning.mode === 'DOMICILE') {
    return planning.departements || [];
  }
  
  return [];
};

onMounted(async () => {
  // Charger les prestations
  try {
    prestations.value = await getPrestations();
  } catch (error) {
    console.error('Erreur chargement prestations:', error);
    prestations.value = [];
  }

  // Charger les données du planning
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

  selectedDate.value = new Date(date);
  departments.value = [];
  await nextTick();
  
  // Récupérer les départements disponibles pour ce jour
  const depts = getDepartmentsForDay(selectedDate.value);
  departments.value = [...depts];
  
  // Sélectionner le premier département si disponible
  if (departments.value.length > 0) {
    selectedDepartment.value = departments.value[0];
  } else {
    selectedDepartment.value = null;
  }

  await getAvailableSlots();
};

const getAvailableSlots = async () => {
  if (!selectedDate.value || !dureeCalculee.value) return;

  const formatted = formatDate(selectedDate.value);
  try {
    const data = await getCreneauxDisponibles(formatted, dureeCalculee.value);
    availableSlots.value = data || [];
  } catch (e) {
    console.error("Erreur chargement créneaux :", e);
    availableSlots.value = [];
  }
};

const selectSlot = (slot) => {
  selectedSlot.value = slot;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

const isSalonDay = (date) => {
  if (!planningData.value) return false;
  const jourSemaine = date.getDay();
  const planning = planningData.value.find(p => p.jour_semaine === jourSemaine);
  return planning?.mode === 'SALON';
};

const computeMode = (date) => (isSalonDay(date) ? "SALON" : "DOMICILE");

const validerReservation = () => {
  const mode = computeMode(selectedDate.value);
  const payload = {
    date: formatDate(selectedDate.value),
    slot: selectedSlot.value,
    departement: selectedDepartment.value,
    mode,
    prestation: selectedPrestation.value,
    nbPersonnes: nbPersonnes.value,
    duree_totale: dureeCalculee.value,
  };
  localStorage.setItem("admin_reservation_date", JSON.stringify(payload));
  router.push("/admin/nouvelle-reservation");
};
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

/* Section prestation */
.prestation-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #5a3d2b;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.duree-info {
  background: #e8f5e9;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
}

.duree-info p {
  margin: 0;
  font-size: 1.1rem;
  color: #2e7d32;
}

/* Récap prestation */
.prestation-recap {
  background: #fff3e0;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  position: relative;
}

.prestation-recap p {
  margin: 5px 0;
  color: #5a3d2b;
}

.btn-modifier {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-modifier:hover {
  background-color: #f57c00;
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