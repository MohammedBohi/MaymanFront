<template>
  <div class="admin-dashboard">
    <h1 class="title">Bienvenue sur l'espace Admin</h1>

    <div class="grid">
      <router-link to="/admin/reservations" class="card card-reservation">
        📅 Réservations du jour
      </router-link>

      <router-link to="/admin/nouvelle-reservation" class="card card-ajout">
        ➕ Créer une réservation
      </router-link>

      <router-link to="/admin/indisponibilites" class="card card-indispo">
        ❌ Indisponibilités
      </router-link>

      <router-link to="/admin/plages-horaires" class="card card-horaires">
        🕒 Plages horaires
      </router-link>

      <router-link to="/admin/prestations" class="card card-prestations">
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
  transform: translateY(-4px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.1);
}

/* Couleurs personnalisées */
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