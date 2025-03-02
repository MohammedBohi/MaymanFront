<template>
  <div class="reservation-page">
    <div class="sunday-warning">
      🚫 <strong>ATTENTION :</strong> Les dimanches sont des jours de repos. Il est impossible de réserver ce jour-là !
    </div>
    <div class="left-section">
      <img v-if="prestation?.image" :src="prestation.image" alt="Prestation" class="prestation-image" />
      <p v-else>Aucune image disponible</p>
      <h2>{{ prestation?.nom || "Nom non disponible" }}</h2>
      <p>{{ prestation?.prix || 0 }} €</p>
    </div>

    <div class="right-section">
      <h3>Réservez votre prestation</h3>
      <v-calendar 
        mode="single" 
        is-expanded 
        :attributes="calendarAttributes" 
        @dayclick="onDateSelected"
      />

      <div v-if="selectedDate" class="details-section">
        <h4>Départements desservis pour le {{ selectedDate.toLocaleDateString() }} :</h4>
        <ul>
          <li v-for="dept in departments" :key="dept.codePostal">
            {{ dept.nom }} ({{ dept.codePostal }})
          </li>
        </ul>

        <h4>Créneaux disponibles :</h4>
        <div v-if="availableSlots.length" class="slot-buttons">
          <button v-for="slot in availableSlots" 
                  :key="slot" 
                  @click="selectSlot(slot)" 
                  :class="{ active: slot === selectedSlot }">
            {{ slot }}
          </button>
        </div>
        <p v-else>Aucun créneau disponible pour cette date.</p>
      </div>

      <button class="reserve-button" :disabled="!selectedSlot" @click="redirectToAuth">Réserver</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios"; 
import { checkAuth } from "@/services/AuthService";
import prestations from "@/data/prestations.js";

export default {
  setup() {
    const router = useRouter();
    const prestation = ref(null);
    const selectedDate = ref(new Date()); // On initialise avec la date actuelle
    const selectedSlot = ref(null);
    const availableSlots = ref([]);
    const departments = ref([]);


    // Désactiver les jours passés et les dimanches
    const today = new Date();
today.setHours(0, 0, 0, 0); // Supprime l'heure pour comparer uniquement la date

const calendarAttributes = ref([
  {
    key: "past-dates",
    dates: (date) => date < today,  // ✅ Désactive tous les jours avant aujourd'hui
    excludeMode: "soft",
    class: "unavailable"
  },
  {
    key: "dimanche",
    dates: (date) => date.getDay() === 0,  // ✅ Désactive les dimanches
    excludeMode: "soft",
    class: "unavailable"
  }
]);



onMounted(() => {
    const route = router.currentRoute.value;
    console.log("📥 Params reçus :", route.params); // Debugging

    if (!route.params.id) {
        console.error("❌ Erreur: ID de prestation manquant !");
        return;
    }
    const prestationId = parseInt(route.params.id, 10);
    console.log("🆔 ID converti :", prestationId, typeof prestationId);
    console.log("📂 Vérification du fichier prestations.js :", prestations);

    prestation.value = prestations.find(p => p.id === Number(prestationId));

    if (!prestation.value) {
        console.error("❌ Erreur: Prestation introuvable avec ID :", prestationId);
        return;
    }

  

    });


    // Fonction pour récupérer les départements en fonction du jour sélectionné
    const getDepartmentsForDay = (date) => {
      if (!date) return [];
      const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.

      switch (dayOfWeek) {
        case 1: // Lundi
        case 2: // Mardi
          return [
            { nom: "Parisot", codePostal: "82160" },
            { nom: "Caylus", codePostal: "82170" },
            { nom: "Limogne-en-Quercy", codePostal: "46260" },
            { nom: "Saint-Projet", codePostal: "82160" },
            { nom: "Puylagarde", codePostal: "82160" },
            { nom: "Villefranche-de-Rouergue", codePostal: "12200" },
          ];
        case 3: // Mercredi
        case 4: // Jeudi
          return [
            { nom: "Villefranche-de-Rouergue", codePostal: "12200" },
            { nom: "Limogne-en-Quercy", codePostal: "46260" },
            { nom: "Cajarc", codePostal: "46160" },
          ];
        case 5: // Vendredi
        case 6: // Samedi
          return [
            { nom: "Villefranche-de-Rouergue", codePostal: "12200" },
            { nom: "Parisot", codePostal: "82160" },
            { nom: "Caylus", codePostal: "82170" },
          ];
        default:
          return [];
      }
    };

    // Fonction pour récupérer les créneaux disponibles
    const getAvailableSlots = async () => {
      if (!selectedDate.value) {
  console.error("❌ Erreur: selectedDate est NULL !");
  return;
}
const formattedDate = formatDateForBackend(selectedDate.value); // ✅ Utilise la même logique que l'affichage
console.log("📡 Récupération des créneaux pour :", formattedDate);


      try {
        const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || "http://localhost:3000/api";
const response = await axios.get(`${API_BASE_URL}/reservations/creneaux/${formattedDate}`);
        let slots = response.data;
        const now = new Date();

        // Filtrage des créneaux pour aujourd'hui
        if (formattedDate === now.toISOString().split('T')[0]) {
          slots = slots.filter(slot => {
            const [hours, minutes] = slot.split(':').map(Number);
            const slotTime = new Date();
            slotTime.setHours(hours, minutes, 0, 0);
            return slotTime > new Date(now.getTime() + 60 * 60 * 1000);
          });
        }
        console.log("🔵 Créneaux AVANT filtrage :", slots);


        availableSlots.value = [];
        await nextTick();
        availableSlots.value = [...slots];
        console.log("🟢 Créneaux affichés dans Vue :", availableSlots.value);


      } catch (error) {
        console.error("❌ Erreur lors de la récupération des créneaux :", error);
        availableSlots.value = [];
      }
    };

    const onDateSelected = async (event) => {
      console.log("📆 Date sélectionnée avant mise à jour :", event.date);
      if (!event.date) {
    console.error("❌ ERREUR: L'événement `event.date` est NULL !");
    return;
  }
  const selectedDay = new Date(event.date);
  console.log("✅ `selectedDate` après mise à jour :", selectedDate.value);

  selectedDay.setHours(0, 0, 0, 0); // Comparaison sur la date uniquement

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 🔴 Empêche la sélection des jours passés
  if (selectedDay < today) {
    alert("Tu ne peux pas réserver un jour passé !");
    selectedDate.value = null;
    availableSlots.value = [];
    departments.value = [];
    return;
  }

  // 🔴 Empêche la sélection des dimanches
  if (selectedDay.getDay() === 0) {
    alert("Les dimanches ne sont pas disponibles pour les réservations.");
    selectedDate.value = null;
    availableSlots.value = [];
    departments.value = [];
    return;
  }

  // ✅ Si la date est valide, on récupère les créneaux et départements
  selectedDate.value = selectedDay;
  console.log("🛠 Date sélectionnée (locale):", selectedDate.value);

  departments.value = getDepartmentsForDay(selectedDay);
  await nextTick(); // 🔥 Forcer Vue à afficher immédiatement


  await getAvailableSlots(); // ✅ Supprimé `selectedDate.value` inutile
};

    const selectSlot = (slot) => {
      selectedSlot.value = slot;
    };
    if (!selectedDate.value) {
   console.error("❌ Erreur: selectedDate est NULL !");
   return;
}
    const localDate = new Date(selectedDate.value.getTime() - selectedDate.value.getTimezoneOffset() * 60000);
    const formatDateForBackend = (date) => {
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0');
};

    const redirectToAuth = async () => {

      const user = await checkAuth();
      if (!user) {
        localStorage.setItem("pendingReservation", JSON.stringify({
          prestationId: prestation.value?.id || "unknown",
          day: formatDateForBackend(selectedDate.value),
          slot: selectedSlot.value || "unknown",
          departments: encodeURIComponent(JSON.stringify(departments.value || [])),
        }));
        router.push({ path: "/login-register" });
        return;
      }
      console.log("✅ Redirection vers le formulaire avec :", {
        prestationId: prestation.value?.id,
        prestationName: prestation.value?.nom,
        prestationPrice: prestation.value?.prix,
        day: formatDateForBackend(selectedDate.value),
        slot: selectedSlot.value || "unknown",
        departments: departments.value
    });

      router.push({
        name: "FormulaireReservation",
        query: {
          prestationId: prestation.value?.id || "unknown",
          prestationName: prestation.value?.nom || "Prestation inconnue",  // 🔥 Ajoute ceci
          prestationPrice: prestation.value?.prix || 0,  // 🔥 Ajoute ceci

          day: formatDateForBackend(selectedDate.value),
          slot: selectedSlot.value || "unknown",
          departments: encodeURIComponent(JSON.stringify(departments.value || [])),
        },
      });
    };

    return {
      prestation,
      selectedDate,
      selectedSlot,
      availableSlots,
      departments,
      calendarAttributes,
      onDateSelected,
      selectSlot,
      redirectToAuth,
    };
  },
};
</script>


