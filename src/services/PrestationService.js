import api from './api';

// 📌 Récupérer toutes les prestations
export const getPrestations = async () => {
  try {
    const response = await api.get('/prestations');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des prestations', error);
    return [];
  }
};

// 📌 Créer une nouvelle prestation
export const ajouterPrestation = async (prestation) => {
  try {
    const response = await api.post('/prestations', prestation);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l’ajout de la prestation', error);
    throw error;
  }
};

// 📌 Modifier une prestation existante
export const modifierPrestation = async (id, prestation) => {
  try {
    const response = await api.put(`/prestations/${id}`, prestation);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la modification de la prestation', error);
    throw error;
  }
};

// 📌 Supprimer une prestation
export const supprimerPrestation = async (id) => {
  try {
    const response = await api.delete(`/prestations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la prestation', error);
    throw error;
  }
};