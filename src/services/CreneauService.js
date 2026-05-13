import api from './api';

// Extrait le code département (2 chiffres) à partir d'un objet { code, nom, codePostal } ou d'une string
const extractCodeDept = (departement) => {
  if (!departement) return undefined;
  if (typeof departement === 'string') return departement;
  if (departement.codePostal) return String(departement.codePostal).substring(0, 2);
  if (departement.code) return String(departement.code);
  return undefined;
};

// 📌 Récupérer les créneaux disponibles pour une date et une durée données
export const getCreneauxDisponibles = async (date, dureeMinutes, departement) => {
  try {
    const params = { date, duree: dureeMinutes };
    const codeDept = extractCodeDept(departement);
    if (codeDept) params.departement = codeDept;
    const response = await api.get('/creneaux', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des créneaux disponibles', error);
    return [];
  }
};

// 📌 Récupérer la disponibilité d'un mois entier (batch)
export const getDisponibiliteMois = async (debut, fin, dureeMinutes, departement) => {
  try {
    const params = { debut, fin, duree: dureeMinutes };
    const codeDept = extractCodeDept(departement);
    if (codeDept) params.departement = codeDept;
    const response = await api.get('/creneaux/disponibilite-mois', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement de la disponibilité du mois', error);
    return [];
  }
};