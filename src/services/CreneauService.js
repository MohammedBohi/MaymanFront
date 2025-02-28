import api from './api';

// 📌 Récupérer les créneaux disponibles pour une date donnée
export const getCreneauxDispo = async (date) => {
  try {
    const response = await api.get(`/api/reservations/creneaux/${date}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des créneaux', error);
    return [];
  }
};
