<template>
  <div class="reservation-page">
    <router-link to="/admin/nouvelle-reservation" class="back-btn">← Retour au formulaire</router-link>

    <h2>📅 Choisissez un jour et un créneau</h2>
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
          <h3>Choisir le département :</h3>
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
        </div>
      </div>

      <button
        class="reserve-button"
        :disabled="!selectedSlot || !selectedDepartment"
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

const departementsParJour = [
  [ { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Puylagarde", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" } ],
  [ { nom: "Parisot", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Limogne-en-Quercy", codePostal: "46260" }, { nom: "Saint-Projet", codePostal: "82160" }, { nom: "Puylagarde", codePostal: "82160" }, { nom: "Villefranche-de-Rouergue", codePostal: "12200" } ],
  [ { nom: "Parisot", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Limogne-en-Quercy", codePostal: "46260" }, { nom: "Saint-Projet", codePostal: "82160" }, { nom: "Puylagarde", codePostal: "82160" }, { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Varaire", codePostal: "46260" } ],
  [ { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Parisot", codePostal: "82160" }, { nom: "Martiel", codePostal: "12200" }, { nom: "Cajarc", codePostal: "46160" }, { nom: "Saint-Antonin-Noble-Val", codePostal: "82140" } ],
  [ { nom: "Parisot", codePostal: "82160" }, { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Limogne-en-Quercy", codePostal: "46260" }, { nom: "Cajarc", codePostal: "46160" }, { nom: "Saint-Antonin-Noble-Val", codePostal: "82140" }, { nom: "Varaire", codePostal: "46260" } ],
  [ { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Parisot", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Saint-Antonin-Noble-Val", codePostal: "82140" }, { nom: "Saint-Projet", codePostal: "82160" }, { nom: "Puylagarde", codePostal: "82160" }, { nom: "Martiel", codePostal: "12200" }, { nom: "Varaire", codePostal: "46260" } ],
  [ { nom: "Villefranche-de-Rouergue", codePostal: "12200" }, { nom: "Parisot", codePostal: "82160" }, { nom: "Caylus", codePostal: "82160" }, { nom: "Saint-Antonin-Noble-Val", codePostal: "82140" }, { nom: "Martiel", codePostal: "12200" }, { nom: "Varaire", codePostal: "46260" } ]
];

const calendarAttributes = ref([
  {
    key: "past-dates",
    dates: (date) => date < new Date().setHours(0, 0, 0, 0),
    excludeMode: "soft",
    class: "unavailable",
  }
]);

const formatDate = (date) =>
  date.getFullYear() + "-" +
  String(date.getMonth() + 1).padStart(2, "0") + "-" +
  String(date.getDate()).padStart(2, "0");

const getDepartmentsForDay = (day) =>
  departementsParJour[day.getDay()] || [];

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

const validerReservation = () => {
  const payload = {
    date: formatDate(selectedDate.value),
    slot: selectedSlot.value,
    departement: selectedDepartment.value,
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