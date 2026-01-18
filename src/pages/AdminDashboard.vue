<template>
  <div class="admin-dashboard">
    <h1 class="title" v-motion
        :initial="{ opacity: 0, y: -30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      Bienvenue sur l'espace Admin
    </h1>

    <div class="grid">
      <router-link to="/admin/planning" class="card card-planning" v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 400, delay: 0 } }">
        🗓️ Gestion du planning
      </router-link>

      <router-link to="/admin/departements" class="card card-departements" v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 400, delay: 50 } }">
        📍 Gestion des départements
      </router-link>

      <router-link to="/admin/reservations" class="card card-reservation" v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 400, delay: 100 } }">
        📅 Réservations du jour
      </router-link>

      <router-link to="/admin/selection-prestation" class="card card-ajout" v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 400, delay: 150 } }">
        ➕ Créer une réservation
      </router-link>

      <router-link to="/admin/indisponibilites" class="card card-indispo" v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 400, delay: 200 } }">
        ❌ Indisponibilités
      </router-link>

      <router-link to="/admin/plages-horaires" class="card card-horaires" v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 400, delay: 250 } }">
        🕒 Plages horaires
      </router-link>

      <router-link to="/admin/prestations" class="card card-prestations" v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 400, delay: 250 } }">
        💇 Gérer les prestations
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminDashboard"
};
</script>

<style scoped>
.admin-dashboard {
  padding: 40px 20px;
  background-color: #f9f4ee;
  min-height: 100vh;
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

.title {
  font-size: 2.4rem;
  color: #5a3d2b;
  margin-bottom: 50px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 30px;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto;
}

.card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  border-radius: 16px;
  font-size: 1.3rem;
  font-weight: 600;
  text-decoration: none;
  color: white;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Couleurs personnalisées */
.card-planning {
  background: linear-gradient(135deg, #d4a373 0%, #b8915c 100%);
}
.card-departements {
  background: linear-gradient(135deg, #8e44ad 0%, #6c3483 100%);
}
.card-reservation {
  background-color: #6a994e;
}
.card-ajout {
  background-color: #386641;
}
.card-indispo {
  background-color: #bc4749;
}
.card-horaires {
  background-color: #f8961e;
}
.card-prestations {
  background-color: #457b9d;
}

@media (max-width: 600px) {
  .card {
    width: 100%;
    font-size: 1.1rem;
    height: 130px;
  }
}
</style>