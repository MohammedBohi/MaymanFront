<template>
  <div class="mes-reservations">
    <h2>📖 Mes réservations</h2>

    <p v-if="chargement" class="etat">Chargement de vos réservations...</p>

    <p v-else-if="!reservations.length" class="etat">
      Vous n'avez encore aucune réservation.
      <router-link to="/" class="lien-reserver">Prendre rendez-vous</router-link>
    </p>

    <template v-else>
      <!-- À VENIR -->
      <section v-if="aVenir.length">
        <h3 class="titre-section">À venir</h3>
        <div v-for="r in aVenir" :key="r.id" class="carte" v-motion
             :initial="{ opacity: 0, y: 10 }"
             :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }">
          <div class="carte-entete">
            <span class="date">{{ formatJour(r.jour_iso) }}</span>
            <span class="badge" :class="r.mode === 'SALON' ? 'badge-salon' : 'badge-domicile'">
              {{ r.mode === 'SALON' ? '🏠 Au salon' : '🚗 À domicile' }}
            </span>
          </div>

          <p class="horaire">🕒 {{ heure(r.heure_debut) }} → {{ heureFin(r) }}</p>
          <p>✂️ {{ listePrestations(r) }}</p>
          <p v-if="r.mode === 'DOMICILE'">📍 {{ r.adressereservation }}</p>
          <p class="tarif">💰 {{ r.tarif }} €</p>

          <div class="actions">
            <button class="btn-modifier" :disabled="!r.modifiable" @click="ouvrirDeplacement(r)">
              Déplacer
            </button>
            <button class="btn-annuler" :disabled="!r.modifiable" @click="confirmerAnnulation(r)">
              Annuler
            </button>
          </div>

          <p v-if="!r.modifiable" class="note-delai">
            ⏳ Les modifications en ligne sont possibles jusqu'à 24 h avant le rendez-vous.
            Pour un changement de dernière minute, appelez directement le salon.
          </p>
        </div>
      </section>

      <!-- PASSÉES -->
      <section v-if="passees.length">
        <h3 class="titre-section">Passées</h3>
        <div v-for="r in passees" :key="r.id" class="carte carte-passee">
          <div class="carte-entete">
            <span class="date">{{ formatJour(r.jour_iso) }}</span>
            <span class="badge badge-passe">Terminé</span>
          </div>
          <p class="horaire">🕒 {{ heure(r.heure_debut) }}</p>
          <p>✂️ {{ listePrestations(r) }}</p>
          <p class="tarif">💰 {{ r.tarif }} €</p>
        </div>
      </section>
    </template>

    <!-- MODALE DE DÉPLACEMENT -->
    <div v-if="deplacement.reservation" class="modale-fond" @click.self="fermerDeplacement">
      <div class="modale">
        <h3>Déplacer le rendez-vous</h3>
        <p class="modale-actuel">
          Actuellement : <strong>{{ formatJour(deplacement.reservation.jour_iso) }}</strong>
          à <strong>{{ heure(deplacement.reservation.heure_debut) }}</strong>
        </p>

        <p v-if="deplacement.chargementDates" class="etat">Recherche des dates disponibles...</p>

        <template v-else>
          <label>Nouvelle date</label>
          <select v-model="deplacement.date" @change="chargerCreneaux" class="champ">
            <option :value="null" disabled>Choisissez une date</option>
            <option v-for="d in deplacement.datesDispo" :key="d" :value="d">
              {{ formatJour(d) }}
            </option>
          </select>
          <p v-if="!deplacement.datesDispo.length" class="etat">
            Aucune date disponible dans les deux prochains mois pour ce type de prestation.
          </p>

          <template v-if="deplacement.date">
            <label>Nouveau créneau</label>
            <p v-if="deplacement.chargementCreneaux" class="etat">Chargement des créneaux...</p>
            <div v-else-if="deplacement.creneaux.length" class="creneaux">
              <button
                v-for="c in deplacement.creneaux"
                :key="c"
                class="creneau"
                :class="{ actif: c === deplacement.slot }"
                @click="deplacement.slot = c"
              >{{ c }}</button>
            </div>
            <p v-else class="etat">Aucun créneau libre ce jour-là.</p>
          </template>
        </template>

        <p v-if="deplacement.erreur" class="erreur">{{ deplacement.erreur }}</p>

        <div class="modale-actions">
          <button class="btn-secondaire" @click="fermerDeplacement">Annuler</button>
          <button
            class="btn-modifier"
            :disabled="!deplacement.slot || deplacement.envoiEnCours"
            @click="validerDeplacement"
          >
            {{ deplacement.envoiEnCours ? 'Enregistrement...' : 'Confirmer le déplacement' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { getMesReservations, modifierReservation, supprimerReservation } from "@/services/ReservationService";
import { getCreneauxDisponibles, getDisponibiliteMois } from "@/services/CreneauService";
import { getPrestations } from "@/services/PrestationService";

const reservations = ref([]);
const prestationsParId = ref({});
const chargement = ref(true);

// Date du jour au format YYYY-MM-DD, calculée en heure locale (surtout pas
// toISOString(), qui bascule en UTC et fait basculer de jour en soirée).
const formatISO = (d) =>
  d.getFullYear() + "-" +
  String(d.getMonth() + 1).padStart(2, "0") + "-" +
  String(d.getDate()).padStart(2, "0");

const aujourdhui = formatISO(new Date());

const aVenir = computed(() => reservations.value.filter(r => r.jour_iso >= aujourdhui));
// Les plus récentes d'abord : l'API trie par date croissante, on inverse ici.
const passees = computed(() =>
  reservations.value.filter(r => r.jour_iso < aujourdhui).slice().reverse()
);

const deplacement = reactive({
  reservation: null,
  datesDispo: [],
  date: null,
  creneaux: [],
  slot: null,
  chargementDates: false,
  chargementCreneaux: false,
  envoiEnCours: false,
  erreur: null,
});

const charger = async () => {
  chargement.value = true;
  const [resas, prestations] = await Promise.all([getMesReservations(), getPrestations()]);
  reservations.value = resas || [];
  prestationsParId.value = Object.fromEntries((prestations || []).map(p => [p.id, p.nom]));
  chargement.value = false;
};

onMounted(charger);

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const formatJour = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + 'T12:00:00');
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
};

