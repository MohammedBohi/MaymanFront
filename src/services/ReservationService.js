import api from './api';

// 📌 Réserver SUR PLACE
export const reserverSurPlace = async (reservationData) => {
  try {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la réservation sur place', error);
    throw error;
  }
};

// 📌 Récupérer les réservations d’un jour
export const getReservationsByDate = async (date) => {
  try {
    const response = await api.get(`/reservations/${date}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations', error);
    return [];
  }
};

// 📌 Annuler une réservation (Client)
export const annulerReservation = async (reservationId) => {
  try {
    await api.delete(`/reservations/${reservationId}`);
    return { message: 'Réservation annulée avec succès.' };
  } catch (error) {
    console.error('Erreur lors de l’annulation de la réservation', error);
    throw error;
  }
};
