<template>
  <div class="admin-prestations">
    <h1 v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">💇 Gestion des prestations</h1>
    <router-link to="/admin" class="back-btn">← Retour au menu admin</router-link>

    <!-- Formulaire modification uniquement -->
    <form v-if="isEditing" @submit.prevent="updatePrestation()" v-motion
          :initial="{ opacity: 0, x: -30 }"
          :enter="{ opacity: 1, x: 0, transition: { duration: 400 } }">
      <h3>✏️ Modifier une prestation</h3>
      <input v-model="form.nom" placeholder="Nom" required />
      <input type="number" v-model.number="form.duree_minutes" placeholder="Durée (min)" min="5" required />
      <input type="number" v-model.number="form.prix" placeholder="Prix (€)" step="0.01" required />
      <button type="submit">Mettre à jour</button>
      <button type="button" @click="resetForm">Annuler</button>
    </form>

    <!-- Tableau prestations -->
    <h3>📋 Prestations existantes</h3>
    <table v-motion
           :initial="{ opacity: 0, y: 20 }"
           :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Durée</th>
          <th>Prix (€)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(pres, idx) in prestations" :key="pres.id" v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { duration: 300, delay: 150 + idx * 50 } }">
          <td>{{ pres.nom }}</td>
          <td>{{ pres.duree_minutes }} min</td>
          <td>{{ pres.prix }} €</td>
          <td>
            <button @click="editPrestation(pres)">✏️ Modifier</button>
            <button @click="deletePrestation(pres.id)">🗑 Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      prestations: [],
      form: {
        nom: "",
        duree_minutes: 30,
        prix: 20,
      },
      isEditing: false,
      editId: null,
    };
  },
  methods: {
    async fetchPrestations() {
      try {
        const res = await api.get("/prestations");
        this.prestations = res.data;
      } catch (err) {
        console.error("Erreur chargement prestations :", err);
      }
    },
    editPrestation(pres) {
      this.form = {
        nom: pres.nom,
        duree_minutes: pres.duree_minutes,
        prix: pres.prix,
      };
      this.editId = pres.id;
      this.isEditing = true;
    },
    async updatePrestation() {
      try {
        await api.put(`/prestations/${this.editId}`, this.form);
        await this.fetchPrestations();
        this.resetForm();
        alert("✅ Prestation mise à jour !");
      } catch (err) {
        console.error("Erreur modification :", err);
      }
    },
    async deletePrestation(id) {
      if (!confirm("Supprimer cette prestation ?")) return;
      try {
        await api.delete(`/prestations/${id}`);
        await this.fetchPrestations();
        alert("🗑️ Prestation supprimée !");
      } catch (err) {
        console.error("Erreur suppression :", err);
      }
    },
    resetForm() {
      this.form = {
        nom: "",
        duree_minutes: 30,
        prix: 20,
      };
      this.editId = null;
      this.isEditing = false;
    },
  },
  mounted() {
    this.fetchPrestations();
  },
};
</script>

<style scoped>
.admin-prestations {
  padding: 30px;
  max-width: 950px;
  margin: auto;
  background-color: #f8f3e7;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  font-family: 'Segoe UI', sans-serif;
}

h1 {
  font-size: 1.8rem;
  color: #5a3d2b;
  text-align: center;
  margin-bottom: 20px;
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

form {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

form h3 {
  margin-bottom: 15px;
  color: #333;
}

input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 10px;
}

button {
  padding: 10px 16px;
  font-size: 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-right: 10px;
  margin-top: 10px;
}

button[type="submit"] {
  background-color: #d4a373;
  color: white;
  font-weight: bold;
}
button[type="submit"]:hover {
  background-color: #c58c58;
}

button[type="button"] {
  background-color: #ccc;
  color: #333;
}
button[type="button"]:hover {
  background-color: #bbb;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

th {
  background-color: #f1ebe1;
  color: #5a3d2b;
  font-weight: 600;
}

td button {
  margin: 0 5px;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
}

td button:first-child {
  background-color: #3498db;
  color: white;
}
td button:first-child:hover {
  background-color: #2e86c1;
}

td button:last-child {
  background-color: #e74c3c;
  color: white;
}
td button:last-child:hover {
  background-color: #c0392b;
}
</style>