const heure = (h) => String(h || "").substring(0, 5);

// Durée des prestations seules, sans le battement de trajet : c'est l'horaire de fin
// que le client a validé au moment de réserver (ConfirmationReservation affiche la
// même base). Avec duree_totale_minutes, un rendez-vous à domicile paraîtrait 20 min
// plus long qu'il ne l'est.
const heureFin = (r) => {
  const [h, m] = String(r.heure_debut).split(':').map(Number);
  const fin = h * 60 + m + (r.duree_prestations ?? r.duree_totale_minutes);
  return `${String(Math.floor(fin / 60)).padStart(2, '0')}:${String(fin % 60).padStart(2, '0')}`;
};

const listePrestations = (r) => {
  const noms = (r.personnes || []).map(p => {
    const nom = prestationsParId.value[p.prestation_id] || "Prestation";
    return p.avec_soin ? `${nom} + soin` : nom;
  });
  return noms.length ? noms.join(', ') : `${r.nb_personnes} personne(s)`;
};

// ── Déplacement ───────────────────────────────────────────────────────────────

const ouvrirDeplacement = async (r) => {
  Object.assign(deplacement, {
    reservation: r, datesDispo: [], date: null, creneaux: [], slot: null,
    chargementDates: true, chargementCreneaux: false, envoiEnCours: false, erreur: null,
  });

  const debut = formatISO(new Date());
  const now = new Date();
  const fin = formatISO(new Date(now.getFullYear(), now.getMonth() + 2, 0));

  const dispos = await getDisponibiliteMois(
    debut, fin, r.duree_prestations, departementDe(r), r.id
  );

  // On ne propose que les jours du même mode : passer du salon au domicile change
  // l'adresse et le tarif, le backend le refuse et renvoie vers « annuler / reréserver ».
  deplacement.datesDispo = (dispos || [])
    .filter(d => d.disponible && d.mode === r.mode)
    .map(d => d.date);
  deplacement.chargementDates = false;
};

// Le backend attend { code_postal, nom } pour appliquer la règle de clustering.
const departementDe = (r) =>
  r.mode === 'DOMICILE' && r.departement
    ? { code_postal: r.departement, nom: r.ville || undefined }
    : null;

const chargerCreneaux = async () => {
  const r = deplacement.reservation;
  if (!r || !deplacement.date) return;
  deplacement.slot = null;
  deplacement.erreur = null;
  deplacement.chargementCreneaux = true;
  const creneaux = await getCreneauxDisponibles(
    deplacement.date, r.duree_prestations, departementDe(r), r.id
  );
  // Dédoublonnage : le lundi porte deux plages horaires qui se recouvrent
  // (16:00-19:15 et 14:00-19:30 en base), donc l'API peut renvoyer deux fois
  // le même horaire — ce qui casserait les :key du v-for.
  deplacement.creneaux = [...new Set(creneaux || [])];
  deplacement.chargementCreneaux = false;
};

const fermerDeplacement = () => {
  deplacement.reservation = null;
};

