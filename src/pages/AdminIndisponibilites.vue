<template>
  <div class="admin-indispo">
    <h1>❌ Gérer les indisponibilités</h1>

    <router-link to="/admin" class="back-btn">← Retour au menu admin</router-link>

    <div class="calendar-section">
      <v-calendar is-expanded @dayclick="onDayClick" />
    </div>

    <div v-if="selectedDate" class="form-section">
      <h3>Ajouter une indisponibilité pour le {{ selectedDate }}</h3>
      <form @submit.prevent="ajouterIndispo">
        <label>Heure de début :
          <input type="time" v-model="heure_debut" required />
        </label>
        <label>Heure de fin :
          <input type="time" v-model="heure_fin" required />
        </label>
        <label>Motif (optionnel) :
          <input type="text" v-model="motif" />
        </label>
        <button type="submit">Ajouter</button>
      </form>
    </div>

    <div v-if="indispos.length > 0" class="list-section">
      <h3>Indisponibilités du {{ selectedDate }}</h3>
      <ul>
        <li v-for="indispo in indispos" :key="indispo.id">
          ⛔ {{ indispo.heure_debut }} → {{ indispo.heure_fin }}
          <span v-if="indispo.motif">({{ indispo.motif }})</span>
          <button @click="supprimerIndispo(indispo.id)">Supprimer</button>
        </li>
      </ul>
    </div>

    <p v-else-if="selectedDate">Aucune indisponibilité pour ce jour.</p>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      selectedDate: null,
      heure_debut: "",
      heure_fin: "",
      motif: "",
      indispos: [],
    };
  },
  methods: {
    async onDayClick(day) {
  const localDate = new Date(day.date.getTime() - day.date.getTimezoneOffset() * 60000);
  this.selectedDate = localDate.toISOString().split("T")[0];
  this.fetchIndispos();
}
,
    async fetchIndispos() {
      try {
        const res = await api.get(`/indisponibilites?date=${this.selectedDate}`);
        this.indispos = res.data;
      } catch (err) {
        console.error("Erreur récupération indispos :", err);
      }
    },
    async ajouterIndispo() {
      try {
        await api.post("/indisponibilites", {
          jour: this.selectedDate,
          heure_debut: this.heure_debut,
          heure_fin: this.heure_fin,
          motif: this.motif,
        });
        this.heure_debut = "";
        this.heure_fin = "";
        this.motif = "";
        await this.fetchIndispos();
      } catch (err) {
        console.error("Erreur ajout :", err);
        alert("Erreur lors de l’ajout.");
      }
    },
    async supprimerIndispo(id) {
      if (!confirm("Confirmer la suppression ?")) return;
      try {
        await api.delete(`/indisponibilites/${id}`);
        await this.fetchIndispos();
      } catch (err) {
        console.error("Erreur suppression :", err);
      }
    },
  },
};
</script>

<style scoped>
.admin-indispo {
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

.form-section,
.list-section {
  background: white;
  padding: 20px 25px;
  border-radius: 10px;
  margin-bottom: 25px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

h3 {
  font-size: 1.3rem;
  color: #3e2723;
  margin-bottom: 15px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  font-weight: 600;
}

input[type="time"],
input[type="text"] {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
}

button[type="submit"] {
  background-color: #d4a373;
  color: white;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
button[type="submit"]:hover {
  background-color: #c58c58;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  background: #fefefe;
  padding: 12px;
  border-left: 5px solid #e74c3c;
  border-radius: 6px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

li span {
  font-style: italic;
  color: #555;
  margin-left: 10px;
}

li button {
  background-color: #e74c3c;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
}
li button:hover {
  background-color: #cc3b2e;
}

@media (max-width: 600px) {
  .admin-indispo {
    padding: 20px;
  }

  .form-section, .list-section {
    padding: 15px;
  }

  li {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

</style>