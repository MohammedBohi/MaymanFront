import api from './api';

// 📌 Récupérer toutes les indisponibilités
export const getIndisponibilites = async () => {
  try {
    const response = await api.get('/indisponibilites');
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des indisponibilités", error);
    return [];
  }
};

// 📌 Ajouter une indisponibilité
export const ajouterIndisponibilite = async (indispo) => {
  try {
    const response = await api.post('/indisponibilites', indispo);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l’indisponibilité", error);
    throw error;
  }
};

// 📌 Supprimer une indisponibilité
export const supprimerIndisponibilite = async (id) => {
  try {
    const response = await api.delete(`/indisponibilites/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l’indisponibilité", error);
    throw error;
  }
};