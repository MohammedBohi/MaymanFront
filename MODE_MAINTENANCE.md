# 🚧 Mode Maintenance - Guide d'utilisation

## Comment activer/désactiver le mode maintenance ?

### 📍 Fichier à modifier
`frontend/src/pages/HomePage.vue`

### ⚙️ Configuration

Dans la section `data()` du fichier, vous trouverez cette ligne (environ ligne 82) :

```javascript
// ⚙️ MODE MAINTENANCE - Passez à true pour bloquer les réservations clients
modeMaintenanceActif: false,
```

### ✅ Pour ACTIVER le mode maintenance
Changez `false` en `true` :

```javascript
modeMaintenanceActif: true,
```

**Effet :**
- ✅ Une grande bannière rouge apparaît en haut de la page d'accueil
- ✅ Tous les boutons "Réserver" deviennent gris et affichent "Indisponible"
- ✅ Si un client clique quand même, une alerte bloque la réservation
- ✅ Vous pouvez continuer à tester via l'admin (non affecté)

### ✅ Pour DÉSACTIVER le mode maintenance
Changez `true` en `false` :

```javascript
modeMaintenanceActif: false,
```

**Effet :**
- La bannière disparaît
- Les boutons "Réserver" redeviennent normaux
- Les clients peuvent à nouveau réserver

---

## 🔧 Déploiement des changements

Après avoir modifié la valeur :

### 1. Build le projet
```bash
cd frontend
npm run build
```

### 2. Commit et push
```bash
git add .
git commit -m "Activer mode maintenance" # ou "Désactiver mode maintenance"
git push
```

### 3. Déploiement automatique
Netlify va automatiquement déployer les changements en quelques minutes.

---

## 💡 Cas d'usage

**Activer le mode maintenance quand :**
- Vous testez de nouvelles fonctionnalités
- Vous faites des modifications dans la base de données
- Le système de paiement est indisponible
- Vous devez effectuer une maintenance urgente

**Le garder désactivé quand :**
- Tout fonctionne normalement
- Vous voulez que les clients puissent réserver

---

## 📝 Note importante

⚠️ **L'admin peut toujours accéder aux réservations** via :
- `/admin/dashboard` → Créer une nouvelle réservation
- Le mode maintenance ne bloque QUE les clients sur la page d'accueil publique

Cela vous permet de **tester les réservations en tant qu'admin** pendant que le mode maintenance est actif pour les clients.
