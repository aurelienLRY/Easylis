# Hooks - Documentation

Ce dossier contient tous les hooks personnalisés de l'application Easylis.

## 📁 Structure du dossier

```
hooks/
├── index.ts                 # Export centralisé de tous les hooks
├── useAuth.ts              # Gestion de l'authentification
├── useGoogleCalendar.ts    # Opérations Google Calendar
├── useCustomer.ts          # Gestion des clients et réservations
├── useMailer.ts            # Gestion des emails et notifications
├── useMobile.ts            # Détection et gestion mobile
├── useModal.ts             # Gestion des modales et popups
└── README.md               # Documentation des hooks
```

## 📁 Structure des Hooks

### 🔐 `useAuth.ts`
**Fonction :** Gestion de l'authentification utilisateur
- **Responsabilités :**
  - Vérification du statut de connexion
  - Gestion de la session utilisateur
  - Redirection automatique si non connecté
- **Utilisé dans :** Composants nécessitant une authentification

### 📅 `useGoogleCalendar.ts`
**Fonction :** Gestion des opérations Google Calendar
- **Responsabilités :**
  - Opérations CRUD sur les événements Google Calendar
  - Synchronisation du calendrier
  - Génération d'événements à partir des sessions
  - États de chargement pour chaque opération
- **Fonctions principales :**
  - `addEvent()` - Créer un événement
  - `updateEvent()` - Modifier un événement
  - `deleteEvent()` - Supprimer un événement
  - `syncCalendar()` - Synchroniser tout le calendrier
  - `checkEventExists()` - Vérifier si un événement existe
  - `generateEventFromSession()` - Générer un événement depuis une session
- **Utilisé dans :** `Session.form.tsx`, `CustomerCard.tsx`, `Calendar.modules.tsx`

### 👥 `useCustomer.ts`
**Fonction :** Gestion des clients et réservations
- **Responsabilités :**
  - Ajout, modification, suppression de clients
  - Gestion des statuts de réservation (Validé, Annulé, En attente)
  - Synchronisation avec Google Calendar lors des changements
  - Envoi d'emails automatiques
- **Fonctions principales :**
  - `addCustomer()` - Ajouter un client
  - `updateCustomer()` - Modifier un client
  - `cancelCustomer()` - Annuler un client
  - `deleteCustomer()` - Supprimer un client
- **Utilisé dans :** `CustomerSession.form.tsx`, `CustomerCard.tsx`

### 📧 `useMailer.ts`
**Fonction :** Gestion des emails et notifications
- **Responsabilités :**
  - Préparation et envoi d'emails
  - Gestion des templates d'emails
  - File d'attente des emails
  - Éditeur de templates d'emails
- **Fonctions principales :**
  - `sendEmail()` - Envoyer un email
  - `prepareEmail()` - Préparer un email
  - `queueEmail()` - Ajouter un email à la file d'attente
  - `processNextEmail()` - Traiter le prochain email
- **Utilisé dans :** `EmailPage`, `useCustomer.ts`, `Session.form.tsx`

### 📱 `useMobile.ts`
**Fonction :** Détection et gestion de l'affichage mobile
- **Responsabilités :**
  - Détection de la taille d'écran
  - Adaptation de l'interface pour mobile
  - Gestion du responsive design
- **Utilisé dans :** Composants nécessitant une adaptation mobile

### 🪟 `useModal.ts`
**Fonction :** Gestion des modales et popups
- **Responsabilités :**
  - Ouverture/fermeture de modales
  - Gestion de l'état des modales
  - Animation et transitions
- **Fonctions principales :**
  - `openModal()` - Ouvrir une modale
  - `closeModal()` - Fermer une modale
  - `isOpen` - État d'ouverture
- **Utilisé dans :** Composants avec modales (formulaires, détails)

## 🔗 Dépendances

### Stores utilisés :
- `useSessionWithDetails` - Données des sessions
- `useProfile` - Profil utilisateur et tokens Google Calendar

### Services utilisés :
- `@/services/GoogleCalendar/ClientSide` - Opérations Google Calendar
- `@/services/Mailer` - Envoi d'emails

## 📋 Bonnes pratiques

1. **Séparation des responsabilités :** Chaque hook a une responsabilité spécifique
2. **Réutilisabilité :** Les hooks sont conçus pour être réutilisables
3. **États de chargement :** Chaque hook gère ses propres états de chargement
4. **Gestion d'erreurs :** Tous les hooks incluent une gestion d'erreurs appropriée
5. **Documentation :** Chaque fonction est documentée avec JSDoc

## 🚀 Utilisation

```typescript
// Exemple d'utilisation d'un hook
import { useGoogleCalendar } from "@/hooks";

const MyComponent = () => {
  const { syncCalendar, isSyncing } = useGoogleCalendar();
  
  const handleSync = async () => {
    const result = await syncCalendar();
    if (result.success) {
      console.log("Synchronisation réussie");
    }
  };
  
  return (
    <button onClick={handleSync} disabled={isSyncing}>
      Synchroniser
    </button>
  );
};
``` 