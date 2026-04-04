<template>
  <div class="selection-page">
    <router-link to="/admin" class="back-btn">← Retour au tableau de bord</router-link>

    <div class="prestation-section">
      <h2>📋 Créer une réservation</h2>
      
      <!-- ÉTAPE 1 : Choix du mode -->
      <div v-if="!modeSelectionne" class="mode-selection">
        <h3>Où se déroulera la prestation ?</h3>
        <div class="mode-buttons">
          <button class="mode-btn salon-btn" @click="choisirMode('SALON')">
            🏠 Au Salon
          </button>
          <button class="mode-btn domicile-btn" @click="choisirMode('DOMICILE')">
            🚗 À Domicile
          </button>
        </div>
      </div>

      <!-- ÉTAPE 2 : Ajout des participants et prestations -->
      <div v-else>
        <div class="mode-info">
          <p>📍 Mode : <strong>{{ mode === 'SALON' ? 'Au Salon' : 'À Domicile' }}</strong></p>
          <button class="btn-change-mode" @click="changerMode">🔄 Changer</button>
        </div>

        <!-- Liste des participants déjà ajoutés -->
        <div v-if="participants.length > 0" class="participants-list">
          <h3>Participants ajoutés :</h3>
          <div v-for="(participant, index) in participants" :key="index" class="participant-item">
            <div class="participant-info">
              <span class="participant-number">{{ index + 1 }}.</span>
              <span class="participant-prestation">{{ participant.nom }} - {{ participant.duree }}min - {{ participant.prix.toFixed(2) }}€</span>
            </div>
            <button class="btn-remove" @click="retirerParticipant(index)">🗑️</button>
          </div>
          <div class="duree-total">
            <p>⏱️ Durée totale : <strong>{{ dureeTotal }} minutes</strong></p>
            <p>💰 Prix total : <strong>{{ prixTotal.toFixed(2) }}€</strong></p>
          </div>
        </div>

        <!-- Formulaire pour ajouter un participant -->
        <div class="form-add-participant">
          <h3>{{ participants.length === 0 ? 'Premier participant' : 'Ajouter un participant' }}</h3>
          <div class="form-group">
            <label for="prestation">Prestation :</label>
            <select id="prestation" v-model="prestationSelectionnee">
              <option :value="null" disabled>Sélectionnez une prestation</option>
              <option v-for="p in prestationsDisponibles" :key="p.id" :value="p">
                {{ p.nom }} - {{ p.duree_minutes || p.duree }}min - {{ Number(p.prix).toFixed(2) }}€
              </option>
            </select>
          </div>

          <!-- Soin (uniquement si SALON) -->
          <div v-if="mode === 'SALON' && prestationSelectionnee" class="form-group">
            <label>
              <input type="checkbox" v-model="ajouterSoin" />
              Ajouter un soin visage (+15min, +10€)
            </label>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getPrestations } from "@/services/PrestationService";

const router = useRouter();

const prestations = ref([]);
const mode = ref(null);
const modeSelectionne = ref(false);
const prestationSelectionnee = ref(null);
const ajouterSoin = ref(false);
const participants = ref([]);

const DUREE_SOIN = 15;
const PRIX_SOIN = 10;
const DUREE_DEPLACEMENT = 15; // Temps pour déplacement + paiement à domicile

const prestationsDisponibles = computed(() => {
  // Filtrer pour exclure les soins de la liste
  return prestations.value.filter(p => !p.nom.toLowerCase().includes('soin'));
});

const dureeTotal = computed(() => {
  const dureeParticipants = participants.value.reduce((sum, p) => sum + p.duree, 0);
  // Le backend gère l'ajout du temps de déplacement
  return dureeParticipants;
});

const prixTotal = computed(() => {
  return participants.value.reduce((sum, p) => sum + p.prix, 0);
});

const choisirMode = (modeChoisi) => {
  mode.value = modeChoisi;
  modeSelectionne.value = true;
};

const changerMode = () => {
  if (participants.value.length > 0) {
    if (!confirm('Changer de mode supprimera tous les participants. Continuer ?')) {
      return;
    }
    participants.value = [];
  }
  modeSelectionne.value = false;
  mode.value = null;
};

const ajouterParticipant = () => {
  if (prestationSelectionnee.value) {
    // Convertir explicitement en nombres - la colonne DB s'appelle duree_minutes
    let duree = Number(prestationSelectionnee.value.duree_minutes || prestationSelectionnee.value.duree) || 0;
    let prix = Number(prestationSelectionnee.value.prix) || 0;
    let nom = prestationSelectionnee.value.nom;

    // Ajouter le soin si sélectionné (uniquement SALON)
    if (mode.value === 'SALON' && ajouterSoin.value) {
      duree += DUREE_SOIN;
      prix += PRIX_SOIN;
      nom += ' + Soin visage';
    }

    participants.value.push({
      id: prestationSelectionnee.value.id,
      nom: nom,
      duree: duree,
      prix: prix,
      avecSoin: ajouterSoin.value
    });
    
    prestationSelectionnee.value = null;
    ajouterSoin.value = false;
  }
};

const retirerParticipant = (index) => {
  participants.value.splice(index, 1);
};

const continuer = () => {
  if (participants.value.length > 0 && dureeTotal.value > 0) {
    // Sauvegarder dans localStorage
    const data = {
      mode: mode.value,
      participants: participants.value,
      nbPersonnes: participants.value.length,
      duree_totale: dureeTotal.value,
      prix_total: prixTotal.value
    };
    localStorage.setItem("admin_prestation_selection", JSON.stringify(data));
    
    // Rediriger vers le calendrier avec la durée et le mode en query
    router.push(`/admin/reservation-creneau?duree=${dureeTotal.value}&mode=${mode.value}`);
  }
};

onMounted(async () => {
  try {
    prestations.value = await getPrestations();
    console.log('Prestations chargées:', prestations.value);
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

/* Sélection du mode */
.mode-selection {
  text-align: center;
  padding: 20px;
}

.mode-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
}

.mode-btn {
  padding: 40px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  border: 3px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.salon-btn {
  background: linear-gradient(135deg, #457b9d 0%, #1d3557 100%);
  color: white;
}

.salon-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(69, 123, 157, 0.3);
}

.domicile-btn {
  background: linear-gradient(135deg, #6a994e 0%, #4a7c3e 100%);
  color: white;
}

.domicile-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(106, 153, 78, 0.3);
}

/* Info mode sélectionné */
.mode-info {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mode-info p {
  margin: 0;
  color: #1565c0;
  font-size: 1.1rem;
}

.btn-change-mode {
  padding: 8px 12px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-change-mode:hover {
  background-color: #f57c00;
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

.form-group input[type="checkbox"] {
  margin-right: 8px;
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
