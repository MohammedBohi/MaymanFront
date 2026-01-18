<template>
  <div class="admin-planning">
    <router-link to="/admin" class="back-btn">← Retour au menu admin</router-link>
    <h1>📅 Gestion du Planning Hebdomadaire</h1>

    <!-- 🗓️ Sélection des jours -->
    <div class="days-selector">
      <button
        v-for="(day, index) in joursSemaine"
        :key="index"
        @click="selectDay(index)"
        :class="{ active: selectedDayIndex === index }"
        class="day-btn"
      >
        {{ day }}
      </button>
    </div>

    <!-- 📝 Détails du jour sélectionné -->
    <div v-if="selectedDay" class="day-details" v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      
      <h2>{{ joursSemaine[selectedDayIndex] }}</h2>

      <!-- Mode -->
      <div class="form-block" v-motion
           :initial="{ opacity: 0, x: -30 }"
           :enter="{ opacity: 1, x: 0, transition: { duration: 400 } }">
        <h3>Mode</h3>
        <div class="mode-selector">
          <button
            @click="selectedMode = 'SALON'"
            :class="{ active: selectedMode === 'SALON' }"
            class="mode-btn"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1, transition: { duration: 300, delay: 50 } }"
          >
            🏛️ Salon
          </button>
          <button
            @click="selectedMode = 'DOMICILE'"
            :class="{ active: selectedMode === 'DOMICILE' }"
            class="mode-btn"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1, transition: { duration: 300, delay: 100 } }"
          >
            🏠 Domicile
          </button>
        </div>
        <button @click="updateMode" class="action-btn save-btn">💾 Enregistrer le mode</button>
      </div>

      <!-- Plages horaires -->
      <div class="form-block" v-motion
           :initial="{ opacity: 0, x: -30 }"
           :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 100 } }">
        <h3>⏰ Plages horaires</h3>
        
        <!-- Ajouter une nouvelle plage -->
        <div class="add-plage">
          <input type="time" v-model="newPlage.heureDebut" placeholder="Heure début" />
          <input type="time" v-model="newPlage.heureFin" placeholder="Heure fin" />
          <button @click="addPlage" class="action-btn">➕ Ajouter plage</button>
        </div>

        <!-- Liste des plages -->
        <div v-if="selectedDay.plages && selectedDay.plages.length" class="plages-list">
          <div v-for="(plage, idx) in selectedDay.plages" :key="plage.id" class="plage-item"
               v-motion
               :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: idx * 50 } }">
            <div class="plage-info">
              <strong>{{ plage.heure_debut }} → {{ plage.heure_fin }}</strong>
            </div>
            <div class="plage-actions">
              <input type="time" v-model="plage.newHeureDebut" />
              <input type="time" v-model="plage.newHeureFin" />
              <button @click="updatePlage(plage)" class="action-btn update-btn">📝 Modifier</button>
              <button @click="deletePlage(plage.id)" class="action-btn delete-btn">🗑 Supprimer</button>
            </div>
          </div>
        </div>
        <p v-else class="no-data">Aucune plage horaire.</p>
      </div>

      <!-- Départements (DOMICILE uniquement) -->
      <div v-if="selectedMode === 'DOMICILE'" class="form-block" v-motion
           :initial="{ opacity: 0, x: -30 }"
           :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 200 } }">
        <h3>📍 Départements desservis</h3>
        
        <!-- Ajouter un département -->
        <div class="add-dept">
          <select v-model="newDept.code">
            <option value="">Choisir un département</option>
            <option value="46">Lot (46)</option>
            <option value="82">Tarn-et-Garonne (82)</option>
          </select>
          <button @click="addDepartement" class="action-btn" :disabled="!newDept.code">➕ Ajouter</button>
        </div>

        <!-- Liste des départements -->
        <div v-if="selectedDay.departements && selectedDay.departements.length" class="depts-list">
          <div v-for="(dept, idx) in selectedDay.departements" :key="dept.id" class="dept-item"
               v-motion
               :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: idx * 50 } }">
            <div class="dept-info">
              <strong>{{ dept.nom }} ({{ dept.code }})</strong>
            </div>
            <button @click="deleteDepartement(dept.id)" class="action-btn delete-btn">🗑 Supprimer</button>
          </div>
        </div>
        <p v-else class="no-data">Aucun département.</p>
      </div>

      <!-- Message pour SALON -->
      <div v-else class="info-block" v-motion
           :initial="{ opacity: 0, y: 20 }"
           :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 } }">
        <p>✅ Mode Salon — aucun département à gérer</p>
      </div>

      <!-- Statut -->
      <div class="form-block" v-motion
           :initial="{ opacity: 0, x: -30 }"
           :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: 250 } }">
        <label class="checkbox-label">
          <input type="checkbox" v-model="selectedDay.actif" />
          <strong>Jour actif</strong>
        </label>
        <button @click="updateActif" class="action-btn save-btn">💾 Enregistrer statut</button>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" class="success-message">{{ message }}</div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

