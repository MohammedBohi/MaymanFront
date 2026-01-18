<template>
  <div class="admin-plages">
    <h1 v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">🕒 Gestion des plages horaires</h1>

    <router-link to="/admin" class="back-btn">← Retour au menu admin</router-link>

    <div class="calendar-section">
      <v-calendar is-expanded @dayclick="onDayClick" />
    </div>

    <div v-if="selectedDate" class="form-section" v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      <h3>Plage horaire du {{ selectedDate }}</h3>

      <div v-if="plage.par_defaut">
        <p>⏱ Horaire par défaut : 09:00 → 21:00</p>
      </div>
      <div v-else>
        <p>⏱ Horaire personnalisé : {{ plage.heure_ouverture }} → {{ plage.heure_fermeture }}</p>
      </div>

      <form @submit.prevent="enregistrerPlage">
        <label>Heure d'ouverture :
          <input type="time" v-model="heure_ouverture" required />
        </label>
        <label>Heure de fermeture :
          <input type="time" v-model="heure_fermeture" required />
        </label>
        <button type="submit">Enregistrer</button>
      </form>

      <button v-if="!plage.par_defaut" @click="supprimerPlage" class="delete-btn">
        🗑 Supprimer la plage personnalisée
      </button>
    </div>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      selectedDate: null,
      plage: {},
      heure_ouverture: "",
      heure_fermeture: "",
    };
  },
  methods: {
    async onDayClick(day) {
const localDate = new Date(day.date.getTime() - day.date.getTimezoneOffset() * 60000);
this.selectedDate = localDate.toISOString().split("T")[0];
      await this.fetchPlage();
    },
    async fetchPlage() {
      try {
        const res = await api.get(`/plages-horaires/jour?date=${this.selectedDate}`);
        this.plage = res.data;
        this.heure_ouverture = res.data.heure_ouverture;
        this.heure_fermeture = res.data.heure_fermeture;
      } catch (err) {
        console.error("Erreur récupération plage :", err);
      }
    },
    async enregistrerPlage() {
      try {
        await api.post("/plages-horaires", {
          date: this.selectedDate,
          heure_ouverture: this.heure_ouverture,
          heure_fermeture: this.heure_fermeture,
        });
        alert("✅ Plage horaire enregistrée !");
        await this.fetchPlage();
      } catch (err) {
        console.error("Erreur enregistrement plage :", err);
      }
    },
    async supprimerPlage() {
      if (!confirm("Confirmer la suppression de la plage personnalisée ?")) return;
      try {
        await api.delete(`/plages-horaires?date=${this.selectedDate}`);
        alert("🗑 Plage supprimée, retour aux horaires par défaut.");
        await this.fetchPlage();
      } catch (err) {
        console.error("Erreur suppression plage :", err);
      }
    },
  },
};
</script>


<style scoped>
.admin-plages {
  padding: 30px;
  max-width: 850px;
  margin: auto;
  background-color: #f8f3e7;
  border-radius: 12px;
  font-family: 'Segoe UI', sans-serif;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #5a3d2b;
  text-align: center;
}

.back-btn {
  display: inline-block;
  margin-bottom: 30px;
  background-color: #d4a373;
  color: white;
  padding: 10px 18px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s ease;
}
.back-btn:hover {
  background-color: #c58c58;
}

.calendar-section {
  margin-bottom: 35px;
  background: white;
  padding: 20px;
  border-radius: 10px;
}

.form-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

h3 {
  font-size: 1.3rem;
  color: #3e2723;
  margin-bottom: 15px;
}

p {
  font-size: 1rem;
  color: #444;
  margin-bottom: 10px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

label {
  font-weight: 600;
}

input[type="time"] {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

button[type="submit"] {
  background-color: #d4a373;
  color: white;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}
button[type="submit"]:hover {
  background-color: #c58c58;
}

.delete-btn {
  margin-top: 20px;
  background-color: #e74c3c;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.delete-btn:hover {
  background-color: #cc3b2e;
}

@media (max-width: 600px) {
  .form-section {
    padding: 15px;
  }

  input[type="time"] {
    font-size: 0.95rem;
  }
}

</style>