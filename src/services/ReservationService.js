import api from './api';
import AuthService from './AuthService';

// 📌 Créer une réservation (Client ou Admin)
export const creerReservation = async (reservationData) => {
  try {
    const role = AuthService.getRole();

    const endpoint =
      role === 'Admin'
        ? '/admin/reservations'
        : '/reservations';

    const response = await api.post(endpoint, reservationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la réservation :', error);
    throw error;
  }
};

// 📌 Récupérer les réservations du client connecté
export const getMesReservations = async () => {
  try {
    const response = await api.get('/reservations/mes'); // ✅ correction ici
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations client :', error);
    return [];
  }
};

// 📌 Récupérer les détails d'une réservation (client)
export const getDetailsReservationClient = async (id) => {
  try {
    const response = await api.get(`/reservations/${id}`); // ✅ correction ici
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la réservation :", error);
    return null;
  }
};

// 📌 Déplacer une réservation (client) — seules la date et l'heure changent.
// Le backend refuse à moins de 24 h et renvoie alors un 403 avec le message à afficher.
export const modifierReservation = async (id, { jour, heure_debut }) => {
  const response = await api.put(`/reservations/${id}`, { jour, heure_debut });
  return response.data;
};

// 📌 Supprimer une réservation
export const supprimerReservation = async (id) => {
  try {
    const role = AuthService.getRole();

    const endpoint =
      role === 'Admin'
        ? `/admin/reservations/${id}`
        : `/reservations/${id}`;

    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation :', error);
    throw error;
  }
};