<style scoped>
.reservation-page {
  display: flex;
  flex-direction: row;
  padding: 20px;
  background-color: #f8f3e7;
}
.left-section {
  flex: 1;
  text-align: center;
  margin-right: 20px;
}
.prestation-image {
  width: 100%;
  max-width: 300px;
  border-radius: 10px;
}
.right-section {
  flex: 2;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.details-section {
  margin-top: 20px;
}
.slot-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.sunday-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffebeb; /* 🔥 Rouge clair */
  color: #b30000; /* Rouge foncé */
  text-align: center;
  padding: 8px 15px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 5px;
  margin-bottom: 15px;
  border: 1px solid #b30000;
  max-width: 80%; /* 🔥 Réduit la largeur */
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}





.slot-buttons button {
  padding: 10px 15px;
  background-color: #d4a373;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.slot-buttons button.active {
  background-color: #c58954;
}
.reserve-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #d4a373; /* 🟡 Gold */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.reserve-button:hover {
  background-color: #c58954; /* 🟠 Orangé au hover */
}

.reserve-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
/* ✅ Responsive pour les écrans < 768px (smartphones) */
@media (max-width: 768px) {
  .reservation-page {
    flex-direction: column; /* ✅ Met tout en colonne */
    align-items: center;
    padding: 10px;
  }
  .sunday-warning {
    font-size: 0.9rem;
    padding: 5px 10px;
    max-width: 95%;
  }
  .left-section {
    width: 100%;
    text-align: center;
    margin-bottom: 20px; /* ✅ Ajoute un peu d'espace */
  }

  .prestation-image {
    width: 100%;
    max-width: 250px; /* ✅ Réduit un peu l'image */
    border-radius: 10px;
  }

  .right-section {
    width: 100%;
    padding: 15px;
    box-shadow: none; /* ✅ Supprime l'ombre pour alléger l'affichage */
  }

  .slot-buttons {
    justify-content: center;
  }

  .slot-buttons button {
    width: 48%; /* ✅ Deux boutons par ligne */
    font-size: 0.9rem;
    padding: 12px;
  }

  .reserve-button {
    width: 100%; /* ✅ Le bouton prend toute la largeur */
    font-size: 1.1rem;
    padding: 14px;
  }
}


</style>
