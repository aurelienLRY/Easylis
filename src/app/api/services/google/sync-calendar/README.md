# Route de Synchronisation Google Calendar - Documentation

## 📋 Vue d'ensemble

Cette route synchronise les événements entre la base de données locale et Google Calendar. Elle utilise les services existants du dossier `ServerSide` et la fonction `generateEvent` du dossier `ClientSide`.

## 🔧 Services utilisés

### Services ServerSide
- `checkToken` : Vérification de la validité d'un token
- `refreshAccessToken` : Rafraîchissement d'un token expiré
- `getEvent` : Récupération des événements Google Calendar
- `addEvent` : Ajout d'un événement sur Google Calendar
- `updateEvent` : Mise à jour d'un événement sur Google Calendar
- `deleteEvent` : Suppression d'un événement sur Google Calendar

### Services ClientSide
- `generateEvent` : Génération d'un objet événement à partir d'une session

## 🏗️ Architecture factorisée

### Fonctions utilitaires

#### `checkUserGoogleToken(userId: string)`
- Vérifie si l'utilisateur a un token Google Calendar valide
- Utilise `checkToken` pour valider le token actuel
- Utilise `refreshAccessToken` si le token est expiré
- Met à jour les tokens en base de données

#### `generateGoogleEvent(session: ISessionWithDetails)`
- Wrapper autour de `generateEvent` du dossier ClientSide
- Génère un objet événement formaté pour Google Calendar
- Inclut les rappels, la localisation et les détails des participants

#### `checkEventExistsOnGoogle(credentials, eventId)`
- Vérifie si un événement existe sur Google Calendar
- Utilise `getEvent` pour récupérer la liste des événements
- Compare les IDs pour déterminer l'existence

#### `deleteOrphanEvent(credentials, session, errors)`
- Supprime un événement orphelin (session invalide)
- Supprime l'événement sur Google Calendar et en base de données
- Gère les erreurs et les ajoute au tableau d'erreurs

#### `syncExistingEvent(credentials, session, event, errors)`
- Synchronise un événement existant
- Recrée l'événement sur Google si nécessaire
- Met à jour l'événement existant
- Retourne le nombre d'événements mis à jour/créés

#### `createNewEvent(credentials, session, errors)`
- Crée un nouvel événement
- Utilise `generateGoogleEvent` et `addEvent`
- Enregistre l'événement en base de données
- Retourne 1 si succès, 0 sinon

## 🔄 Flux de synchronisation

### 1. Vérification des prérequis
- Authentification de l'utilisateur
- Vérification des tokens Google Calendar
- Récupération des sessions avec détails

### 2. Nettoyage des événements orphelins
- Parcours des sessions invalides (status !== "Actif")
- Suppression des événements correspondants sur Google et en BD

### 3. Synchronisation des sessions valides
- Parcours des sessions actives
- Pour chaque session :
  - Si événement existe en BD → synchronisation
  - Si événement n'existe pas → création

## 📊 Retour de données

```typescript
interface SyncResult {
  success: boolean;
  data: {
    validatedSessions: number;  // Nombre de sessions valides
    eventsCreated: number;      // Événements créés
    eventsUpdated: number;      // Événements mis à jour
    eventsDeleted: number;      // Événements supprimés
    errors: string[];           // Liste des erreurs
  };
  error: string | null;
  feedback: string[] | null;
}
```

## 🛡️ Gestion d'erreurs

- **Erreurs de token** : Tentative de rafraîchissement automatique
- **Erreurs de synchronisation** : Collecte dans un tableau d'erreurs
- **Erreurs individuelles** : N'arrêtent pas le processus global
- **Logs détaillés** : Pour le debugging

## 🚀 Avantages de la factorisation

1. **Réutilisabilité** : Utilisation des services existants
2. **Maintenabilité** : Code modulaire et lisible
3. **Cohérence** : Même logique de génération d'événements
4. **Robustesse** : Gestion d'erreurs centralisée
5. **Performance** : Fonctions optimisées et spécialisées
6. **Testabilité** : Fonctions unitaires facilement testables

## 📝 Exemple d'utilisation

```typescript
// Appel de la route
const response = await fetch('/api/services/google/sync-calendar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

const result = await response.json();
console.log(`Synchronisation: ${result.data.eventsCreated} créés, ${result.data.eventsUpdated} mis à jour, ${result.data.eventsDeleted} supprimés`);
``` 