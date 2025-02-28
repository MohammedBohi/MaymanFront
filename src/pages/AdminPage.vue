<template>
  <div class="admin-page">
    <div class="calendar-container">
      <v-calendar @dayclick="fetchReservations" />
    </div>

    <div class="table-container">
      <h2>Réservations pour {{ selectedDate || "aucune date sélectionnée" }}</h2>

      <table v-if="reservations.length > 0">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Prestation</th>
            <th>Prix (€)</th>
            <th>Statut</th>
            <th>Téléphone</th>
            <th>Adresse</th>
            <th>Département</th>
            <th>Créneau</th> 
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in reservations" :key="reservation.id">
            <td>{{ reservation.nom }}</td>
            <td>{{ reservation.prenom }}</td>
            <td>{{ reservation.prestation }}</td>
            <td>{{ reservation.tarif }}</td>
            <td>{{ reservation.typepaiement }}</td>
            <td>{{ reservation.telephone }}</td>
            <td>{{ reservation.adressereservation }}</td>
            <td>{{ reservation.departement }}</td>
            <td>{{ reservation.creneau }}</td>  
            <td>
              <button @click="supprimerReservation(reservation.id)" class="delete-btn">
                🗑 Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <p v-else class="no-reservations">Aucune réservation pour cette date.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      reservations: [], // Liste des réservations
      selectedDate: null, // Date sélectionnée
      apiBaseUrl: "http://localhost:3000/api/admin", // URL de l'API
      token: localStorage.getItem("token"), // Token JWT pour l'authentification
    };
  },
  computed: {
    // ✅ Trie les réservations par créneau en ordre croissant
    sortedReservations() {
      return this.reservations.sort((a, b) => {
        return a.creneau.localeCompare(b.creneau);
      });
    },
  },
  methods: {
    // 🔥 Récupérer les réservations pour une date sélectionnée
    async fetchReservations(day) {
      const localDate = new Date(day.date.getTime() - day.date.getTimezoneOffset() * 60000);
      this.selectedDate = localDate.toISOString().split("T")[0]; // ✅ Correction du problème de date

      try {
        const response = await axios.get(`${this.apiBaseUrl}/reservations/${this.selectedDate}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });

        this.reservations = response.data;
      } catch (error) {
        console.error("❌ Erreur lors du chargement :", error);
        alert("Erreur lors du chargement des réservations !");
      }
    },

    // 🔥 Supprimer une réservation
    async supprimerReservation(id) {
      if (!confirm("Voulez-vous vraiment supprimer cette réservation ?")) return;

      try {
        await axios.delete(`${this.apiBaseUrl}/reservations/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });

        // ⚡ Met à jour la liste immédiatement après suppression
        this.reservations = this.reservations.filter(reservation => reservation.id !== id);
        alert("✅ Réservation supprimée avec succès !");
      } catch (error) {
        console.error("❌ Erreur lors de la suppression :", error);
        alert("Erreur lors de la suppression !");
      }
    },
  },
};
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: row;
  padding: 20px;
}

/* ✅ Ajustement du calendrier */
.calendar-container {
  width: 40%;
  margin-right: 20px;
}

/* ✅ Ajustement de la table */
.table-container {
  width: 60%;
  overflow-x: auto;
  max-height: 600px;
}

/* ✅ Style du tableau */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px; /* Réduction de la taille du texte */
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #ddd;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.delete-btn {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 5px;
}

.delete-btn:hover {
  background-color: #cc0000;
}

/* ✅ Mode responsive pour mobile */
@media (max-width: 768px) {
  .admin-page {
    flex-direction: column; /* Passe en colonne */
    align-items: center;
  }

  .calendar-container {
    width: 90%; /* Agrandit le calendrier sur mobile */
    margin-bottom: 20px;
  }

  .table-container {
    width: 100%;
    overflow-x: auto;
    max-height: none;
  }

  /* ✅ Ajout d'un scroll horizontal si besoin */
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  th, td {
    padding: 6px;
    font-size: 12px; /* Réduction de la taille du texte */
  }

  .delete-btn {
    padding: 6px;
    font-size: 12px;
  }
}

</style>