const router = useRouter();

const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const selectedDayIndex = ref(1); // Commence au lundi
const selectedDay = ref(null);
const selectedMode = ref("SALON");
const message = ref("");
const error = ref("");

const newPlage = ref({ heureDebut: "", heureFin: "" });
const newDept = ref({ code: "" });

const deptMapping = {
  "46": "Lot",
  "82": "Tarn-et-Garonne"
};

onMounted(async () => {
  await loadPlannings();
  selectDay(1);
});

const loadPlannings = async () => {
  try {
    const res = await api.get("/planning-hebdo");
    const plannings = res.data;
    
    // Construire un map jour → planning
    const planningMap = {};
    plannings.forEach(p => {
      planningMap[p.jour_semaine] = p;
    });

    // Remplir les jours manquants
    for (let i = 0; i < 7; i++) {
      if (!planningMap[i]) {
        planningMap[i] = {
          jour_semaine: i,
          actif: false,
          mode: "SALON",
          plages: [],
          departements: []
        };
      }
    }

    window.allPlannings = planningMap;
    message.value = "";
  } catch (e) {
    error.value = "Erreur chargement plannings";
    console.error(e);
  }
};

const selectDay = (index) => {
  selectedDayIndex.value = index;
  const planning = window.allPlannings[index];
  selectedDay.value = JSON.parse(JSON.stringify(planning)); // Clone
  selectedMode.value = planning.mode || "SALON";
  newPlage.value = { heureDebut: "", heureFin: "" };
  newDept.value = { code: "" };
};

const updateMode = async () => {
  try {
    if (!selectedDay.value.id) {
      // Créer le planning s'il n'existe pas
      const res = await api.post("/planning-hebdo", {
        jour_semaine: selectedDayIndex.value,
        actif: true,
        mode: selectedMode.value
      });
      selectedDay.value.id = res.data.planning.id;
    } else {
      // Modifier le planning existant
      await api.put(`/planning-hebdo/${selectedDay.value.id}`, {
        mode: selectedMode.value
      });
    }
    // Recharger les données du jour
    await reloadDayData();
    message.value = "✅ Mode enregistré";
    setTimeout(() => message.value = "", 3000);
  } catch (e) {
    error.value = e.response?.data?.error || "Erreur";
    console.error(e);
  }
};

const updateActif = async () => {
  try {
    if (!selectedDay.value.id) {
      const res = await api.post("/planning-hebdo", {
        jour_semaine: selectedDayIndex.value,
        actif: selectedDay.value.actif,
        mode: selectedMode.value
      });
      selectedDay.value.id = res.data.planning.id;
    } else {
      await api.put(`/planning-hebdo/${selectedDay.value.id}`, {
        actif: selectedDay.value.actif
      });
    }
    // Recharger les données du jour
    await reloadDayData();
    message.value = "✅ Statut enregistré";
    setTimeout(() => message.value = "", 3000);
  } catch (e) {
    error.value = e.response?.data?.error || "Erreur";
    console.error(e);
  }
};

const addPlage = async () => {
  if (!newPlage.value.heureDebut || !newPlage.value.heureFin) {
    error.value = "❌ Remplissez les deux horaires";
    return;
  }

  try {
    // Créer planning si nécessaire
    if (!selectedDay.value.id) {
      const res = await api.post("/planning-hebdo", {
        jour_semaine: selectedDayIndex.value,
        actif: true,
        mode: selectedMode.value
      });
      selectedDay.value.id = res.data.planning.id;
    }

    // Ajouter plage
    await api.post(`/planning-hebdo/${selectedDay.value.id}/plages`, {
      heure_debut: newPlage.value.heureDebut,
      heure_fin: newPlage.value.heureFin
    });

    newPlage.value = { heureDebut: "", heureFin: "" };
    // Recharger les données du jour
    await reloadDayData();
    message.value = "✅ Plage ajoutée";
    setTimeout(() => message.value = "", 3000);
  } catch (e) {
    error.value = e.response?.data?.error || "Erreur";
    console.error(e);
  }
};

const updatePlage = async (plage) => {
  try {
    const heureDebut = plage.newHeureDebut || plage.heure_debut;
    const heureFin = plage.newHeureFin || plage.heure_fin;

    await api.put(`/planning-hebdo/plages/${plage.id}`, {
      heure_debut: heureDebut,
      heure_fin: heureFin
    });

    // Recharger les données du jour
    await reloadDayData();
    message.value = "✅ Plage modifiée";
    setTimeout(() => message.value = "", 3000);
  } catch (e) {
    error.value = e.response?.data?.error || "Erreur";
    console.error(e);
  }
};

const deletePlage = async (plageId) => {
  if (!confirm("Supprimer cette plage ?")) return;
  try {
    await api.delete(`/planning-hebdo/plages/${plageId}`);
    // Recharger les données du jour
    await reloadDayData();
    message.value = "✅ Plage supprimée";
    setTimeout(() => message.value = "", 3000);
  } catch (e) {
    error.value = e.response?.data?.error || "Erreur";
    console.error(e);
  }
};

