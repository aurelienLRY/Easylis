# API - Documentation

Ce dossier contient toutes les routes API de l'application Easylis, organisées par domaine fonctionnel.

## 📁 Structure du dossier

```
api/
├── auth/                      # Authentification et autorisation
│   ├── auth.ts               # Configuration NextAuth.js
│   ├── [...nextauth]/        # Routes NextAuth.js
│   │   └── route.ts
│   └── signup/               # Inscription utilisateurs
│       └── route.ts
├── user/                     # Gestion des utilisateurs
│   └── route.ts
├── uploadFiles/              # Gestion des fichiers
│   └── route.ts
├── session-photos/           # Photos liées aux sessions (CRUD + partage)
│   ├── route.ts
│   └── share/
│       └── route.ts
├── services/                 # Services externes et intégrations
│   ├── google/               # Intégration Google Calendar
│   │   ├── route.ts
│   │   ├── callback/
│   │   ├── check-token/
│   │   ├── refresh-token/
│   │   └── events/
│   ├── email/                # Service d'emails
│   │   └── send/
│   └── external/             # Services externes
│       ├── route.ts
│       ├── activities/
│       ├── spots/
│       ├── sessions/
│       ├── session-photos/
│       │   └── route.ts
│       ├── README.md           # Guide marchand (session-photos, headers, query)
│       └── booking/
└── README.md                 # Documentation des API
```

## 📁 Structure des API

### 🔐 `auth/` - Authentification et autorisation
**Fonction :** Gestion de l'authentification utilisateur
- **Responsabilités :**
  - Authentification NextAuth.js
  - Inscription des utilisateurs
  - Gestion des sessions
  - Configuration OAuth

#### Fichiers :
- **`auth.ts`** - Configuration NextAuth.js
- **`[...nextauth]/route.ts`** - Routes NextAuth.js (callback, session, etc.)
- **`signup/route.ts`** - Inscription de nouveaux utilisateurs

#### Endpoints :
```
POST /api/auth/signup - Inscription utilisateur
GET  /api/auth/session - Vérifier la session
POST /api/auth/signin - Connexion
POST /api/auth/signout - Déconnexion
```

### 👤 `user/` - Gestion des utilisateurs
**Fonction :** Opérations sur les profils utilisateurs
- **Responsabilités :**
  - CRUD des profils utilisateurs
  - Mise à jour des informations personnelles
  - Gestion des avatars
  - Changement de mot de passe

#### Fichiers :
- **`route.ts`** - Opérations CRUD sur les utilisateurs

#### Endpoints :
```
GET    /api/user - Récupérer le profil utilisateur
POST   /api/user - Créer un utilisateur
PUT    /api/user - Mettre à jour le profil
DELETE /api/user - Supprimer un utilisateur
```

### 📁 `uploadFiles/` - Gestion des fichiers
**Fonction :** Upload et gestion des fichiers
- **Responsabilités :**
  - Upload d'avatars utilisateurs
  - Validation des types de fichiers
  - Stockage sécurisé
  - Conversion d'images

#### Fichiers :
- **`route.ts`** - Upload de fichiers

#### Endpoints :
```
POST /api/uploadFiles - Upload d'un fichier
```

### 📁 `session-photos/` - Photos de session (admin)

**Fonction :** Métadonnées en MongoDB, fichiers sur l’API externe (`PHOTO_STORAGE_API_URL`), partage par email.

#### Fichiers

- **`route.ts`** — `GET` (liste), `POST` (upload multipart), `DELETE` (par `photoId`)
- **`share/route.ts`** — `POST` : envoi des emails « lien photos » aux clients de la session (template `SESSION_PHOTOS_SHARE`)

#### Endpoints

```
GET    /api/session-photos?sessionId=<id>
POST   /api/session-photos
DELETE /api/session-photos
POST   /api/session-photos/share
```

Toutes ces routes nécessitent une **session NextAuth** valide. Documentation détaillée : section **Photos de session** du [README racine](../../../README.md).

### 🔧 `services/` - Services externes et intégrations

#### 📅 `services/google/` - Intégration Google Calendar
**Fonction :** Gestion complète de l'intégration Google Calendar
- **Responsabilités :**
  - OAuth Google Calendar
  - Gestion des tokens
  - Opérations CRUD sur les événements
  - Synchronisation

##### Fichiers :
- **`route.ts`** - Génération URL d'autorisation Google
- **`callback/route.ts`** - Callback OAuth Google
- **`check-token/route.ts`** - Vérification de validité des tokens
- **`refresh-token/route.ts`** - Rafraîchissement des tokens
- **`events/route.ts`** - CRUD des événements Google Calendar
- **`events/check-exists/route.ts`** - Vérification d'existence d'événements

