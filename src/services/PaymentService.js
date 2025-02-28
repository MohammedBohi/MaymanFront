import api from './api';

// 📌 Initier un paiement en ligne avec Stripe
export const initierPaiement = async (reservationData) => {
  try {
    const response = await api.post('/paiement/initier', reservationData);
    return response.data.clientSecret;
  } catch (error) {
    console.error('Erreur lors de l’initiation du paiement', error);
    throw error;
  }
};

// 📌 Vérifier le statut du paiement et confirmer la réservation
export const verifierPaiement = async (paymentIntentId) => {
  try {
    const response = await api.get(`/paiement/statut/${paymentIntentId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement', error);
    return null;
  }
};
