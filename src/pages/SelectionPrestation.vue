<template>
  <div class="selection-prestation">
    <h1 v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      📋 Configurez votre réservation
    </h1>

    <!-- Étape 1: Choix du mode -->
    <div v-if="!modeSelectionne" class="mode-selection" v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      <h2>📍 Où souhaitez-vous votre prestation ?</h2>
      <div class="mode-buttons">
        <button class="mode-btn salon" @click="choisirMode('SALON')">
          <span class="icon">🏠</span>
          <h3>Au salon</h3>
          <p>12 rue Champs des Chartreux, Villefranche-de-Rouergue</p>
        </button>
        <button class="mode-btn domicile" @click="choisirMode('DOMICILE')">
          <span class="icon">🚗</span>
          <h3>On se déplace vers vous</h3>
          <p>(dans les départements affichés)</p>
        </button>
      </div>
    </div>

    <!-- Étape 2: Configuration des participants -->
    <div v-if="modeSelectionne" class="participants-section" v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      
      <div class="mode-info">
        <p><strong>Mode sélectionné :</strong> 
          <span :class="mode === 'SALON' ? 'badge-salon' : 'badge-domicile'">{{ mode }}</span>
        </p>
        <button class="btn-change-mode" @click="changerMode">Changer de mode</button>
      </div>

      <h2>👥 Participants à cette réservation</h2>
      
      <!-- Liste des participants déjà ajoutés -->
      <div v-if="participants.length > 0" class="participants-list">
        <div v-for="(p, index) in participants" :key="index" class="participant-card">
          <div class="participant-header">
            <h4>👤 Participant {{ index + 1 }}</h4>
            <button class="btn-remove" @click="retirerParticipant(index)">❌</button>
          </div>
          <p><strong>Prestation :</strong> {{ p.nom }}</p>
          <p><strong>Prix :</strong> {{ p.prix.toFixed(2) }}€</p>
        </div>
      </div>

      <!-- Ajout d'un participant -->
      <div class="add-participant">
        <h3>➕ Ajouter un participant</h3>
        
        <label>Sélectionnez une prestation :</label>
        <select v-model="prestationSelectionnee" class="prestation-select">
          <option :value="null" disabled>Choisir une prestation...</option>
          <option v-for="p in prestationsDisponibles" :key="p.id" :value="p">
            {{ p.nom }} - {{ Number(p.prix).toFixed(2) }}€
          </option>
        </select>

        <div v-if="mode === 'SALON' && prestationSelectionnee && prestationSelectionnee.soin_disponible" class="checkbox-container">
          <label class="checkbox-label">
            <input type="checkbox" v-model="ajouterSoin" />
            Ajouter un soin visage (+10€)
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

      <!-- Récapitulatif -->
      <div v-if="participants.length > 0" class="summary">
        <h3>📊 Récapitulatif</h3>
        <p><strong>Nombre de personnes :</strong> {{ participants.length }}</p>
        <p><strong>Prix total :</strong> {{ prixTotal.toFixed(2) }}€</p>
      </div>

      <button 
        class="reserve-button" 
        :disabled="participants.length === 0"
        @click="continuer"
      >
        ➡ Continuer vers le calendrier
      </button>
      <button class="back-button" @click="$router.back()">⬅ Retour</button>
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
const prestationInitiale = ref(null);

const DUREE_SOIN = 15;
const PRIX_SOIN = 10;
const DUREE_DEPLACEMENT = 15; // Temps pour déplacement + paiement à domicile

