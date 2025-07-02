# API de Synchronisation du Calendrier Google

## Description

Cette API permet de synchroniser les événements de la base de données avec le calendrier Google Calendar. Elle assure la cohérence entre les sessions validées et les événements Google Calendar.

## Endpoint

```
POST /api/services/google/sync-calendar
```

## Authentification

L'utilisateur doit être connecté et avoir un token Google Calendar valide.

## Fonctionnalités

### 1. Nettoyage des Événements Orphelins
- Identifie les sessions non validées qui ont des événements en base de données
- Supprime les événements correspondants sur Google Calendar
- Supprime les événements de la base de données

### 2. Synchronisation des Sessions Validées
- Pour chaque session validée, vérifie si un événement existe en base de données
- Si l'événement existe :
  - Vérifie s'il est présent sur Google Calendar
  - Si absent : le recrée sur Google Calendar
  - Si présent : met à jour les informations
- Si l'événement n'existe pas :
  - Crée l'événement sur Google Calendar
  - Enregistre l'événement en base de données

## Réponse

```typescript
interface SyncResult {
  success: boolean;
  data: {
    validatedSessions: number;    // Nombre de sessions validées
    eventsCreated: number;        // Nombre d'événements créés
    eventsUpdated: number;        // Nombre d'événements mis à jour
    eventsDeleted: number;        // Nombre d'événements supprimés
    errors: string[];             // Liste des erreurs rencontrées
  };
  error: string | null;
  feedback: string[] | null;
}
```

## Exemple d'Utilisation

```javascript
// Appel de l'API
const response = await fetch('/api/services/google/sync-calendar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const result = await response.json();

if (result.success) {
  console.log(`Synchronisation terminée:
    - Sessions validées: ${result.data.validatedSessions}
    - Événements créés: ${result.data.eventsCreated}
    - Événements mis à jour: ${result.data.eventsUpdated}
    - Événements supprimés: ${result.data.eventsDeleted}
  `);
  
  if (result.data.errors.length > 0) {
    console.log('Erreurs rencontrées:', result.data.errors);
  }
}
```

## Gestion des Erreurs

L'API gère automatiquement :
- L'expiration des tokens Google Calendar (rafraîchissement automatique)
- Les erreurs de connexion à Google Calendar
- Les erreurs de base de données
- Les sessions invalides

## Logs

L'API génère des logs détaillés pour :
- Les opérations de synchronisation
- Les erreurs rencontrées
- Les tokens expirés et rafraîchis

## Sécurité

- Vérification de l'authentification utilisateur
- Validation des tokens Google Calendar
- Gestion sécurisée des tokens d'accès 