const validerDeplacement = async () => {
  if (deplacement.envoiEnCours) return;
  deplacement.envoiEnCours = true;
  deplacement.erreur = null;

  try {
    await modifierReservation(deplacement.reservation.id, {
      jour: deplacement.date,
      heure_debut: deplacement.slot,
    });
    fermerDeplacement();
    await charger();
    alert("✅ Votre rendez-vous a bien été déplacé. Un email de confirmation vous a été envoyé.");
  } catch (e) {
    // Le backend est seul juge : créneau pris entre-temps, délai de 24 h dépassé,
    // secteur non desservi ce jour-là... on affiche son message tel quel.
    deplacement.erreur = e?.response?.data?.error || "Une erreur est survenue, veuillez réessayer.";
    if (deplacement.date) await chargerCreneaux();
  } finally {
    deplacement.envoiEnCours = false;
  }
};

// ── Annulation ────────────────────────────────────────────────────────────────

const confirmerAnnulation = async (r) => {
  const ok = window.confirm(
    `Annuler définitivement votre rendez-vous du ${formatJour(r.jour_iso)} à ${heure(r.heure_debut)} ?`
  );
  if (!ok) return;

  try {
    await supprimerReservation(r.id);
    await charger();
    alert("Votre réservation a bien été annulée.");
  } catch (e) {
    alert(e?.response?.data?.error || "Erreur lors de l'annulation.");
  }
};
</script>

<style scoped>
.mes-reservations {
  max-width: 800px;
  margin: 30px auto;
  padding: 30px;
  background-color: #f8f3e7;
  border-radius: 12px;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  color: #5a3d2b;
  margin-top: 0;
}

.titre-section {
  color: #5a3d2b;
  border-bottom: 2px solid #e6d5bc;
  padding-bottom: 6px;
  margin-top: 30px;
}

.etat {
  color: #7b5b2f;
  font-style: italic;
  text-align: center;
  padding: 15px;
}

.lien-reserver {
  display: block;
  margin-top: 10px;
  color: #c58954;
  font-weight: 600;
}

.carte {
  background: white;
  border-radius: 8px;
  padding: 18px 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.carte p {
  margin: 6px 0;
  color: #444;
}

.carte-passee {
  opacity: 0.65;
}

.carte-entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.date {
  font-weight: 700;
  color: #5a3d2b;
  font-size: 1.05rem;
  text-transform: capitalize;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-salon { background: #ede0ff; color: #6b3fa0; }
.badge-domicile { background: #d6f5e6; color: #1e7a47; }
.badge-passe { background: #eee; color: #777; }

.horaire { font-weight: 600; }
.tarif { font-weight: 600; color: #5a3d2b; }

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.actions button {
  flex: 1 1 140px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-modifier { background-color: #d4a373; color: white; }
.btn-modifier:hover:not(:disabled) { background-color: #c58954; }

.btn-annuler { background-color: #fff; color: #b33; border: 1.5px solid #e0a9a9 !important; }
.btn-annuler:hover:not(:disabled) { background-color: #fdf0f0; }

.btn-secondaire { background-color: #eee; color: #333; }

.actions button:disabled,
.modale-actions button:disabled {
  background-color: #ddd;
  color: #888;
  border-color: #ddd !important;
  cursor: not-allowed;
}

.note-delai {
  margin-top: 12px !important;
  font-size: 0.88rem;
  color: #7b5b2f;
  background: #fdf5e6;
  border-left: 3px solid #f3d9b1;
  padding: 10px 12px;
  border-radius: 4px;
}

/* Modale */
.modale-fond {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modale {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  width: 100%;
  max-width: 460px;
  max-height: 85vh;
  overflow-y: auto;
}

.modale h3 { margin-top: 0; color: #5a3d2b; }

.modale-actuel {
  background: #fdf9f1;
  border-left: 4px solid #d4a373;
  padding: 10px 12px;
  border-radius: 4px;
  color: #5a3d2b;
}

.modale label {
  display: block;
  margin-top: 18px;
  margin-bottom: 6px;
  font-weight: 600;
  color: #5a3d2b;
}

.champ {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
}

.creneaux {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.creneau {
  padding: 10px 16px;
  background-color: #f0e6d8;
  border: none;
  border-radius: 6px;
  color: #5a3d2b;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
}

.creneau.actif {
  background-color: #d4a373;
  color: white;
  box-shadow: 0 0 0 3px rgba(197, 137, 84, 0.3);
}

.erreur {
  margin-top: 15px;
  color: #b33;
  background: #fdf0f0;
  border-left: 3px solid #e0a9a9;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.92rem;
}

.modale-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.modale-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 600px) {
  .mes-reservations { padding: 18px; margin: 15px auto; }
  .actions button { flex: 1 1 100%; }
}
</style>
