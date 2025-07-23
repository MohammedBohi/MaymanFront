import api from './api';

// 📌 Récupérer les réservations d’un jour spécifique (Admin)
export const getReservationsParJour = async (date) => {
  try {
    const response = await api.get('/admin/reservations', {
      params: { jour: date }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations du jour (Admin)', error);
    return [];
  }
};

// 📌 Récupérer les détails complets d'une réservation (Admin)
export const getDetailsReservationAdmin = async (reservationId) => {
  try {
    const response = await api.get(`/admin/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails (Admin)', error);
    return null;
  }
};

// 📌 Supprimer une réservation en tant qu'Admin
export const supprimerReservationAdmin = async (reservationId) => {
  try {
    const response = await api.delete(`/admin/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation (Admin)', error);
    throw error;
  }
};