<template>
  <div class="selection-page">
    <router-link to="/admin" class="back-btn">← Retour au tableau de bord</router-link>

    <div class="prestation-section">
      <h2>📋 Choisissez la prestation et le nombre de personnes</h2>
      
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
        @click="continuer"
      >
        ➡ Continuer vers le calendrier
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getPrestations } from "@/services/PrestationService";

const router = useRouter();

const prestations = ref([]);
const selectedPrestation = ref(null);
const nbPersonnes = ref(1);
const dureeCalculee = ref(0);

const calculerDuree = () => {
  if (selectedPrestation.value && nbPersonnes.value > 0) {
    dureeCalculee.value = selectedPrestation.value.duree * nbPersonnes.value;
  } else {
    dureeCalculee.value = 0;
  }
};

const continuer = () => {
  if (selectedPrestation.value && nbPersonnes.value > 0 && dureeCalculee.value > 0) {
    // Sauvegarder dans localStorage
    const data = {
      prestation: selectedPrestation.value,
      nbPersonnes: nbPersonnes.value,
      duree_totale: dureeCalculee.value
    };
    localStorage.setItem("admin_prestation_selection", JSON.stringify(data));
    
    // Rediriger vers le calendrier avec la durée en query
    router.push(`/admin/reservation-creneau?duree=${dureeCalculee.value}`);
  }
};

onMounted(async () => {
  try {
    prestations.value = await getPrestations();
  } catch (error) {
    console.error('Erreur chargement prestations:', error);
    prestations.value = [];
  }
});
</script>

<style scoped>
.selection-page {
  padding: 40px 20px;
  background-color: #f9f4ee;
  max-width: 600px;
  margin: auto;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  font-size: 1.6rem;
  margin-bottom: 20px;
  color: #5a3d2b;
  text-align: center;
}

.prestation-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

.reserve-button {
  width: 100%;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 6px;
  background-color: #6a994e;
  color: white;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}

.reserve-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.reserve-button:hover:not(:disabled) {
  background-color: #5a8a3e;
}
</style>
