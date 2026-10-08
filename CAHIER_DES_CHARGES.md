# Cahier des charges — AGRIMAC

**Version :** 1.0  
**Date :** 19 septembre 2026  
**Statut :** intégration techniquement stable avec limitations backend documentées

## 1. Présentation

AGRIMAC est une plateforme agricole multi-rôles destinée à mettre en relation les agriculteurs, les entreprises, les maintenanciers et les administrateurs.

La plateforme couvre notamment :

- la recherche de matériel, produits et services agricoles ;
- la publication et le suivi de demandes de réparation ;
- les devis et commandes ;
- les interventions de maintenance ;
- les paiements ;
- les notifications ;
- la messagerie temps réel ;
- les avis et évaluations ;
- la modération et l’administration de la plateforme ;
- le scraping contrôlé de sources agricoles autorisées.

## 2. Objectifs

Le projet doit fournir :

- une interface web responsive et premium ;
- des parcours distincts pour chaque rôle ;
- des données provenant du backend authentifié ;
- des actions métier persistées par API ;
- une gestion stricte des permissions ;
- des états loading, erreur, vide, retry et succès ;
- aucune donnée métier fictive dans les routes actives ;
- une cohérence visuelle avec les maquettes AGRIMAC officielles.

## 3. Périmètre fonctionnel

### 3.1 Agriculteur

Le rôle Agriculteur doit pouvoir :

- consulter son tableau de bord ;
- rechercher des produits, machines et services ;
- publier et suivre des demandes ;
- consulter ses demandes ;
- consulter les devis et réponses ;
- consulter les paiements ;
- gérer ses favoris lorsque l’API est disponible ;
- recevoir et consulter ses notifications ;
- utiliser la messagerie ;
- consulter et publier des avis liés à une cible réelle ;
- gérer son profil et ses préférences.

Les coordonnées GPS ne doivent être affichées que lorsqu’elles sont réellement retournées par l’API.

### 3.2 Entreprise

Le rôle Entreprise doit pouvoir :

- consulter son tableau de bord ;
- gérer ses produits ;
- gérer ses services ;
- consulter les commandes ;
- modifier les statuts de commandes via API ;
- répondre aux demandes de devis ;
- consulter ses statistiques ;
- télécharger le rapport PDF lorsqu’il est fourni par le backend ;
- recevoir ses notifications ;
- utiliser la messagerie ;
- gérer son profil et ses paramètres.

Les actions sans endpoint, notamment export spécialisé, suppression non supportée ou séries temporelles absentes, doivent être désactivées explicitement.

### 3.3 Maintenancier

Le rôle Maintenancier doit pouvoir :

- consulter son Dashboard KPI ;
- consulter et accepter les demandes accessibles dans ses zones ;
- créer et suivre des devis ;
- créer et gérer des interventions ;
- consulter son historique ;
- gérer son profil et ses préférences ;
- gérer ses zones et disponibilités ;
- consulter ses notifications ;
- utiliser la messagerie REST et Socket.IO ;
- consulter les avis reçus ;
- consulter le calendrier construit à partir des interventions ;
- consulter les statistiques agrégées.

Les limitations restantes incluent les réponses aux avis, la recherche de participants, les coordonnées GPS des zones et les séries temporelles statistiques.

### 3.4 Administrateur

Le rôle Administrateur doit pouvoir :

- consulter le Dashboard global ;
- gérer les utilisateurs ;
- gérer les entreprises ;
- gérer les maintenanciers ;
- gérer les agriculteurs ;
- modérer les annonces et produits ;
- consulter et traiter les signalements ;
- consulter les journaux d’audit ;
- consulter les statistiques globales ;
- consulter les rapports dans un état contrôlé si l’API est absente ;
- consulter les paramètres système dans un état contrôlé si l’API est absente ;
- gérer les sources de scraping, runs, erreurs et machines importées.

## 4. Routes principales

### 4.1 Agriculteur

- `/dashboard/agriculteur`
- `/dashboard/agriculteur/rechercher`
- `/dashboard/agriculteur/demandes`
- `/dashboard/agriculteur/paiements`
- `/dashboard/agriculteur/avis`
- `/dashboard/agriculteur/favoris`
- `/dashboard/agriculteur/notifications`
- `/dashboard/agriculteur/messagerie`
- `/dashboard/agriculteur/profil`
- `/dashboard/agriculteur/parametres`

### 4.2 Entreprise