const isGroupe = computed(() => {
  return prestationInitiale.value?.nom?.toLowerCase().includes('groupe');
});

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
  
  // Ajouter automatiquement la prestation initiale
  if (prestationInitiale.value) {
    const prestation = prestations.value.find(p => p.id == prestationInitiale.value.id);
    if (prestation) {
      let prix = Number(prestation.prix) || 0;
      participants.value.push({
        id: prestation.id,
        nom: prestation.nom,
        duree: Number(prestation.duree_minutes || 0),
        prix: prix,
        avecSoin: false
      });
    }
  }
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
      mode: mode.value || 'SALON', // Par défaut SALON pour les groupes
      participants: participants.value,
      nbPersonnes: participants.value.length,
      duree_totale: dureeTotal.value,
      prix_total: prixTotal.value
    };
    localStorage.setItem("client_prestation_selection", JSON.stringify(data));
    
    // Rediriger vers le calendrier avec la durée et le mode en query
    router.push(`/reservation?duree=${dureeTotal.value}&mode=${mode.value || 'SALON'}`);
  }
};

onMounted(async () => {
  try {
    const data = await getPrestations();
    prestations.value = data;

    // Récupérer la prestation sélectionnée depuis la page d'accueil
    const saved = localStorage.getItem("selected_prestation");
    if (saved) {
      prestationInitiale.value = JSON.parse(saved);
      
      // Si c'est une prestation groupe, passer directement à l'ajout de participants
      if (isGroupe.value) {
        mode.value = 'SALON'; // Par défaut pour les groupes
        modeSelectionne.value = true;
      } else {
        // Pour les prestations normales, pré-sélectionner la prestation
        prestationSelectionnee.value = prestations.value.find(
          p => p.id === prestationInitiale.value.id || p.nom === prestationInitiale.value.nom
        ) || null;
      }
    } else {
      alert("⚠️ Veuillez d'abord sélectionner une prestation");
      router.push("/");
    }
  } catch (error) {
    console.error("Erreur chargement prestations :", error);
  }
});
</script>

<style scoped>
.selection-prestation {
  max-width: 900px;
  margin: 30px auto;
  padding: 30px;
  background-color: #f8f3e7;
  border-radius: 12px;
  font-family: 'Segoe UI', sans-serif;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-align: center;
  color: #5a3d2b;
}

h2 {
  font-size: 1.4rem;
  margin-bottom: 20px;
  color: #5a3d2b;
  text-align: center;
}

.mode-selection {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.mode-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.mode-btn {
  background: white;
  border: 3px solid transparent;
  border-radius: 12px;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.mode-btn.salon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mode-btn.domicile {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

.mode-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.mode-btn .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
}

.mode-btn h3 {
  font-size: 1.3rem;
  margin: 10px 0;
  color: white;
}

.mode-btn p {
  font-size: 0.95rem;
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.9);
}

.mode-btn small {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.participants-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.mode-info {
  background: #f0f8ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-change-mode {
  background: #999;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-change-mode:hover {
  background: #777;
}

.badge-salon {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 600;
}

.badge-domicile {
  display: inline-block;
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 600;
}

.participants-list {
  display: grid;
  gap: 15px;
  margin-bottom: 25px;
}

.participant-card {
  background: #fff7f1;
  padding: 20px;
  border-left: 5px solid #d4a373;
  border-radius: 8px;
}

.participant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.participant-header h4 {
  margin: 0;
  color: #5a3d2b;
}

.btn-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.btn-remove:hover {
  transform: scale(1.2);
}

.add-participant {
  background: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.add-participant h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #5a3d2b;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #5a3d2b;
}

.prestation-select {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  background: white;
}

.checkbox-container {
  margin: 15px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.btn-add {
  background-color: #28a745;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
  transition: background-color 0.3s;
}

.btn-add:hover:not(:disabled) {
  background-color: #218838;
}

.btn-add:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.summary {
  background: #e8f4f8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.summary h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #5a3d2b;
  text-align: left;
}

.summary p {
  font-size: 1.05rem;
  margin: 8px 0;
  color: #333;
}

.reserve-button {
  background-color: #457b9d;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  padding: 14px 20px;
  border: none;
  border-radius: 6px;
  width: 100%;
  cursor: pointer;
  margin-bottom: 10px;
  transition: background-color 0.3s;
}

.reserve-button:hover:not(:disabled) {
  background-color: #376a88;
}

.reserve-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.back-button {
  background-color: #6c757d;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #5a6268;
}
</style>
