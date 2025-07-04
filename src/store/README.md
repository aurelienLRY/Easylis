# Stores - Documentation

Ce dossier contient tous les stores Zustand de l'application Easylis pour la gestion de l'état global.

## 📁 Structure du dossier

```
store/
├── index.ts                    # Export centralisé de tous les stores
├── calendar.store.ts          # Gestion de l'état Google Calendar
├── profile.store.ts           # Gestion du profil utilisateur
├── sessions.store.ts          # Gestion des sessions (données de base)
├── sessionWithDetails.store.ts # Gestion des sessions avec détails
├── activities.store.ts        # Gestion des activités
├── spots.store.ts             # Gestion des lieux d'activités
├── customerSessions.store.ts  # Gestion des réservations clients
└── README.md                  # Documentation des stores
```

## 📁 Structure des Stores

### 📅 `calendar.store.ts`
**Fonction :** Gestion de l'état de connexion Google Calendar
- **Responsabilités :**
  - État de validité du token Google Calendar
  - Gestion automatique du rafraîchissement des tokens
  - Initialisation de la connexion Google Calendar
  - Vérification périodique de la validité des tokens
- **État :**
  - `tokenIsValid: boolean` - Le token est-il valide ?
  - `expiryDate: number` - Date d'expiration du token
  - `lastCheck: number` - Dernière vérification
  - `isInitialized: boolean` - Store initialisé ?
  - `isLoading: boolean` - En cours de chargement
- **Actions :**
  - `initialize()` - Initialiser le store
  - `checkToken()` - Vérifier la validité du token
  - `refreshToken()` - Rafraîchir le token
  - `checkTokenValidity()` - Vérification automatique
- **Utilisé dans :** `Calendar.modules.tsx`, `dashboard/template.tsx`

### 👤 `profile.store.ts`
**Fonction :** Gestion du profil utilisateur
- **Responsabilités :**
  - Données du profil utilisateur
  - Tokens Google Calendar
  - Informations personnelles (nom, email, avatar)
- **État :**
  - `profile: IUser | null` - Profil utilisateur
  - `lastFetch: number` - Dernière récupération
- **Actions :**
  - `fetchProfile()` - Récupérer le profil
  - `updateProfile()` - Mettre à jour le profil
- **Utilisé dans :** `Header.layout.tsx`, `Account.page.tsx`, `useGoogleCalendar.ts`

### 📋 `sessions.store.ts`
**Fonction :** Gestion des sessions (données de base)
- **Responsabilités :**
  - Liste des sessions sans détails
  - Cache des sessions
  - Opérations CRUD sur les sessions
- **État :**
  - `sessions: ISession[]` - Liste des sessions
  - `lastFetch: number` - Dernière récupération
- **Actions :**
  - `fetchSessions()` - Récupérer les sessions
  - `addSessions()` - Ajouter une session
  - `updateSessions()` - Mettre à jour une session
  - `deleteSessions()` - Supprimer une session
- **Utilisé dans :** Composants nécessitant les sessions de base

### 📊 `sessionWithDetails.store.ts`
**Fonction :** Gestion des sessions avec détails complets
- **Responsabilités :**
  - Sessions avec activités, lieux et clients
  - Données complètes pour l'affichage
  - Cache avec durée de vie
- **État :**
  - `SessionWithDetails: ISessionWithDetails[]` - Sessions avec détails
  - `lastFetch: number` - Dernière récupération
- **Actions :**
  - `fetchSessionWithDetails()` - Récupérer les sessions avec détails
  - `updateSessionWithDetails()` - Mettre à jour une session
  - `addSessionWithDetails()` - Ajouter une session
  - `deleteSessionWithDetails()` - Supprimer une session
- **Utilisé dans :** `Dashboard`, `SessionCard.tsx`, `useGoogleCalendar.ts`

### 🏢 `activities.store.ts`
**Fonction :** Gestion des activités
- **Responsabilités :**
  - Liste des activités disponibles
  - Cache des activités
  - Opérations CRUD sur les activités
- **État :**
  - `activities: IActivity[]` - Liste des activités
  - `lastFetch: number` - Dernière récupération
- **Actions :**
  - `fetchActivities()` - Récupérer les activités
  - `addActivities()` - Ajouter une activité
  - `updateActivities()` - Mettre à jour une activité
  - `deleteActivities()` - Supprimer une activité
- **Utilisé dans :** `ActivityCard.tsx`, `Session.form.tsx`

### 📍 `spots.store.ts`
**Fonction :** Gestion des lieux d'activités
- **Responsabilités :**
  - Liste des lieux disponibles
  - Coordonnées GPS des lieux
  - Opérations CRUD sur les lieux
- **État :**
  - `spots: ISpot[]` - Liste des lieux
  - `lastFetch: number` - Dernière récupération
- **Actions :**
  - `fetchSpots()` - Récupérer les lieux
  - `addSpots()` - Ajouter un lieu
  - `updateSpots()` - Mettre à jour un lieu
  - `deleteSpots()` - Supprimer un lieu
- **Utilisé dans :** `SpotCard.tsx`, `Session.form.tsx`, `MapCustomer.tsx`

### 👥 `customerSessions.store.ts`
**Fonction :** Gestion des réservations clients
- **Responsabilités :**
  - Liste des réservations clients
  - Statuts des réservations
  - Opérations CRUD sur les réservations
- **État :**
  - `customerSessions: ICustomerSession[]` - Liste des réservations
  - `lastFetch: number` - Dernière récupération
- **Actions :**
  - `fetchCustomerSessions()` - Récupérer les réservations
  - `addCustomerSessions()` - Ajouter une réservation
  - `updateCustomerSessions()` - Mettre à jour une réservation
  - `deleteCustomerSessions()` - Supprimer une réservation
- **Utilisé dans :** `CustomerCard.tsx`, `BookingPage.tsx`

## 🔗 Architecture

### Dépendances entre stores :
```
profile.store.ts
    ↓ (tokens Google Calendar)
calendar.store.ts

sessions.store.ts
    ↓ (données de base)
sessionWithDetails.store.ts
    ↓ (sessions complètes)
useGoogleCalendar.ts
```

### Cache et performance :
- **Durée de cache :** 5 minutes par défaut
- **Récupération automatique :** Si données expirées ou vides
- **Optimisation :** Évite les appels API inutiles

## 📋 Bonnes pratiques

1. **Séparation des responsabilités :** Chaque store gère un domaine spécifique
2. **Cache intelligent :** Durée de vie configurable pour chaque store
3. **Actions atomiques :** Chaque action a une responsabilité claire
4. **Gestion d'erreurs :** Tous les stores incluent une gestion d'erreurs
5. **DevTools :** Tous les stores utilisent les devtools Zustand pour le debug

## 🚀 Utilisation

```typescript
// Exemple d'utilisation d'un store
import { useSessionWithDetails } from "@/store";

const MyComponent = () => {
  const { SessionWithDetails, fetchSessionWithDetails } = useSessionWithDetails();
  
  useEffect(() => {
    fetchSessionWithDetails();
  }, []);
  
  return (
    <div>
      {SessionWithDetails.map(session => (
        <SessionCard key={session._id} session={session} />
      ))}
    </div>
  );
};
```

## 🔧 Configuration

### Cache duration :
```typescript
// Dans chaque store
const cacheDuration = 5 * 60 * 1000; // 5 minutes
```

### DevTools :
```typescript
// Tous les stores utilisent
devtools(
  (set, get) => ({
    // ... store logic
  }),
  { name: "StoreName" }
)
``` 