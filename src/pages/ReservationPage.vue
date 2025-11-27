<template>
  <div class="reservation-page">
    <div class="calendar-section">
      <h2>Choisissez un jour et un créneau</h2>
      <v-calendar
        mode="single"
        is-expanded
        :attributes="calendarAttributes"
        @dayclick="onDateSelected"
      />

      <div v-if="selectedDate" class="details-section">
        <h3>Créneaux disponibles :</h3>
        <div v-if="availableSlots.length" class="slot-buttons">
          <button
            v-for="slot in availableSlots"
            :key="slot"
            @click="selectSlot(slot)"
            :class="{ active: slot === selectedSlot }"
          >
            {{ slot }}
          </button>
        </div>
        <p v-else>Aucun créneau disponible pour cette date.</p>

        <div class="departement-select-row">
          <div class="select-wrapper">
            <h3>Choisir votre département :</h3>
            <select v-model="selectedDepartment" required>
              <option v-for="dept in departments" :key="dept.codePostal" :value="dept">
                {{ dept.nom }} ({{ dept.codePostal }})
              </option>
            </select>
          </div>

          <div v-if="departments.length" class="departement-info-inline">
            <p>
              <strong>Départements desservis le {{ joursSemaine[selectedDate.getDay()] }} :</strong>
            </p>
            <ul>
              <li v-for="dept in departments" :key="dept.codePostal">
                {{ dept.nom }} ({{ dept.codePostal }})
              </li>
            </ul>
            <p v-if="selectedDate.getDay() === 0" class="dimanche-note">
              ⚠️ Dimanche = travail occasionnel selon disponibilité
            </p>
          </div>
        </div>

        <button
          class="reserve-button"
          :disabled="!selectedSlot || !selectedDepartment"
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
import { ref, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCreneauxDisponibles } from "@/services/CreneauService";

const route = useRoute();
const router = useRouter();

const selectedDate = ref(null);
const selectedSlot = ref(null);
const availableSlots = ref([]);
const departments = ref([]);
const selectedDepartment = ref(null);
const duree = parseInt(route.query.duree, 10);

const joursSemaine = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"
];

const departementsParJour = [
  [ { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Puylagarde", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" } ],
  [ { nom: "Parisot", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Limogne-en-Quercy", codePostal: "46260" }, { nom: "Saint-Projet", codePostal: "82160" }, { nom: "Puylagarde", codePostal: "82160" }, { nom: "Villefranche-de-Rouergue", codePostal: "12200" } ],
  [ { nom: "Parisot", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Limogne-en-Quercy", codePostal: "46260" }, { nom: "Saint-Projet", codePostal: "82160" }, { nom: "Puylagarde", codePostal: "82160" }, { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Varaire", codePostal: "46260" } ],
  [ { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Parisot", codePostal: "82160" }, { nom: "Martiel", codePostal: "12200" }, { nom: "Saint-Antonin-Noble-Val", codePostal: "82140" } ],
  [ { nom: "Parisot", codePostal: "82160" }, { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Limogne-en-Quercy", codePostal: "46260" },  { nom: "Saint-Antonin-Noble-Val", codePostal: "82140" }, { nom: "Varaire", codePostal: "46260" } ],
  [ { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Parisot", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Saint-Antonin-Noble-Val", codePostal: "82140" }, { nom: "Saint-Projet", codePostal: "82160" }, { nom: "Puylagarde", codePostal: "82160" }, { nom: "Martiel", codePostal: "12200" }, { nom: "Varaire", codePostal: "46260" } ],
  [ { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Parisot", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Saint-Antonin-Noble-Val", codePostal: "82140" }, { nom: "Martiel", codePostal: "12200" }, { nom: "Varaire", codePostal: "46260" } ]
];

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

const getDepartmentsForDay = (day) =>
  departementsParJour[day.getDay()] || [];

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
  departments.value = [...getDepartmentsForDay(selectedDate.value)];
  selectedDepartment.value = departments.value[0] || null;

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

const validerReservation = () => {
  const payload = {
    date: formatDate(selectedDate.value),
    slot: selectedSlot.value,
    departement: selectedDepartment.value,
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