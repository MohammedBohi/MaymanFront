<template>
    <div class="confirmation-container">
      <h2>🎉 Réservation Confirmée !</h2>
      <p>Merci <strong>{{ reservation.nom }} {{ reservation.prenom }}</strong> !</p>
      
      <div class="reservation-details">
        <p><strong>Prestation :</strong> {{ reservation.prestation }}</p>
        <p><strong>Prix :</strong> {{ reservation.tarif }} €</p>
        <p><strong>Date :</strong> {{ formatDate(reservation.jour) }}</p>
        <p><strong>Heure :</strong> {{ reservation.creneau }}</p>
        <p><strong>Département :</strong> {{ reservation.departement }}</p>
      </div>
  
      <router-link to="/" class="home-button">Retour à l'accueil</router-link>
    </div>
  </template>
  
  <script>
  import { useRoute } from "vue-router";
  export default {
    setup() {
      const route = useRoute();

      const formatDate = (dateStr) => {
      if (!dateStr) return "Date inconnue";
      const date = new Date(dateStr);

      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    return {
      reservation: route.query,
      formatDate,
    };
  },
};
  </script>
  
  <style scoped>
  .confirmation-container {
    text-align: center;
    padding: 40px;
    background-color: #f8f3e7;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 50px auto;
  }
  
  .reservation-details {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    text-align: left;
    margin-top: 20px;
  }
  
  p {
    font-size: 16px;
    margin: 8px 0;
  }
  
  .home-button {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 24px;
    background-color: #d4a373;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: 0.3s;
  }
  
  .home-button:hover {
    background-color: #c58954;
  }
  </style>
  