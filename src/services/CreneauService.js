import api from './api';

// Extrait le code département (2 chiffres) à partir d'un objet { code_postal, nom } (BDD)
// ou { codePostal } / { code } / d'une string brute.
const extractCodeDept = (departement) => {
  if (!departement) return undefined;
  if (typeof departement === 'string') return departement;
  if (departement.code_postal) return String(departement.code_postal).substring(0, 2);
  if (departement.codePostal) return String(departement.codePostal).substring(0, 2);
  if (departement.code) return String(departement.code);
  return undefined;
};

// Extrait le nom de la ville pour le clustering fin (ex: "Calvignac")
const extractVille = (departement) => {
  if (!departement || typeof departement === 'string') return undefined;
  return departement.nom || undefined;
};

// Ajoute ?departement= et ?ville= à un objet params selon le département reçu
const ajouterParamsDept = (params, departement) => {
  const codeDept = extractCodeDept(departement);
  const ville = extractVille(departement);
  if (codeDept) params.departement = codeDept;
  if (ville) params.ville = ville;
};

// 📌 Récupérer les créneaux disponibles pour une date et une durée données
export const getCreneauxDisponibles = async (date, dureeMinutes, departement) => {
  try {
    const params = { date, duree: dureeMinutes };
    ajouterParamsDept(params, departement);
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
    ajouterParamsDept(params, departement);
    const response = await api.get('/creneaux/disponibilite-mois', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement de la disponibilité du mois', error);
    return [];
  }
};