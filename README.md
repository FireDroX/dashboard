# Netwatch Dashboard

Netwatch Dashboard est une application de surveillance d’URL auto-hébergée. Elle permet de suivre la disponibilité de services HTTP, leur temps de réponse, leur dernier code HTTP et la date de leur dernière vérification depuis une interface inspirée des consoles netrunner.

La consultation du dashboard est publique. Les actions de gestion sont protégées par un mot de passe partagé et une session persistée dans MySQL.

## Fonctionnalités

- ajout, modification et suppression d’un service à surveiller ;
- vérification immédiate lors de l’ajout d’un service depuis l’interface ;
- vérification manuelle d’un service ou de l’ensemble des services ;
- vérification automatique toutes les cinq minutes ;
- actualisation automatique du dashboard toutes les trente secondes ;
- statuts `ONLINE`, `OFFLINE` et `UNKNOWN` ;
- mesure du temps de réponse et conservation du dernier code HTTP ;
- affichage de la dernière erreur rencontrée ;
- statistiques globales : nombre de services, disponibilité et latence moyenne ;
- interface publique en lecture seule ;
- espace d’administration protégé par une session MySQL ;
- frontend React compilé et servi directement par NestJS ;
- image Docker multi-stage et script de déploiement sur un réseau MariaDB existant.

## Stack technique

### Backend

- Node.js 22 ;
- NestJS 11 ;
- TypeORM ;
- MySQL ou MariaDB ;
- Axios pour les vérifications HTTP ;
- `@nestjs/schedule` pour les vérifications périodiques ;
- `express-session` et `express-mysql-session` pour l’authentification.

### Frontend

- React 19 ;
- TypeScript ;
- Vite ;
- React Router ;
- TanStack Query ;
- Axios ;
- Tailwind CSS et CSS personnalisé.

## Fonctionnement de la surveillance

Chaque vérification envoie une requête HTTP avec un délai maximal de cinq secondes et autorise jusqu’à trois redirections.

| Résultat | Statut enregistré |
| --- | --- |
| Réponse HTTP de `200` à `499` | `ONLINE` |
| Réponse HTTP `500` ou supérieure | `OFFLINE` |
| Timeout, erreur DNS ou connexion impossible | `OFFLINE` |
| Service pas encore vérifié | `UNKNOWN` |

Le dashboard conserve uniquement le dernier résultat de chaque service. Il ne stocke pas encore d’historique de disponibilité.

## Architecture

```text
.
├── client/                  # Application React/Vite
│   └── src/
│       ├── components/      # Cartes, formulaires, badges et modale
│       ├── pages/           # Dashboard, connexion, ajout et modification
│       ├── services/        # Client Axios et appels à l’API
│       └── types/           # Types du frontend
├── src/
│   ├── auth/                # Connexion, déconnexion, session et guard
│   ├── monitors/            # API, service TypeORM et entité Monitor
│   ├── app.module.ts        # Configuration NestJS et MySQL
│   └── main.ts              # Sessions, CORS, validation et démarrage
├── database/schema.sql      # Création de la base et de la table monitors
├── Dockerfile               # Build frontend, backend et image d’exécution
├── build.sh                 # Déploiement sur un réseau MariaDB existant
└── .env.example             # Variables d’environnement attendues
```

## Prérequis

- Node.js `22.22.0` ou supérieur ;
- npm ;
- MySQL 8 ou une version compatible de MariaDB ;
- Docker avec BuildKit pour le déploiement conteneurisé.

## Installation locale

### 1. Installer les dépendances

À la racine du projet :

```bash
npm ci
npm --prefix client ci
```

### 2. Créer la base de données

```sql
CREATE DATABASE monitoring
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Créer ensuite la table utilisée par TypeORM :

```sql
USE monitoring;

