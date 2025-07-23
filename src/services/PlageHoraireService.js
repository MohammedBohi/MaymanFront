import api from './api';

// 📌 Récupérer toutes les plages horaires personnalisées
// 📌 Récupérer la plage horaire d’un jour
export const getPlageHoraireDuJour = async (date) => {
  try {
    const response = await api.get('/plages-horaires/jour', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement de la plage horaire", error);
    return null;
  }
};

// 📌 Ajouter ou modifier une plage horaire pour un jour
export const ajouterOuModifierPlageHoraire = async (plage) => {
  try {
    const response = await api.post('/plages-horaires', plage);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l’ajout de la plage horaire", error);
    throw error;
  }
};

// 📌 Supprimer une plage horaire (remettre à défaut)
export const supprimerPlageHoraire = async (date) => {
  try {
    const response = await api.delete('/plages-horaires', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la plage horaire", error);
    throw error;
  }
};