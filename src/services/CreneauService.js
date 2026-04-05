import api from './api';

// 📌 Récupérer les créneaux disponibles pour une date et une durée données
export const getCreneauxDisponibles = async (date, dureeMinutes) => {
  try {
    const response = await api.get('/creneaux', {
      params: {
        date: date,
        duree: dureeMinutes
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des créneaux disponibles', error);
    return [];
  }
};

// 📌 Récupérer la disponibilité d'un mois entier (batch)
export const getDisponibiliteMois = async (debut, fin, dureeMinutes) => {
  try {
    const response = await api.get('/creneaux/disponibilite-mois', {
      params: { debut, fin, duree: dureeMinutes }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement de la disponibilité du mois', error);
    return [];
  }
};