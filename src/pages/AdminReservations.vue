<template>
  <div class="admin-reservations">
    <h1 v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">📅 Réservations du jour</h1>
    <router-link to="/admin" class="back-btn">← Retour au menu admin</router-link>

    <v-calendar @dayclick="onDayClick" />

    <h3 v-if="selectedDate" v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0, transition: { duration: 400 } }">Réservations du {{ selectedDate }}</h3>

    <table v-if="reservations.length > 0" class="styled-table" v-motion
           :initial="{ opacity: 0, y: 20 }"
           :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }">
      <thead>
        <tr>
          <th>Client</th>
          <th>Heure</th>
          <th>Durée</th>
          <th>Mode</th>
          <th>Département</th>
          <th>Personnes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(resa, idx) in reservations" :key="resa.id" v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { duration: 300, delay: 150 + idx * 50 } }">
          <td>{{ resa.nom }} {{ resa.prenom }}</td>
          <td>{{ resa.heure_debut }}</td>
          <td>{{ convertirDuree(resa.duree_totale_minutes) }}</td>
          <td>{{ afficherMode(resa.mode) }}</td>
          <td>{{ afficherDepartement(resa.departement, resa.mode) }}</td>
          <td>{{ resa.nombre_personnes }}</td>
          <td>
            <button @click="voirDetails(resa)">👁️ Détails</button>
            <button @click="supprimerReservation(resa.id)" class="delete-btn">🗑 Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else class="no-data">Aucune réservation pour cette date.</p>

    <!-- ✅ Modale de détails -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content" v-motion
           :initial="{ opacity: 0, scale: 0.9 }"
           :enter="{ opacity: 1, scale: 1, transition: { duration: 300 } }">
        <h3>Détails de la réservation</h3>
        <p><strong>Client :</strong> {{ detail.nom }} {{ detail.prenom }}</p>
        <p><strong>Téléphone :</strong> {{ detail.telephone }}</p>
        <p><strong>Mode :</strong> {{ afficherMode(detail.mode) }}</p>
        <p v-if="detail.mode === 'SALON'"><strong>Lieu :</strong> Salon May'Man - 176 Route de Montauban, 12200 Villefranche-de-Rouergue</p>
        <template v-else>
          <p><strong>Adresse client :</strong> {{ detail.adressereservation }}</p>
          <p><strong>Département :</strong> {{ afficherDepartement(detail.departement, detail.mode) }}</p>
        </template>
        <p><strong>Heure :</strong> {{ detail.heure_debut }} → {{ calculHeureFin(detail.heure_debut, detail.duree_totale_minutes) }}</p>

        <h4>Participants :</h4>
        <ul>
          <li v-for="(p, i) in detail.personnes" :key="i">
            👤 {{ p.nom }} {{ p.prenom }} — {{ p.nom_prestation }}
            <span v-if="p.avec_soin">(+ soin)</span> : {{ calculPrix(p) }} €
          </li>
        </ul>

        <p><strong>💰 Tarif total :</strong> {{ calculTotal(detail.personnes) }} €</p>

        <button @click="showModal = false" class="close-btn">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      selectedDate: null,
      reservations: [],
      showModal: false,
      detail: null,
    };
  },
  methods: {
    async onDayClick(day) {
      const localDate = new Date(day.date.getTime() - day.date.getTimezoneOffset() * 60000);
      this.selectedDate = localDate.toISOString().split("T")[0];
      await this.fetchReservations();
    },
    async fetchReservations() {
      try {
        const res = await api.get(`/admin/reservations?jour=${this.selectedDate}`);
        this.reservations = res.data;
      } catch (err) {
        console.error("Erreur récupération réservations :", err);
      }
    },
    afficherDepartement(dep, mode) {
      // Pour SALON, pas de département
      if (mode === 'SALON') return '🏛️ Salon';
      
      // Pour DOMICILE : afficher le code (46 ou 82)
      if (!dep) return '—';
      
      // Si c'est un string (simple code)
      if (typeof dep === 'string') {
        if (/^\d{2}$/.test(dep)) return dep; // code simple "46"
        // Sinon, essayer de parser comme JSON
        try {
          const obj = JSON.parse(dep);
          return obj.code || obj.codePostal?.substring(0, 2) || '—';
        } catch {
          return dep;
        }
      }
      
      // Si c'est un objet
      if (dep && typeof dep === 'object') {
        return dep.code || dep.codePostal?.substring(0, 2) || '—';
      }
      
      return '—';
    },
    afficherMode(mode) {
      if (mode === 'SALON') return '🏛️ Salon';
      if (mode === 'DOMICILE') return '🏠 Domicile';
      return '—';
    },
    convertirDuree(minutes) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return h > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${m} min`;
    },
    calculHeureFin(debut, duree) {
      const [h, m] = debut.split(":").map(Number);
      const total = h * 60 + m + duree;
      const finH = String(Math.floor(total / 60)).padStart(2, "0");
      const finM = String(total % 60).padStart(2, "0");
      return `${finH}:${finM}`;
    },
    async voirDetails(resa) {
      try {
        const res = await api.get(`/admin/reservations/${resa.id}`);
        this.detail = res.data;
        this.showModal = true;
      } catch (err) {
        console.error("Erreur détails réservation :", err);
      }
    },
    calculPrix(p) {
      try {
        const prix = parseFloat(p.prix || 0);
        return (prix + (p.avec_soin ? 10 : 0)).toFixed(2);
      } catch {
        return "—";
      }
    },
    calculTotal(personnes) {
      return personnes.reduce((total, p) => {
        const prix = parseFloat(p.prix || 0);
        return total + prix + (p.avec_soin ? 10 : 0);
      }, 0).toFixed(2);
    },
    async supprimerReservation(id) {
      if (!confirm("Confirmer la suppression ?")) return;
      try {
        await api.delete(`/admin/reservations/${id}`);
        this.fetchReservations();
      } catch (err) {
        console.error("Erreur suppression :", err);
      }
    },
  },
};
</script>

<style scoped>
.admin-reservations {
  padding: 40px 20px;
  max-width: 1100px;
  margin: auto;
  background-color: #f9f4ee;
  font-family: 'Segoe UI', sans-serif;
}

h1 {
  font-size: 2rem;
  color: #5a3d2b;
  margin-bottom: 20px;
  text-align: center;
}

.back-btn {
  display: inline-block;
  margin: 0 0 20px;
  padding: 8px 14px;
  background-color: #d4a373;
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  float: left;
}

.back-btn:hover {
  background-color: #c78d56;
}


.styled-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 25px;
}

.styled-table th {
  background-color: #d4a373;
  color: white;
  padding: 12px;
  text-align: center;
}

.styled-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: center;
  font-size: 0.95rem;
}

button {
  padding: 8px 14px;
  border: none;
  background-color: #457b9d;
  color: white;
  cursor: pointer;
  border-radius: 6px;
  margin: 2px;
  font-weight: 500;
  font-size: 0.9rem;
}

button.delete-btn {
  background-color: #e76f51;
}

button:hover {
  opacity: 0.9;
}

.no-data {
  text-align: center;
  margin-top: 20px;
  font-style: italic;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.close-btn {
  background-color: #6c757d;
  margin-top: 20px;
}
</style>