- `/dashboard/entreprise`
- `/dashboard/entreprise/produits`
- `/dashboard/entreprise/services`
- `/dashboard/entreprise/catalogue`
- `/dashboard/entreprise/commandes`
- `/dashboard/entreprise/devis`
- `/dashboard/entreprise/statistiques`
- `/dashboard/entreprise/rapports`
- `/dashboard/entreprise/notifications`
- `/dashboard/entreprise/messagerie`
- `/dashboard/entreprise/profil`
- `/dashboard/entreprise/parametres`

### 4.3 Maintenancier

- `/dashboard/maintenancier`
- `/dashboard/maintenancier/demandes`
- `/dashboard/maintenancier/devis`
- `/dashboard/maintenancier/interventions`
- `/dashboard/maintenancier/historique`
- `/dashboard/maintenancier/profil`
- `/dashboard/maintenancier/parametres`
- `/dashboard/maintenancier/zones`
- `/dashboard/maintenancier/disponibilites`
- `/dashboard/maintenancier/notifications`
- `/dashboard/maintenancier/messagerie`
- `/dashboard/maintenancier/avis`
- `/dashboard/maintenancier/calendrier`
- `/dashboard/maintenancier/statistiques`

### 4.4 Administrateur

- `/dashboard/administrateur`
- `/dashboard/administrateur/utilisateurs`
- `/dashboard/administrateur/entreprises`
- `/dashboard/administrateur/maintenanciers`
- `/dashboard/administrateur/agriculteurs`
- `/dashboard/administrateur/annonces`
- `/dashboard/administrateur/categories`
- `/dashboard/administrateur/signalements`
- `/dashboard/administrateur/journaux`
- `/dashboard/administrateur/statistiques`
- `/dashboard/administrateur/rapports`
- `/dashboard/administrateur/parametres`
- `/dashboard/administrateur/scraping`

## 5. Architecture technique

### Frontend

- React.
- React Router.
- Vite.
- Lucide React pour les icônes.
- Leaflet/OpenStreetMap pour la cartographie.
- Socket.IO client pour la messagerie temps réel.
- Client HTTP centralisé dans `app/src/api/client.js`.
- Ressources API centralisées dans `app/src/api/resources.js`.

### Backend

- NestJS.
- Prisma ORM.
- PostgreSQL.
- JWT.
- Guards de rôles.
- Socket.IO pour la messagerie.
- Services métiers séparés par domaine.
- DTO validés par `class-validator`.

### Organisation des composants

Les variantes `Connected` constituent les composants actifs raccordés aux APIs. Les variantes `Action`, `Real`, `Premium` et `Workspace` peuvent rester présentes comme legacy lorsqu’elles ne sont plus rendues par les routes officielles.

## 6. APIs principales

### Authentification

- Connexion par téléphone/e-mail selon le contrat actif.
- OTP.
- Récupération de mot de passe.
- Refresh token.
- Logout backend.
- Accès protégé par JWT.

### Utilisateurs et préférences

- `GET /users/me`
- `PATCH /users/me`
- `GET /users/me/preferences`
- `PATCH /users/me/preferences`

### Demandes

- Création et lecture des demandes.
- Lecture des demandes maintenancier.
- Acceptation maintenancier.
- Filtrage par zones côté backend.

### Catalogue

- Recherche catalogue.
- Recherche de maintenanciers proches lorsque les coordonnées réelles existent.
- Produits et services entreprise.

### Devis, commandes et interventions

- Création et lecture des devis.
- Réponse entreprise aux devis.
- Lecture et modification des commandes.
- Création et statut des interventions.

### Paiements

- Initialisation.
- Vérification.
- Liste utilisateur.
- Facture PDF lorsqu’exposée par l’API.

### Notifications

- Liste paginée.
- Lecture individuelle.
- Lecture globale.
- Suppression.
- Références métier dans `data` lorsque présentes.

### Messagerie

REST :

- conversations ;
- messages ;
- lecture ;
- archivage ;
- suppression.

Socket.IO :

- `messaging:ready` ;
- `conversation:join` ;
- `message:send` ;
- `message:new` ;
- `conversation:updated` ;
- `conversation:read` ;
- `messaging:error`.

### Avis

- Lecture protégée des avis liés à l’utilisateur.
- Création d’un avis Agriculteur avec une cible réelle.

### Administration

- Utilisateurs.
- Produits.
- Signalements.
- Statistiques.
- Audit logs.
- Scraping.

## 7. Scraping Admin

