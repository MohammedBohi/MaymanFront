<template>
  <div class="selection-page">
    <router-link to="/admin" class="back-btn">← Retour au tableau de bord</router-link>

    <div class="prestation-section">
      <h2>📋 Ajouter les participants et leurs prestations</h2>
      
      <!-- Liste des participants déjà ajoutés -->
      <div v-if="participants.length > 0" class="participants-list">
        <h3>Participants ajoutés :</h3>
        <div v-for="(participant, index) in participants" :key="index" class="participant-item">
          <div class="participant-info">
            <span class="participant-number">{{ index + 1 }}.</span>
            <span class="participant-prestation">{{ participant.nom }} - {{ participant.duree }}min - {{ participant.prix }}€</span>
          </div>
          <button class="btn-remove" @click="retirerParticipant(index)">🗑️</button>
        </div>
        <div class="duree-total">
          <p>⏱️ Durée totale : <strong>{{ dureeTotal }} minutes</strong></p>
          <p>💰 Prix total : <strong>{{ prixTotal }}€</strong></p>
        </div>
      </div>

      <!-- Formulaire pour ajouter un participant -->
      <div class="form-add-participant">
        <h3>{{ participants.length === 0 ? 'Premier participant' : 'Ajouter un participant' }}</h3>
        <div class="form-group">
          <label for="prestation">Prestation :</label>
          <select id="prestation" v-model="prestationSelectionnee">
            <option :value="null" disabled>Sélectionnez une prestation</option>
            <option v-for="p in prestations" :key="p.id" :value="p">
              {{ p.nom }} - {{ p.duree }}min - {{ p.prix }}€
            </option>
          </select>
        </div>

        <button 
          class="btn-add" 
          :disabled="!prestationSelectionnee"
          @click="ajouterParticipant"
        >
          ➕ Ajouter ce participant
        </button>
      </div>

      <button 
        class="reserve-button" 
        :disabled="participants.length === 0"
        @click="continuer"
      >
        ➡ Continuer vers le calendrier
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getPrestations } from "@/services/PrestationService";

const router = useRouter();

const prestations = ref([]);
const prestationSelectionnee = ref(null);
const participants = ref([]);

const dureeTotal = computed(() => {
  return participants.value.reduce((sum, p) => sum + p.duree, 0);
});

const prixTotal = computed(() => {
  return participants.value.reduce((sum, p) => sum + p.prix, 0);
});

const ajouterParticipant = () => {
  if (prestationSelectionnee.value) {
    participants.value.push({
      id: prestationSelectionnee.value.id,
      nom: prestationSelectionnee.value.nom,
      duree: prestationSelectionnee.value.duree,
      prix: prestationSelectionnee.value.prix
    });
    prestationSelectionnee.value = null;
  }
};

const retirerParticipant = (index) => {
  participants.value.splice(index, 1);
};

const continuer = () => {
  if (participants.value.length > 0 && dureeTotal.value > 0) {
    // Sauvegarder dans localStorage
    const data = {
      participants: participants.value,
      nbPersonnes: participants.value.length,
      duree_totale: dureeTotal.value,
      prix_total: prixTotal.value
    };
    localStorage.setItem("admin_prestation_selection", JSON.stringify(data));
    
    // Rediriger vers le calendrier avec la durée en query
    router.push(`/admin/reservation-creneau?duree=${dureeTotal.value}`);
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
  max-width: 700px;
  margin: auto;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  font-size: 1.6rem;
  margin-bottom: 20px;
  color: #5a3d2b;
  text-align: center;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #5a3d2b;
}

.prestation-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Liste des participants */
.participants-list {
  background: #f0f7ff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.participant-info {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
}

.participant-number {
  font-weight: bold;
  color: #457b9d;
  font-size: 1.1rem;
}

.participant-prestation {
  color: #5a3d2b;
}

.btn-remove {
  padding: 6px 10px;
  background-color: #e63946;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-remove:hover {
  background-color: #d62828;
}

.duree-total {
  margin-top: 15px;
  padding: 15px;
  background: #e8f5e9;
  border-radius: 6px;
  text-align: center;
}

.duree-total p {
  margin: 5px 0;
  font-size: 1.1rem;
  color: #2e7d32;
}

/* Formulaire ajout participant */
.form-add-participant {
  padding: 20px;
  background: #fff3e0;
  border-radius: 8px;
  margin-bottom: 20px;
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

.form-group select {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.btn-add {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 6px;
  background-color: #457b9d;
  color: white;
  border: none;
  cursor: pointer;
}

.btn-add:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-add:hover:not(:disabled) {
  background-color: #1d3557;
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