##### Endpoints :
```
GET  /api/services/google - URL d'autorisation Google
GET  /api/services/google/callback - Callback OAuth
POST /api/services/google/check-token - Vérifier token
POST /api/services/google/refresh-token - Rafraîchir token
GET  /api/services/google/events - Lister événements
POST /api/services/google/events - Créer événement
PUT  /api/services/google/events - Modifier événement
DELETE /api/services/google/events - Supprimer événement
POST /api/services/google/events/check-exists - Vérifier existence
```

#### 📧 `services/email/` - Service d'emails
**Fonction :** Envoi d'emails et notifications
- **Responsabilités :**
  - Envoi d'emails transactionnels
  - Templates d'emails
  - Notifications automatiques

##### Fichiers :
- **`send/route.ts`** - Envoi d'emails

##### Endpoints :
```
POST /api/services/email/send - Envoyer un email
```

#### 🌐 `services/external/` - Services externes
**Fonction :** Intégration avec des services externes
- **Responsabilités :**
  - API pour systèmes externes
  - Données publiques
  - Intégrations tierces

##### Fichiers :
- **`route.ts`** - Point d'entrée des services externes
- **`activities/route.ts`** - API des activités
- **`spots/route.ts`** - API des lieux
- **`sessions/route.ts`** - API des sessions
- **`booking/route.ts`** - API des réservations
- **`session-photos/route.ts`** - Galerie photos pour le site marchand (token email + clé API)

##### Endpoints :
```
GET /api/services/external - Informations sur les services
GET /api/services/external/activities - Liste des activités
GET /api/services/external/spots - Liste des lieux
GET /api/services/external/sessions - Liste des sessions
GET /api/services/external/booking - Réservations
GET /api/services/external/session-photos?sessionId=&token= - Photos d'une session (marchand)
```

**Authentification `services/external`** : en-tête `Authorization: Bearer <NEXT_API_OUT_SERVICES>` (voir `src/middleware.ts`). La route **session-photos** exige en plus le **`token`** du lien email (signature `PHOTO_SHARE_LINK_SECRET`).

**Guide détaillé pour le site marchand** (méthode, en-têtes, query, exemples cURL / Node, codes d’erreur) : [`services/external/README.md`](./services/external/README.md).

## 🔗 Architecture

### Flux d'authentification :
```
1. /api/auth/signin → NextAuth.js
2. /api/auth/session → Vérification session
3. /api/user → Récupération profil
```

### Flux Google Calendar :
```
1. /api/services/google → URL d'autorisation
2. /api/services/google/callback → Récupération tokens
3. /api/services/google/check-token → Vérification
4. /api/services/google/events → Opérations CRUD
```

### Flux de synchronisation :
```
1. /api/services/google/events → Récupération événements
2. /api/services/google/events/check-exists → Vérification
3. /api/services/google/events → Mise à jour/création
```

## 🔒 Sécurité

### Authentification :
- **NextAuth.js** pour la gestion des sessions
- **JWT** pour les tokens d'authentification
- **Middleware** de vérification sur les routes protégées

### Autorisation :
- **Vérification de session** sur toutes les routes sensibles
- **Validation des tokens** Google Calendar
- **Permissions utilisateur** pour les opérations CRUD

### Validation :
- **Yup schemas** pour la validation des données
- **XSS protection** sur les entrées utilisateur
- **Sanitisation** des données avant stockage

## 📋 Bonnes pratiques

### 1. **Structure des réponses**
```typescript
// Format standard des réponses
{
  success: boolean,
  data: any | null,
  error: string | null,
  feedback: string[] | null
}
```

### 2. **Gestion d'erreurs**
```typescript
try {
  // Logique métier
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error("Erreur:", error);
  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}
```

### 3. **Validation des données**
```typescript
// Validation avec Yup
const validation = await schema.validate(data);
if (validation.error) {
  return NextResponse.json(
    { success: false, feedback: validation.error.errors },
    { status: 400 }
  );
}
```

### 4. **Connexion base de données**
```typescript
// Connexion sécurisée
await connectDBOnce();
// Logique métier
```

## 🚀 Utilisation

### Exemple d'appel API :
```typescript
// Appel depuis le frontend
const response = await fetch('/api/services/google/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    refreshToken: userToken,
    event: calendarEvent,
    sessionId: sessionId
  })
});

const result = await response.json();
if (result.success) {
  console.log('Événement créé:', result.data);
} else {
  console.error('Erreur:', result.error);
}
```

### Exemple de route API :
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth";

export async function POST(req: NextRequest) {
  try {
    // Vérification authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Logique métier
    const data = await req.json();
    
    return NextResponse.json({
      success: true,
      data: result,
      feedback: ["Opération réussie"]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## 🔧 Configuration

### Variables d'environnement requises :
```env
# Google Calendar
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_nextauth_secret

# Base de données
MONGODB_URI=your_mongodb_uri

# Email
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Middleware de sécurité :
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Vérification des routes protégées
  // Redirection si non authentifié
}
``` 