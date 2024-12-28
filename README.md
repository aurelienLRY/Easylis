# Easylis 

![Occitanie Évasion](https://github.com/user-attachments/assets/b3cd8efd-ddd6-4bd3-a2c4-060fd405b335)

## Table des Matières

1. [À propos](#1-à-propos)
2. [Stack Technique](#2-stack-technique)
3. [Créateur](#3-créateur)
4. [Architecture](#4-architecture)
5. [Configuration](#5-configuration)
6. [Utilisation](#6-utilisation)

---

## 1. À propos

Easylis est une application conçue pour simplifier la gestion des activités et des réservations. Elle s'adapte aux besoins variés des entreprises de loisirs.

Avec Easylis, les gestionnaires peuvent planifier, suivre et optimiser leurs événements.

** Caractéristiques principales : ** 

Gestion des créneaux horaires : Configurez et organisez facilement les disponibilités des activités en fonction des capacités et des ressources.
Réservations en temps réel : Permettez aux clients de réserver directement via une interface conviviale, avec des mises à jour instantanées des disponibilités.
Suivi des performances : Analysez les données des activités pour identifier les tendances et maximiser l’efficacité.
Notifications automatisées : Envoyez des rappels aux clients ou des alertes aux gestionnaires en quelques clics.
---

## 2. Stack Technique

Cette application repose sur les technologies suivantes :
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

## 3. Créateur

**Nom du Créateur**  
Contact : [leroyaurelien11@gmail.com](mailto:leroyaurelien11@gmail.com)  
Profil GitHub : [GitHub](https://github.com/aurelienLRY/)
Temps passé : [![wakatime](https://wakatime.com/badge/user/dfdaf0d3-5ae8-4997-92c1-563d24f5d7d4/project/5d7c61d4-7045-45c5-a7a0-20bc00395ad3.svg)](https://wakatime.com/badge/user/dfdaf0d3-5ae8-4997-92c1-563d24f5d7d4/project/5d7c61d4-7045-45c5-a7a0-20bc00395ad3)

---

## 4. Architecture

Le projet est organisé selon une architecture modulaire et maintenable, avec des dossiers spécifiques pour chaque type de fonctionnalité et composant.

**Structure du dossier :**

```plaintext
/src
├── /app               # API App Router de Next.js 13+
│   ├── /(routes)      # Routes regroupées par dossier (optionnel)
│   ├── /api           # Endpoints API pour la gestion des données
│   ├── /dashboard     # Exemple : route principale avec sous-routes
│   ├── layout.tsx     # Layout principal partagé par toutes les pages
│   └── page.tsx       # Page d'accueil (racine de l'application)
│
├── /components        # Composants réutilisables dans l'application
│   ├── /ui            # Composants d'interface (boutons, formulaires, etc.)
│   └── /modules       # Composants propres à des fonctionnalités précises
│
├── /hooks             # Hooks React personnalisés
│
├── /lib               # Fonctions utilitaires, helpers, et instances (ex. axios, firebase)
│
├── /styles            # CSS global et styles spécifiques
│
├── /context           # Fournisseurs de contexte pour l'état global (Context API)
│
├── /services          # Fonctions pour la communication avec les API
│
├── /store             # Gestion d'état global (ex. Redux, Zustand)
│
├── /utils             # Fonctions utilitaires, constantes et types
│
├── /types             # Types TypeScript et interfaces globales
│
└── /assets            # Images, polices, et autres ressources statiques
```

## 5. Configuration

### Prérequis .env

```env
# URL de l'application pour NextAuth
NEXTAUTH_URL='string'

# Clé secrète pour NextAuth (générée automatiquement)
NEXTAUTH_SECRET="string"

# URI de connexion pour MongoDB
MONGODB_URI="mongodb+srv://<username>:<password>@...."

# Clé d'encryption pour les données sensibles
ENCRYPTION_KEY="string"

# Jeton d'API pour la création d'un utilisateur
NEXT_API_TOKEN="string"

# Configuration SMTP pour l'envoi d'emails
SMTP_HOST=""
SMTP_PORT=465
SMTP_SECURE=true
SMTP_EMAIL="email"
SMTP_PASSWORD=""

#API CALENDAR
GOOGLE_CLIENT_ID= string
GOOGLE_CLIENT_SECRET= string
GOOGLE_REDIRECT_URI= string
NEXT_PUBLIC_GOOGLE_API_KEY= string


```

## 6. Utilisation

### Ajout d'un Administrateur

Pour ajouter un administrateur, suivez les étapes ci-dessous. Cela nécessite de configurer un jeton dans le fichier .env.local et de faire une requête POST à l'API.

1. Configurer le jeton d'API dans le fichier .env.local : Assurez-vous d'avoir un jeton valide en ajoutant la variable suivante dans votre fichier .env.local (ou en la modifiant si elle existe déjà) :

```env
NEXT_API_TOKEN="votre_token_securisé_ici"
```

2. Faire une requête API pour créer un administrateur : Utilisez le code suivant pour envoyer une requête POST à l'API afin de créer un administrateur. Assurez-vous de personnaliser le corps de la requête avec les informations de l’administrateur:

```javascript
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", "••••••");

const raw = JSON.stringify({
  email: "exemple@exemple.com",
  password: "alpha#",
  username: "admin",
  name: "admin",
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow",
};

fetch("http://localhost:3000/api/user", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```
