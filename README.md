# 🚀 Easylis - Gestion d'Activités et Réservations

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4.4-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24-000000?style=for-the-badge&logo=nextauth&logoColor=white)](https://next-auth.js.org/)

![Occitanie Évasion](https://github.com/user-attachments/assets/b3cd8efd-ddd6-4bd3-a2c4-060fd405b335)

> **Easylis** est une application moderne de gestion d'activités et de réservations conçue pour les entreprises de loisirs. Elle simplifie la planification, le suivi et l'optimisation des événements avec une interface intuitive et des fonctionnalités avancées.

## 📋 Table des Matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Stack Technique](#️-stack-technique)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [📸 Photos de session](#-photos-de-session)
- [📖 Utilisation](#-utilisation)
- [🔧 Développement](#-développement)
- [📚 Documentation](#-documentation)
- [🤝 Contribution](#-contribution)
- [👨‍💻 Créateur](#-créateur)
- [📄 Licence](#-licence)

---

## ✨ Fonctionnalités

### 🎯 **Gestion Complète des Activités**
- **Créneaux horaires flexibles** : Configuration et organisation des disponibilités
- **Gestion des capacités** : Contrôle des places disponibles par activité
- **Planification avancée** : Interface intuitive pour la création d'événements
- **Gestion des lieux** : Coordonnées GPS et informations détaillées des spots

### 📅 **Système de Réservations**
- **Réservations en temps réel** : Interface client conviviale avec mises à jour instantanées
- **Gestion des statuts** : Validation, annulation, en attente
- **Notifications automatisées** : Emails de confirmation et rappels
- **Intégration Google Calendar** : Synchronisation bidirectionnelle

### 📊 **Analytics et Suivi**
- **Tableaux de bord** : Vue d'ensemble des performances
- **Statistiques détaillées** : Analyse des tendances et de l'efficacité
- **Rapports personnalisés** : Export de données pour analyse
- **Graphiques interactifs** : Visualisation des données d'activités

### 🔐 **Sécurité et Authentification**
- **Authentification NextAuth.js** : Connexion sécurisée
- **Gestion des rôles** : Administrateurs et utilisateurs
- **Chiffrement des données** : Protection des informations sensibles
- **API sécurisée** : Validation et autorisation des requêtes

### 📸 **Photos de session**
- **Galerie par session** : depuis la carte session, modal pour ajouter ou gérer les photos
- **Stockage externe** : fichiers sur un serveur/API dédié (`PHOTO_STORAGE_API_URL`), métadonnées en MongoDB (`SessionPhoto`)
- **Renommage normalisé** : slug entreprise / activité / date / numéro avant envoi au stockage
- **Rétention 3 mois** : expiration puis suppression côté stockage et marquage en base
- **Lien marchand** : envoi d’email aux clients (template identique aux autres mails Occitanie Évasion) avec URL signée vers le site marchand

---

## 🏗️ Architecture

Le projet suit une architecture modulaire et maintenable avec une séparation claire des responsabilités.

### 📁 Structure du Projet

```
Easylis/
├── 📁 src/
│   ├── 📁 app/                    # App Router Next.js 13+
│   │   ├── 📁 api/               # Endpoints API
│   │   │   ├── 📁 auth/          # Authentification
│   │   │   ├── 📁 session-photos/# Photos sessions (CRUD + partage email)
│   │   │   ├── 📁 services/      # Services externes
│   │   │   └── 📁 user/          # Gestion utilisateurs
│   │   ├── 📁 dashboard/         # Interface d'administration
│   │   ├── layout.tsx            # Layout principal
│   │   └── page.tsx              # Page d'accueil
│   │
│   ├── 📁 components/            # Composants React
│   │   ├── 📁 buttons/           # Composants de boutons
│   │   ├── 📁 cards/             # Cartes d'affichage
│   │   ├── 📁 form/              # Formulaires
│   │   ├── 📁 layout/            # Composants de mise en page
│   │   ├── 📁 input/             # Inputs (ex. upload fichier)
│   │   └── 📁 modules/           # Modules fonctionnels (ex. SessionPhotos)
│   │
│   ├── 📁 hooks/                 # Hooks personnalisés
│   │   ├── useAuth.ts            # Authentification
│   │   ├── useGoogleCalendar.ts  # Google Calendar
│   │   ├── useCustomer.ts        # Gestion clients
│   │   └── useMailer.ts          # Envoi d'emails
│   │
│   ├── 📁 store/                 # Gestion d'état Zustand
│   │   ├── calendar.store.ts     # État Google Calendar
│   │   ├── sessions.store.ts     # Sessions
│   │   ├── activities.store.ts   # Activités
│   │   └── profile.store.ts      # Profil utilisateur
│   │
│   ├── 📁 services/              # Services externes
│   │   ├── 📁 GoogleCalendar/    # Intégration Google
│   │   └── 📁 Mailer/            # Service d'emails
│   │
│   ├── 📁 libs/                  # Bibliothèques et utilitaires
│   │   ├── 📁 database/          # Configuration MongoDB (+ modèle SessionPhoto)
│   │   ├── 📁 ServerAction/      # Actions serveur
│   │   └── 📁 utils/             # Utilitaires
│   │
│   └── 📁 types/                 # Types TypeScript
│
├── 📁 public/                    # Assets statiques
├── 📁 APIEXTERNE/                # API Express optionnelle (stockage fichiers photos)
├── 📁 docs/                      # Documentation
├── package.json                  # Dépendances
├── tailwind.config.ts           # Configuration Tailwind
└── next.config.mjs              # Configuration Next.js
```

### 🔄 Flux de Données

```mermaid
graph TD
    A[Interface Utilisateur] --> B[Hooks]
    B --> C[Stores Zustand]
    C --> D[Services]
    D --> E[API Routes]
    E --> F[Base de Données]
    
    G[Google Calendar] --> D
    H[SMTP Server] --> D
```

---

## 🛠️ Stack Technique

### **Frontend**
- **[Next.js 14](https://nextjs.org/)** - Framework React avec App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Gestion d'état global
- **[React Hook Form](https://react-hook-form.com/)** - Gestion des formulaires

### **Backend**
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - API REST
- **[MongoDB](https://www.mongodb.com/)** - Base de données NoSQL
- **[Mongoose](https://mongoosejs.com/)** - ODM pour MongoDB
- **[NextAuth.js](https://next-auth.js.org/)** - Authentification

### **Services Externes**
- **[Google Calendar API](https://developers.google.com/calendar)** - Synchronisation calendrier
- **[Nodemailer](https://nodemailer.com/)** - Envoi d'emails
- **[SMTP](https://fr.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol)** - Serveur email

### **Outils de Développement**
- **[ESLint](https://eslint.org/)** - Linting JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** - Formatage de code

---

## 🚀 Installation

### Prérequis
- **Node.js** 18.0 ou supérieur
- **npm** ou **yarn**
- **MongoDB** (local ou Atlas)
- **Compte Google Cloud** (pour Google Calendar)

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/aurelienLRY/Easylis.git
   cd Easylis
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurer l'environnement**
   ```bash
   cp exemple.env .env.local
   # Éditer .env.local avec vos configurations
   ```

4. **Lancer en développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. **Ouvrir l'application**
   ```
   http://localhost:3000
   ```

---

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env.local` basé sur `exemple.env` :

```env
# ========================================
# CONFIGURATION NEXT.JS & NEXTAUTH
# ========================================

# URL de l'application (obligatoire pour NextAuth)
NEXTAUTH_URL=http://localhost:3000

# Secret pour NextAuth.js (générer avec: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_here

# Origines autorisées pour CORS
ALLOWED_ORIGINS=http://localhost:3000,https://staging.occitanie-evasion.com,https://occitanie-evasion.com

# ========================================
# BASE DE DONNÉES MONGODB
# ========================================

# URI de connexion MongoDB Atlas ou MongoDB local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/easylis?retryWrites=true&w=majority

# ========================================
# SÉCURITÉ & CHIFFREMENT
# ========================================

# Clé de chiffrement pour les données sensibles (32 caractères)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Token API pour créer de nouveaux utilisateurs
NEXT_API_TOKEN=your_api_token_for_user_creation

# Token API pour les services externes
NEXT_API_OUT_SERVICES=your_external_services_api_token

# ========================================
# CONFIGURATION EMAIL (SMTP)
# ========================================

# Serveur SMTP pour l'envoi d'emails
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password

# ========================================
# INTÉGRATION GOOGLE CALENDAR
# ========================================

# Identifiants Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/services/google/callback
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key

# ========================================
# PHOTOS DE SESSION (stockage + liens clients)
# ========================================

# URL de base de l'API de stockage des fichiers (serveur externe)
PHOTO_STORAGE_API_URL=https://votre-api-photos.example.com

# URL du site marchand (page galerie à implémenter côté marchand)
MERCHANT_PHOTO_BASE_URL=https://votre-site-marchand.example.com

# Secret HMAC pour signer les tokens dans les liens uniques (idéalement dédié, fort)
PHOTO_SHARE_LINK_SECRET=your_photo_share_link_secret
```

### Configuration Google Calendar

1. **Créer un projet Google Cloud**
   - Aller sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créer un nouveau projet
   - Activer l'API Google Calendar

2. **Configurer OAuth 2.0**
   - Créer des identifiants OAuth 2.0
   - Ajouter les URLs de redirection autorisées
   - Récupérer `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`

3. **Configurer les permissions**
   - Ajouter les scopes nécessaires
   - Configurer l'écran de consentement

---

## 📸 Photos de session

Fonctionnalité **admin** : attacher des photos à une session, les stocker sur un **serveur externe**, tracer les fichiers en **MongoDB**, et **notifier les clients** par email avec un lien unique vers le site marchand.

### Parcours utilisateur (dashboard)

1. Sur une **carte session** (`SessionCard`), bouton **galerie** (icône photos).
2. **Modal** (`SessionPhotosModal`) avec deux modes :
   - **Ajouter** : zone de dépôt / sélection (`FileUpload`), compression côté navigateur (**max ~3 Mo** par image), envoi séquentiel pour limiter la taille des requêtes.
   - **Gérer** : grille de vignettes, suppression via icône poubelle.
3. **Envoyer le lien photos aux clients** (`SecondaryButton`) : visible et actif **uniquement** s’il existe **au moins un client** non annulé (`status !== "Canceled"`) **et** au moins **une photo** en base.

### Données (MongoDB)

- Modèle **`SessionPhoto`** (`src/libs/database/models/SessionPhoto.model.ts`) : `sessionId`, noms, URL publique, taille, dates `uploadedAt` / `expiresAt` (+ `deletedAt` après purge).
- Rétention **3 mois** à partir de l’upload : nettoyage côté API Easylis + suppression distante lorsque `expiresAt` est dépassé.

### API Easylis (App Router)

| Route | Rôle |
|--------|------|
| `GET /api/session-photos?sessionId=` | Liste des photos actives de la session |
| `POST /api/session-photos` | Upload (multipart : `sessionId`, `files`) — proxy vers le stockage externe |
| `DELETE /api/session-photos` | Suppression (JSON : `photoId`) |
| `POST /api/session-photos/share` | Envoi des emails « lien photos » à tous les clients éligibles de la session |

Authentification : **session NextAuth** requise sur ces routes.

### Stockage externe

- Variable **`PHOTO_STORAGE_API_URL`** : base URL du service qui reçoit les fichiers.
- Dossier **`APIEXTERNE/`** à la racine du repo : **exemple** d’API Express (upload, liste, suppression, purge TTL). Déployable séparément ; voir `APIEXTERNE/README.md`.
- **ModSecurity** : sur certains hébergeurs, les uploads `multipart` peuvent être bloqués ; une exception sur la route d’upload peut être nécessaire.

### Fichiers et emails

- Renommage des fichiers envoyés au stockage : slug **entreprise – activité – date – numéro** (voir logique dans `src/app/api/session-photos/route.ts`).
- Email clients : scénario **`SESSION_PHOTOS_SHARE`** dans `src/services/Mailer/…` — même **gabarit HTML** que les autres mails (`generateEmail` + `base.template.ts`).
- Logs **`EmailLog`** : valeur de scénario `SESSION_PHOTOS_SHARE` autorisée dans le modèle.
- Lien généré pour le marchand :  
  `{MERCHANT_PHOTO_BASE_URL}/photos/{slug-activite}-{idSession}?token={token_signé}`  
  Le site marchand devra **vérifier le token** (secret `PHOTO_SHARE_LINK_SECRET`) et afficher la galerie (hors périmètre Easylis admin si non encore codé).

### Next.js

- `next.config.mjs` : `experimental.middlewareClientMaxBodySize` relevé pour les uploads volumineux (voir doc Next.js si besoin d’ajustement).

---

## 📖 Utilisation

### 🎯 Interface d'Administration

L'interface d'administration est accessible via `/dashboard` et comprend :

- **Tableau de bord** : Vue d'ensemble des activités et réservations
- **Gestion des sessions** : Création, modification, suppression
- **Photos de session** : galerie, envoi de liens aux clients (voir [Photos de session](#-photos-de-session))
- **Gestion des clients** : Suivi des réservations et statuts
- **Configuration** : Paramètres de l'application

### 📅 Synchronisation Google Calendar

```typescript
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";

const CalendarSync = () => {
  const { syncCalendar, isSyncing } = useGoogleCalendar();
  
  const handleSync = async () => {
    try {
      await syncCalendar();
      console.log("Synchronisation réussie");
    } catch (error) {
      console.error("Erreur de synchronisation:", error);
    }
  };
  
  return (
    <button onClick={handleSync} disabled={isSyncing}>
      {isSyncing ? "Synchronisation..." : "Synchroniser"}
    </button>
  );
};
```

### 📧 Envoi d'Emails

```typescript
import { useMailer } from "@/hooks/useMailer";

const EmailService = () => {
  const { sendEmail } = useMailer();
  
  const handleSendConfirmation = async () => {
    await sendEmail({
      to: "client@example.com",
      template: "bookingRequest",
      data: {
        customerName: "John Doe",
        sessionDate: "2024-01-15",
        activityName: "Escalade"
      }
    });
  };
};
```

### 👥 Création d'un Administrateur

```javascript
// Requête API pour créer un administrateur
const createAdmin = async () => {
  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": process.env.NEXT_API_TOKEN
    },
    body: JSON.stringify({
      email: "admin@easylis.com",
      password: "securePassword123",
      username: "admin",
      name: "Administrateur"
    })
  });
  
  const result = await response.json();
  console.log("Administrateur créé:", result);
};
```

---

## 🔧 Développement

### Scripts Disponibles

```bash
# Développement
npm run dev          # Lancer le serveur de développement
npm run build        # Construire pour la production
npm run start        # Lancer en production
npm run lint         # Vérifier le code avec ESLint
npm run ts-check     # Vérifier les types TypeScript

# Versionnement (package.json)
npm run version:show   # Afficher la version courante
npm run version:patch  # Incrément patch sans commit Git
npm run version:minor  # Idem minor
npm run version:major  # Idem major
npm run release:patch  # Bump + commit + tag Git (working tree propre requis)
```

### Structure de Développement

#### **Ajout d'un nouveau composant**
```typescript
// src/components/NewComponent.tsx
import { FC } from 'react';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export const NewComponent: FC<NewComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

#### **Ajout d'un nouveau store**
```typescript
// src/store/newStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NewStore {
  data: any[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
}

export const useNewStore = create<NewStore>()(
  devtools(
    (set) => ({
      data: [],
      isLoading: false,
      fetchData: async () => {
        set({ isLoading: true });
        // Logique de récupération
        set({ isLoading: false });
      }
    }),
    { name: 'NewStore' }
  )
);
```

#### **Ajout d'une nouvelle API route**
```typescript
// src/app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Logique métier
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 📚 Documentation

### Documentation par Module

- **[README principal](./README.md)** — section **Photos de session** pour le stockage, les variables d’environnement et le flux complet
- **[API Documentation](./src/app/api/README.md)** - Routes API et endpoints
- **[Hooks Documentation](./src/hooks/README.md)** - Hooks personnalisés
- **[Store Documentation](./src/store/README.md)** - Gestion d'état Zustand
- **[Services Documentation](./src/services/README.md)** - Services externes


---

## 🤝 Contribution

Nous accueillons les contributions ! Voici comment participer :

### 1. **Fork et Clone**
```bash
git clone https://github.com/votre-username/Easylis.git
cd Easylis
```

### 2. **Créer une branche**
```bash
git checkout -b feature/nouvelle-fonctionnalite
```

### 3. **Développer**
- Suivre les conventions de code
- Ajouter des tests si nécessaire
- Documenter les changements


### Conventions de Code

- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/)
- **Nommage** : camelCase pour les variables, PascalCase pour les composants
- **Typescript** : Typage strict obligatoire
- **Tests** : Tests unitaires pour les fonctions critiques

---

## 👨‍💻 Créateur

**Aurélien Leroy**  
📧 Contact : [leroyaurelien11@gmail.com](mailto:leroyaurelien11@gmail.com)  
🐙 GitHub : [@aurelienLRY](https://github.com/aurelienLRY/)  
⏱️ Temps de développement : [![wakatime](https://wakatime.com/badge/user/dfdaf0d3-5ae8-4997-92c1-563d24f5d7d4/project/5d7c61d4-7045-45c5-a7a0-20bc00395ad3.svg)](https://wakatime.com/badge/user/dfdaf0d3-5ae8-4997-92c1-563d24f5d7d4/project/5d7c61d4-7045-45c5-a7a0-20bc00395ad3)


---

## 📄 Licence

Ce projet est sous licence MIT. 

---

<div align="center">

**Easylis** - Simplifiez la gestion de vos activités ! 🚀

[![GitHub stars](https://img.shields.io/github/stars/aurelienLRY/Easylis?style=social)](https://github.com/aurelienLRY/Easylis)
[![GitHub forks](https://img.shields.io/github/forks/aurelienLRY/Easylis?style=social)](https://github.com/aurelienLRY/Easylis)
[![GitHub issues](https://img.shields.io/github/issues/aurelienLRY/Easylis)](https://github.com/aurelienLRY/Easylis/issues)

</div>