Le backend expose un module scraping protégé par RBAC :

- sources ;
- validation ;
- autorisation ;
- activation/désactivation ;
- test ;
- exécution ;
- statistiques source ;
- runs ;
- erreurs ;
- machines importées.

Une interface Scraping a été ajoutée avec le design system Admin, sans maquette officielle spécifique.

## 8. Règles de données

Les routes actives doivent respecter les règles suivantes :

- aucune donnée métier hardcodée ;
- aucune valeur inventée pour remplir une card ;
- aucun faux utilisateur ;
- aucun faux paiement ;
- aucune coordonnée GPS inventée ;
- aucun faux statut ;
- aucune fausse date ;
- aucune fausse pagination ;
- aucun export fictif ;
- aucun succès React-only.

Une valeur absente est affichée par `—` ou par un état contrôlé.

## 9. Règles d’actions

Chaque action doit :

1. utiliser l’endpoint réel lorsqu’il existe ;
2. respecter le DTO backend ;
3. respecter le rôle autorisé ;
4. afficher un loading ;
5. gérer les erreurs ;
6. confirmer les actions sensibles ;
7. actualiser les données après succès ;
8. être désactivée si aucun endpoint n’existe.

## 10. Sécurité

Les endpoints sensibles doivent respecter :

- `JwtAuthGuard` ;
- `RolesGuard` ;
- `RoleCode.ADMINISTRATEUR` pour les actions Admin ;
- ownership des ressources ;
- validation des participants messagerie ;
- audit logs backend lorsque prévus ;
- interdiction d’auto-suspension Admin ;
- absence d’exposition inutile de données personnelles.

## 11. États UI obligatoires

Les pages actives doivent gérer :

- loading initial ;
- loading d’action ;
- loading de détail ;
- erreur API ;
- retry ;
- liste vide ;
- aucun résultat ;
- succès ;
- erreur d’action ;
- actualisation ;
- données partielles ;
- images absentes ;
- coordonnées absentes.

## 12. Design et responsive

Les maquettes officielles existantes restent la référence visuelle. Le design doit préserver :

- sidebar ;
- topbar ;
- cards ;
- tableaux ;
- badges ;
- drawers ;
- modals ;
- icônes ;
- couleurs ;
- typographies ;
- espacements ;
- responsive desktop, tablette et mobile.

Lorsqu’aucune maquette spécifique n’existe, le design system du rôle concerné est utilisé sans prétendre reproduire une maquette inexistante.

## 13. Tests et validation

Commandes principales :

```text
npm run test:all
npm run build
```

Validation attendue :

- tests unitaires backend réussis ;
- tests E2E réussis ;
- build frontend réussi ;
- build backend réussi ;
- routes principales HTTP `200` ;
- APIs protégées HTTP `401` sans authentification ;
- aucune page blanche ;
- aucune régression cross-role.

## 14. Limitations backend connues

Les limitations suivantes restent documentées lorsqu’aucun contrat backend n’est disponible :

- séries temporelles statistiques ;
- réponses/modification de réponses aux avis ;
- recherche de participants messagerie ;
- coordonnées GPS persistées des zones ;
- paramètres système Admin ;
- exports spécialisés ;
- pagination ou recherche serveur sur certaines ressources ;
- audit logs scraping dédiés.

Ces limitations ne doivent pas être masquées par des mocks ou de fausses actions.

## 15. Hors périmètre

- AGRIMAC Ops.
- Création arbitraire de nouvelles fonctionnalités sans besoin métier confirmé.
- Suppression automatique des composants legacy.
- Réinitialisation de base de données.
- Suppression de migrations.
- Affaiblissement du RBAC.
- Utilisation de données de démonstration comme données métier.

## 16. Critères d’acceptation

Le projet est considéré techniquement stable lorsque :

- les routes actives sont identifiées ;
- les composants actifs sont raccordés ;
- les APIs pertinentes sont utilisées ;
- les mocks métier actifs ont disparu ;
- les actions persistantes utilisent le backend ;
- les actions sans endpoint sont contrôlées ;
- les états UI sont complets ;
- le RBAC est respecté ;
- les tests passent ;
- le build passe ;
- aucune régression n’est détectée ;
- les limitations backend sont documentées.

## 17. État actuel

**AGRIMAC est techniquement stable avec limitations backend documentées.**

Les composants legacy peuvent encore contenir des données statiques, mais ils ne doivent pas être rendus par les routes officielles actives.
