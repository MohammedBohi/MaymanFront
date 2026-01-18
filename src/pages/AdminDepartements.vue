<template>
  <div class="admin-departements">
    <router-link to="/admin" class="back-btn">← Retour au menu admin</router-link>
    <h1>📍 Gestion des Départements</h1>

    <!-- Formulaire d'ajout/modification -->
    <div class="form-section" v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      <h2>{{ editingDept ? '✏️ Modifier' : '➕ Ajouter' }} un département</h2>
      
      <div class="form-grid">
        <div class="form-field">
          <label>Nom de la ville *</label>
          <input 
            type="text" 
            v-model="formData.nom" 
            placeholder="Ex: Limogne-en-Quercy"
            required
          />
        </div>

        <div class="form-field">
          <label>Code postal *</label>
          <input 
            type="text" 
            v-model="formData.code_postal" 
            placeholder="Ex: 46260"
            maxlength="10"
            required
          />
        </div>

        <div class="form-field">
          <label>Mode *</label>
          <select v-model="formData.mode" required>
            <option value="DOMICILE">🏠 Domicile</option>
            <option value="SALON">🏛️ Salon</option>
          </select>
        </div>

        <div class="form-field full-width">
          <label>Adresse (optionnel)</label>
          <textarea 
            v-model="formData.adresse" 
            placeholder="Adresse complète du salon (si applicable)"
            rows="2"
          ></textarea>
        </div>

        <div class="form-field">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.actif" />
            <strong>Actif</strong>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button @click="saveDepartement" class="btn-save" :disabled="!isFormValid">
          {{ editingDept ? '💾 Enregistrer' : '➕ Ajouter' }}
        </button>
        <button v-if="editingDept" @click="cancelEdit" class="btn-cancel">
          ❌ Annuler
        </button>
      </div>
    </div>

    <!-- Liste des départements -->
    <div class="list-section" v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }">
      <h2>📋 Liste des départements</h2>

      <!-- Filtres -->
      <div class="filters">
        <button 
          @click="filterMode = null" 
          :class="{ active: filterMode === null }"
          class="filter-btn"
        >
          Tous ({{ departements.length }})
        </button>
        <button 
          @click="filterMode = 'DOMICILE'" 
          :class="{ active: filterMode === 'DOMICILE' }"
          class="filter-btn"
        >
          🏠 Domicile ({{ departementsFiltered.filter(d => d.mode === 'DOMICILE').length }})
        </button>
        <button 
          @click="filterMode = 'SALON'" 
          :class="{ active: filterMode === 'SALON' }"
          class="filter-btn"
        >
          🏛️ Salon ({{ departementsFiltered.filter(d => d.mode === 'SALON').length }})
        </button>
        <button 
          @click="showInactive = !showInactive" 
          :class="{ active: showInactive }"
          class="filter-btn"
        >
          {{ showInactive ? '👁️ Tous' : '✅ Actifs uniquement' }}
        </button>
      </div>

      <!-- Tableau -->
      <div v-if="departementsFiltered.length > 0" class="dept-table">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Code postal</th>
              <th>Mode</th>
              <th>Adresse</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(dept, idx) in departementsFiltered" 
              :key="dept.id"
              :class="{ inactive: !dept.actif }"
              v-motion
              :initial="{ opacity: 0, x: -20 }"
              :enter="{ opacity: 1, x: 0, transition: { duration: 300, delay: idx * 30 } }"
            >
              <td><strong>{{ dept.nom }}</strong></td>
              <td>{{ dept.code_postal }}</td>
              <td>
                <span class="mode-badge" :class="dept.mode.toLowerCase()">
                  {{ dept.mode === 'SALON' ? '🏛️ Salon' : '🏠 Domicile' }}
                </span>
              </td>
              <td>{{ dept.adresse || '-' }}</td>
              <td>
                <span class="status-badge" :class="{ active: dept.actif, inactive: !dept.actif }">
                  {{ dept.actif ? '✅ Actif' : '❌ Inactif' }}
                </span>
              </td>
              <td class="actions">
                <button @click="editDepartement(dept)" class="btn-edit" title="Modifier">
                  ✏️
                </button>
                <button @click="deleteDepartement(dept.id)" class="btn-delete" title="Supprimer">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="no-data">Aucun département trouvé.</p>
    </div>

    <!-- Messages -->
    <div v-if="message" class="success-message">{{ message }}</div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

const router = useRouter();