const addDepartement = async () => {
  if (!newDept.value.code) {
    error.value = "❌ Sélectionnez un département";
    return;
  }

  try {
    if (!selectedDay.value.id) {
      const res = await api.post("/planning-hebdo", {
        jour_semaine: selectedDayIndex.value,
        actif: true,
        mode: "DOMICILE"
      });
      selectedDay.value.id = res.data.planning.id;
    }

    await api.post(`/planning-hebdo/${selectedDay.value.id}/departements`, {
      code: newDept.value.code,
      nom: deptMapping[newDept.value.code]
    });

    newDept.value.code = "";
    // Recharger les données du jour
    await reloadDayData();
    message.value = "✅ Département ajouté";
    setTimeout(() => message.value = "", 3000);
  } catch (e) {
    error.value = e.response?.data?.error || "Erreur";
    console.error(e);
  }
};

const deleteDepartement = async (deptId) => {
  if (!confirm("Supprimer ce département ?")) return;
  try {
    await api.delete(`/planning-hebdo/departements/${deptId}`);
    // Recharger les données du jour
    await reloadDayData();
    message.value = "✅ Département supprimé";
    setTimeout(() => message.value = "", 3000);
  } catch (e) {
    error.value = e.response?.data?.error || "Erreur";
    console.error(e);
  }
};

// Nouvelle fonction pour recharger les données du jour
const reloadDayData = async () => {
  try {
    const res = await api.get(`/planning-hebdo/${selectedDayIndex.value}`);
    const planning = res.data;
    selectedDay.value = JSON.parse(JSON.stringify(planning));
    window.allPlannings[selectedDayIndex.value] = planning;
  } catch (e) {
    console.error("Erreur rechargement jour:", e);
  }
};
</script>

<style scoped>
.admin-planning {
  padding: 30px 20px;
  max-width: 1400px;
  margin: auto;
  background-color: #f8f3e7;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

.back-btn {
  display: inline-block;
  margin-bottom: 20px;
  padding: 8px 14px;
  background-color: #d4a373;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #c78d56;
}

h1 {
  font-size: 2rem;
  color: #5a3d2b;
  margin-bottom: 30px;
  text-align: center;
}

/* 🗓️ Sélection des jours */
.days-selector {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 30px;
  width: 100%;
  overflow: visible;
}

.day-btn {
  padding: 12px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: visible;
}

.day-btn:hover {
  border-color: #d4a373;
  transform: translateY(-2px);
}

.day-btn.active {
  background-color: #d4a373;
  color: white;
  border-color: #d4a373;
  transform: scale(1.05);
}

/* 📝 Détails du jour */
.day-details {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.day-details h2 {
  font-size: 1.8rem;
  color: #5a3d2b;
  margin-bottom: 25px;
  text-align: center;
}

.form-block {
  margin-bottom: 25px;
  padding: 20px;
  background-color: #fdf9f1;
  border-left: 4px solid #d4a373;
  border-radius: 8px;
}

.form-block h3 {
  font-size: 1.2rem;
  color: #3e2723;
  margin-bottom: 15px;
}

/* Mode selector */
.mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.mode-btn {
  flex: 1;
  padding: 12px;
  background-color: #e8e8e8;
  border: 2px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #d4a373;
  transform: translateY(-2px);
}

.mode-btn.active {
  background-color: #d4a373;
  color: white;
  border-color: #d4a373;
  transform: scale(1.02);
}

/* Ajouter plage/département */
.add-plage, .add-dept {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.add-plage input, .add-dept select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.95rem;
}

.add-plage input {
  flex: 1;
  min-width: 120px;
}

.add-dept select {
  flex: 1;
  min-width: 150px;
}

/* Listes */
.plages-list, .depts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plage-item, .dept-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #eee;
}

.plage-info, .dept-info {
  flex: 1;
}

.plage-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.plage-actions input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 100px;
}

/* Boutons */
.action-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.2s, transform 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.05);
}

.action-btn:active {
  transform: scale(0.98);
}

.save-btn {
  background-color: #6a994e;
  color: white;
}

.save-btn:hover {
  opacity: 0.9;
}

.update-btn {
  background-color: #457b9d;
  color: white;
}

.delete-btn {
  background-color: #e76f51;
  color: white;
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 1rem;
}

.checkbox-label input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* Info block */
.info-block {
  padding: 15px;
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  border-radius: 6px;
  margin-bottom: 15px;
}

/* Messages */
.success-message, .error-message {
  padding: 15px;
  margin-top: 20px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
}

.success-message {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.error-message {
  background-color: #ffcdd2;
  color: #c62828;
}

.no-data {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 15px;
}

@media (max-width: 768px) {
  .days-selector {
    grid-template-columns: repeat(3, 1fr);
  }

  .plage-actions {
    flex-direction: column;
    width: 100%;
  }

  .plage-actions input {
    width: 100%;
  }

  .day-details {
    padding: 20px;
  }
}
</style>
