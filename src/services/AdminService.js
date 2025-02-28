import api from './api';

// 📌 Récupérer toutes les réservations pour l'Admin
export const getToutesReservations = async () => {
  try {
    const response = await api.get('/admin/reservations');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations (Admin)', error);
    return [];
  }
};

// 📌 Annuler une réservation en tant qu'Admin
export const annulerReservationAdmin = async (reservationId) => {
  try {
    await api.delete(`/admin/reservations/${reservationId}`);
    return { message: 'Réservation annulée avec succès par l’Admin.' };
  } catch (error) {
    console.error('Erreur lors de l’annulation de la réservation (Admin)', error);
    throw error;
  }
};
    