const departements = ref([]);
const editingDept = ref(null);
const filterMode = ref(null);
const showInactive = ref(false);
const message = ref("");
const error = ref("");

const formData = ref({
  nom: "",
  code_postal: "",
  mode: "DOMICILE",
  adresse: "",
  actif: true
});

const isFormValid = computed(() => {
  return formData.value.nom.trim() !== "" && 
         formData.value.code_postal.trim() !== "" &&
         formData.value.mode !== "";
});

const departementsFiltered = computed(() => {
  let filtered = departements.value;
  
  // Filtre par mode
  if (filterMode.value) {
    filtered = filtered.filter(d => d.mode === filterMode.value);
  }
  
  // Filtre actifs/inactifs
  if (!showInactive.value) {
    filtered = filtered.filter(d => d.actif);
  }
  
  return filtered.sort((a, b) => a.nom.localeCompare(b.nom));
});

onMounted(async () => {
  await loadDepartements();
});

const loadDepartements = async () => {
  try {
    // Charger TOUS les départements (y compris inactifs) pour l'interface admin
    const res = await api.get("/departements?all=true");
    departements.value = res.data;
    error.value = "";
  } catch (e) {
    error.value = "Erreur lors du chargement des départements";
    console.error(e);
  }
};

const saveDepartement = async () => {
  if (!isFormValid.value) {
    error.value = "❌ Veuillez remplir tous les champs obligatoires";
    return;
  }

  try {
    if (editingDept.value) {
      // Modification
      await api.put(`/departements/${editingDept.value.id}`, formData.value);
      message.value = "✅ Département modifié avec succès";
    } else {
      // Ajout
      await api.post("/departements", formData.value);
      message.value = "✅ Département ajouté avec succès";
    }
    
    await loadDepartements();
    resetForm();
    error.value = "";
    setTimeout(() => message.value = "", 3000);
  } catch (e) {
    error.value = e.response?.data?.error || "Erreur lors de l'enregistrement";
    console.error(e);
  }
};

const editDepartement = (dept) => {
  editingDept.value = dept;
  formData.value = {
    nom: dept.nom,
    code_postal: dept.code_postal,
    mode: dept.mode,
    adresse: dept.adresse || "",
    actif: dept.actif
  };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  resetForm();
};

const resetForm = () => {
  editingDept.value = null;
  formData.value = {
    nom: "",
    code_postal: "",
    mode: "DOMICILE",
    adresse: "",
    actif: true
  };
};

const deleteDepartement = async (id) => {
  if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer ce département ?\n\nCela pourrait affecter les plannings existants.")) {
    return;
  }

  try {
    await api.delete(`/departements/${id}`);
    message.value = "✅ Département supprimé avec succès";
    await loadDepartements();
    error.value = "";
    setTimeout(() => message.value = "", 3000);
  } catch (e) {
    error.value = e.response?.data?.error || "Erreur lors de la suppression";
    console.error(e);
  }
};
</script>

<style scoped>
.admin-departements {
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

h2 {
  font-size: 1.4rem;
  color: #5a3d2b;
  margin-bottom: 20px;
}

/* Formulaire */
.form-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  color: #5a3d2b;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #d4a373;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-top: 8px;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-start;
}

.btn-save,
.btn-cancel {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-2px);
}

.btn-save:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f44336;
  color: white;
}

.btn-cancel:hover {
  background-color: #da190b;
  transform: translateY(-2px);
}

/* Liste */
.list-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #d4a373;
}

.filter-btn.active {
  background-color: #d4a373;
  color: white;
  border-color: #d4a373;
}

/* Tableau */
.dept-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #5a3d2b;
  color: white;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
}

tbody tr {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

tbody tr.inactive {
  opacity: 0.6;
}

td {
  padding: 12px;
}

.mode-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.mode-badge.domicile {
  background-color: #e3f2fd;
  color: #1976d2;
}

.mode-badge.salon {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-edit {
  background-color: #2196F3;
  color: white;
}

.btn-edit:hover {
  background-color: #1976D2;
  transform: scale(1.1);
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.btn-delete:hover {
  background-color: #da190b;
  transform: scale(1.1);
}

/* Messages */
.success-message,
.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.success-message {
  background-color: #4CAF50;
  color: white;
}

.error-message {
  background-color: #f44336;
  color: white;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .dept-table {
    font-size: 0.9rem;
  }
  
  th, td {
    padding: 8px;
  }
}
</style>
