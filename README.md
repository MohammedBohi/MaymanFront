# May'Man — Frontend

SPA Vue 3 de l'application de réservation en ligne **maylissman.com** (salon de
coiffure indépendant). En production avec de vrais clients depuis février 2025.

🌐 **Site en ligne :** [maylissman.com](https://maylissman.com)
📦 **Repo backend :** [MohammedBohi/Mayman](https://github.com/MohammedBohi/Mayman)

## À propos

Premier projet pro de ma vie, livré et maintenu en production. Il n'est pas
parfait — j'ai appris en construisant. Mais c'est un vrai produit, utilisé par
de vrais clients, et il occupe une place à part dans mon parcours.

## Stack

- **Vue 3** (Options API)
- **Vue CLI 5** (Webpack)
- **Vue Router** + **Vuex**
- **Axios** (intercepteurs JWT + auto-logout sur expiration du token)
- **v-calendar** (sélection de créneaux)
- Déployé sur **Netlify**

## Fonctionnalités

- Tunnel de réservation (sélection prestation → date → créneau → confirmation)
- Calendrier dynamique des disponibilités, gérant 2 modes : **domicile** / **salon**
- Authentification complète : inscription, login, mot de passe oublié, reset, changement
- Espace admin : réservations, planning hebdomadaire, exceptions, indisponibilités, prestations, départements desservis

## Architecture

```
src/
├── pages/         # 22 pages (réservation, admin, auth)
├── components/    # Header, Foot
├── services/      # 7 services (1 par ressource API) + api.js
├── router/
└── main.js
```

## Démarrage local

**Prérequis :** Node.js 18+ et le backend lancé sur `http://localhost:3000`
([repo backend](https://github.com/MohammedBohi/Mayman)).

```bash
git clone https://github.com/MohammedBohi/MaymanFront.git
cd MaymanFront
npm install
cp .env.example .env.development   # éditer si besoin
npm run serve                       # http://localhost:8080
```

## Variables d'environnement

Voir `.env.example`. Une seule variable nécessaire :

| Variable | Description |
|---|---|
| `VUE_APP_API_BASE_URL` | URL de l'API backend (ex: `http://localhost:3000/api`) |

En production, la variable est configurée directement dans Netlify (pas dans le repo).

## Build

```bash
npm run build      # génère /dist
```

Le déploiement Netlify est automatique sur push vers `main`.