CREATE TABLE IF NOT EXISTS monitors (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  status ENUM('UNKNOWN', 'ONLINE', 'OFFLINE') NOT NULL DEFAULT 'UNKNOWN',
  responseTime INT NULL,
  statusCode SMALLINT NULL,
  lastError VARCHAR(255) NULL,
  lastCheckedAt DATETIME NULL,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_monitors_url (url) USING HASH
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Le script complet peut être importé directement :

```bash
mysql -u root -p < database/schema.sql
```

L’utilisateur défini dans `.env` doit pouvoir lire et modifier les données de cette base. Il doit également pouvoir créer la table `sessions`, générée automatiquement par `express-mysql-session` au premier démarrage.

En développement, cette importation reste facultative : TypeORM crée ou met à jour automatiquement la table `monitors` lorsque `NODE_ENV` n’est pas égal à `production`.

### 3. Configurer l’environnement

Copier le fichier d’exemple :

```bash
cp .env.example .env
```

Sous PowerShell :

```powershell
Copy-Item .env.example .env
```

Puis adapter les valeurs à la base locale.

### 4. Démarrer le backend

```bash
npm run start:dev
```

L’API écoute par défaut sur `http://localhost:3000`.

### 5. Démarrer le frontend

Dans un second terminal :

```bash
npm --prefix client run dev
```

Le dashboard est disponible sur `http://localhost:5173`. Vite transmet automatiquement les appels `/api` au backend local.

## Variables d’environnement

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=monitoring

FRONTEND_URL=http://localhost:5173
NODE_ENV=development

DASHBOARD_PASSWORD=test
SESSION_SECRET=replace-with-a-long-random-secret
```

| Variable | Description | Exemple local |
| --- | --- | --- |
| `PORT` | Port d’écoute de NestJS | `3000` |
| `DB_HOST` | Hôte MySQL. Dans Docker, utiliser le nom du conteneur ou son alias réseau | `localhost` |
| `DB_PORT` | Port interne de MySQL | `3306` |
| `DB_USERNAME` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | chaîne vide en local si autorisé |
| `DB_DATABASE` | Base utilisée pour les monitors et les sessions | `monitoring` |
| `FRONTEND_URL` | Origine frontend autorisée par CORS | `http://localhost:5173` |
| `NODE_ENV` | Active les réglages de production avec la valeur `production` | `development` |
| `DASHBOARD_PASSWORD` | Mot de passe partagé de l’administration | `test` uniquement en développement |
| `SESSION_SECRET` | Secret utilisé pour signer le cookie de session | une longue valeur aléatoire |

Le fichier `.env` est exclu de Git et du contexte Docker. Il ne doit jamais être ajouté à l’image.

## Authentification

Le dashboard reste consultable sans connexion. Une session authentifiée est obligatoire pour :

- ajouter ou modifier un service ;
- supprimer un service ;
- vérifier un service ;
- déclencher la vérification globale.

Après une connexion réussie, l’identifiant de session est enregistré dans le cookie `dashboard.sid`. Le cookie est HTTP-only, utilise `SameSite=Lax` et expire après 24 heures. Les données de session sont stockées dans MySQL et les sessions expirées sont régulièrement supprimées.

En production, le cookie devient sécurisé et nécessite donc HTTPS.

## Routes de l’API

Toutes les routes sont préfixées par `/api`.

### Authentification

| Méthode | Route | Accès | Description |
| --- | --- | --- | --- |
| `GET` | `/api/auth/session` | Public | Retourne l’état de la session |
| `POST` | `/api/auth/login` | Public | Ouvre une session avec le mot de passe du dashboard |
| `POST` | `/api/auth/logout` | Public | Détruit la session courante |

Corps de la requête de connexion :

```json
{
  "password": "test"
}
```

### Monitors

| Méthode | Route | Accès | Description |
| --- | --- | --- | --- |
| `GET` | `/api/monitors` | Public | Liste les services |
| `GET` | `/api/monitors/:id` | Public | Retourne un service |
| `POST` | `/api/monitors` | Session | Ajoute un service |
| `PATCH` | `/api/monitors/:id` | Session | Modifie un service |
| `DELETE` | `/api/monitors/:id` | Session | Supprime un service |
| `POST` | `/api/monitors/:id/check` | Session | Vérifie un service |
| `POST` | `/api/monitors/check-all` | Session | Vérifie tous les services |

Exemple de service :

```json
{
  "id": 1,
  "name": "Portfolio",
  "url": "https://example.com",
  "status": "ONLINE",
  "responseTime": 184,
  "statusCode": 200,
  "lastError": null,
  "lastCheckedAt": "2026-08-05T10:30:00.000Z",
  "createdAt": "2026-08-05T10:00:00.000Z",
  "updatedAt": "2026-08-05T10:30:00.000Z"
}
```

## Compilation

Compiler séparément le frontend et le backend :

```bash
npm --prefix client run build
npm run build
```

NestJS sert ensuite les fichiers générés dans `client/dist` :

```bash
npm run start:prod
```

Pour un lancement avec `NODE_ENV=production`, la base doit avoir été préparée avec des migrations et l’application doit être exposée derrière HTTPS.

## Déploiement Docker

Le `Dockerfile` utilise trois étapes :

1. compilation du frontend React ;
2. compilation du backend NestJS ;
3. création d’une image d’exécution contenant uniquement les dépendances de production et les deux builds.

Le processus Node s’exécute avec l’utilisateur non privilégié `node`.

### Réseau MySQL externe

Le script `build.sh` suppose que MySQL ou MariaDB fonctionne déjà dans un autre conteneur, connecté au réseau Docker `mariadb-network`.

Créer le réseau s’il n’existe pas :

```bash
docker network create mariadb-network
```

Le conteneur de base de données doit rejoindre ce même réseau. Dans le `.env` du serveur, `DB_HOST` doit contenir son nom ou son alias Docker, jamais `localhost` :

```env
DB_HOST=mariadb
DB_PORT=3306
```

Lancer ensuite le déploiement :

```bash
chmod +x build.sh
./build.sh
```

Le dashboard écoute par défaut sur `127.0.0.1:3334`. Le script construit l’image, remplace l’ancien conteneur, injecte le `.env`, rejoint le réseau MariaDB et affiche les derniers logs.

### Options du script

Les valeurs suivantes peuvent être surchargées au lancement :

| Variable | Valeur par défaut | Rôle |
| --- | --- | --- |
| `IMAGE_NAME` | `dashboard-image` | Nom de l’image Docker |
| `CONTAINER_NAME` | `dashboard` | Nom du conteneur |
| `HOST_PORT` | `3334` | Port exposé sur l’hôte |
| `CONTAINER_PORT` | valeur `PORT` du `.env` | Port écouté dans le conteneur |
| `NETWORK_NAME` | `mariadb-network` | Réseau de la base de données |
| `ENV_FILE` | `.env` à la racine | Fichier injecté dans le conteneur |
| `DB_HOST_DOCKER` | valeur `DB_HOST` du `.env` | Surcharge ponctuelle de l’hôte MySQL |

Exemple :

```bash
HOST_PORT=3500 DB_HOST_DOCKER=mariadb ./build.sh
```

## Scripts disponibles

### Backend

```bash
npm run start:dev   # serveur avec rechargement automatique
npm run build       # compilation NestJS
npm run start:prod  # lancement du build
npm run lint        # lint et corrections automatiques
npm run format      # formatage Prettier du backend
```

### Frontend

```bash
npm --prefix client run dev
npm --prefix client run build
npm --prefix client run lint
npm --prefix client run preview
```

## Sécurité et limites

Ce projet fournit une authentification légère adaptée à un dashboard personnel. Avant une exposition publique, il faut notamment :

- remplacer `DASHBOARD_PASSWORD` et `SESSION_SECRET` par des valeurs fortes ;
- utiliser HTTPS et conserver `NODE_ENV=production` ;
- ajouter une limitation des tentatives de connexion ;
- ajouter une protection CSRF pour les mutations ;
- stocker un hash du mot de passe au lieu du mot de passe brut ;
- gérer le schéma de production avec des migrations TypeORM ;
- protéger les vérifications contre les attaques SSRF en bloquant localhost, les réseaux privés, les métadonnées cloud et les redirections dangereuses ;
- limiter la taille des réponses téléchargées pendant une vérification ;
- ajouter un historique, des alertes et des tests automatisés si le projet devient un outil de production.

Avec `NODE_ENV=production`, `synchronize` est désactivé. C’est volontaire : TypeORM ne doit pas modifier automatiquement un schéma de production.

## Licence

Ce projet est distribué sous licence MIT. Voir le fichier [LICENSE](LICENSE).
