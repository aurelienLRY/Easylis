# 📧 Services - Easylis

Ce dossier contient tous les services externes utilisés par l'application Easylis. Chaque service est organisé avec une séparation claire entre les opérations côté client et côté serveur.

## 📁 Structure du dossier

```
services/
├── index.ts                 # Export centralisé de tous les services
├── GoogleCalendar/          # Service d'intégration Google Calendar
│   ├── ClientSide/         # Opérations côté client
│   ├── ServerSide/         # Opérations côté serveur
│   └── index.ts           # Export du service Google Calendar
└── Mailer/                 # Service d'envoi d'emails
    ├── clientSide/         # Opérations côté client
    ├── serverSide/         # Opérations côté serveur
    ├── index.ts           # Export du service Mailer
    └── README.md          # Documentation spécifique au Mailer
```

## 🔧 Services disponibles

### 1. 📅 Google Calendar Service

Service d'intégration avec Google Calendar pour la synchronisation des sessions et événements.

#### **Côté Client** (`GoogleCalendar/ClientSide/`)

| Fichier | Description | Responsabilités |
|---------|-------------|-----------------|
| `index.ts` | Export centralisé | Export de toutes les fonctions client |
| `syncCalendar.ts` | Synchronisation | Synchronisation complète du calendrier |
| `generateEvent.ts` | Génération d'événements | Création d'objets événements Google Calendar |
| `fetcherAddEvent.ts` | Ajout d'événement | Requête API pour créer un événement |
| `fetcherUpdateEvent.ts` | Mise à jour d'événement | Requête API pour modifier un événement |
| `fetcherDeleteEvent.ts` | Suppression d'événement | Requête API pour supprimer un événement |
| `fetcherCheckToken.ts` | Vérification de token | Vérification de la validité du token OAuth |
| `fetcherRefreshToken.ts` | Rafraîchissement de token | Renouvellement du token d'accès |
| `fetcherCheckEventExists.ts` | Vérification d'existence | Vérification si un événement existe déjà |

#### **Côté Serveur** (`GoogleCalendar/ServerSide/`)

| Fichier | Description | Responsabilités |
|---------|-------------|-----------------|
| `index.ts` | Export centralisé | Export de toutes les fonctions serveur |
| `oauth2Client.ts` | Client OAuth2 | Configuration du client OAuth2 Google |
| `authUrl.ts` | URL d'autorisation | Génération de l'URL d'autorisation OAuth |
| `checkToken.ts` | Vérification de token | Vérification côté serveur du token |
| `refreshAcces.ts` | Rafraîchissement | Renouvellement du token d'accès |
| `addEvent.ts` | Ajout d'événement | Création d'événement côté serveur |
| `updateEvent.ts` | Mise à jour d'événement | Modification d'événement côté serveur |
| `deleteEvent.ts` | Suppression d'événement | Suppression d'événement côté serveur |
| `getEvent.ts` | Récupération d'événement | Récupération d'un événement spécifique |

### 2. 📧 Mailer Service

Service d'envoi d'emails avec gestion des templates et des erreurs.

#### **Côté Client** (`Mailer/clientSide/`)

| Fichier | Description | Responsabilités |
|---------|-------------|-----------------|
| `index.ts` | Export centralisé | Export des fonctions client |
| `fetcherEmail.ts` | Envoi d'email | Requête API pour envoyer un email |
| `errorHandler.ts` | Gestion d'erreurs | Gestion et affichage des erreurs d'envoi |
| `types.ts` | Types TypeScript | Définitions des types pour les emails |
| `utils.ts` | Utilitaires | Fonctions utilitaires pour les emails |

#### **Côté Serveur** (`Mailer/serverSide/`)

| Fichier | Description | Responsabilités |
|---------|-------------|-----------------|
| `index.ts` | Export centralisé | Export des fonctions serveur |
| `sender.ts` | Envoi d'emails | Logique principale d'envoi d'emails |
| `senderAPI.ts` | API d'envoi | Endpoint API pour l'envoi d'emails |

## 🚀 Utilisation

### Import des services

```typescript
// Import depuis le fichier principal
import {
  // Google Calendar
  addEvent,
  updateEvent,
  deleteEvent,
  syncCalendar,
  
  // Mailer
  sendEmail,
  EmailTemplate,
} from "@/services";

// Import spécifique d'un service
import { GoogleCalendar } from "@/services/GoogleCalendar";
import { Mailer } from "@/services/Mailer";
```

### Exemple d'utilisation Google Calendar

```typescript
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";

const MyComponent = () => {
  const { addEvent, syncCalendar } = useGoogleCalendar();
  
  const handleAddEvent = async () => {
    try {
      await addEvent({
        summary: "Nouvelle session",
        start: new Date(),
        end: new Date(),
        // ... autres propriétés
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement:", error);
    }
  };
  
  const handleSync = async () => {
    try {
      await syncCalendar();
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
    }
  };
};
```

### Exemple d'utilisation Mailer

```typescript
import { sendEmail } from "@/services/Mailer";

const handleSendEmail = async () => {
  try {
    await sendEmail({
      to: "client@example.com",
      template: "bookingRequest",
      data: {
        customerName: "John Doe",
        sessionDate: "2024-01-15",
        // ... autres données
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
  }
};
```

## 🔐 Configuration requise

### Variables d'environnement

```env
# Google Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/services/google/callback
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key

# Mailer (SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password
```

## 📋 Bonnes pratiques

### 1. **Séparation Client/Serveur**
- Utilisez toujours les fonctions côté client pour les opérations dans les composants React
- Les fonctions côté serveur sont réservées aux API routes et Server Actions

### 2. **Gestion d'erreurs**
- Toujours wrapper les appels de services dans des try/catch
- Utiliser les gestionnaires d'erreurs appropriés pour chaque service

### 3. **Performance**
- Éviter les appels multiples simultanés
- Utiliser la mise en cache quand possible
- Implémenter la pagination pour les listes volumineuses

### 4. **Sécurité**
- Ne jamais exposer les clés secrètes côté client
- Valider toutes les données d'entrée
- Utiliser les tokens d'accès de manière sécurisée

## 🔄 Workflow de développement

### Ajout d'un nouveau service

1. **Créer la structure**
   ```
   services/NewService/
   ├── ClientSide/
   ├── ServerSide/
   └── index.ts
   ```

2. **Implémenter les fonctions**
   - Côté client : fonctions d'interface utilisateur
   - Côté serveur : logique métier et API

3. **Exporter dans index.ts**
   ```typescript
   export * from "./NewService";
   ```

4. **Documenter**
   - Ajouter la documentation dans ce README
   - Créer un README spécifique si nécessaire

### Modification d'un service existant

1. **Tester les changements**
   - Vérifier la compatibilité avec les hooks existants
   - Tester les cas d'erreur

2. **Mettre à jour la documentation**
   - Modifier ce README si nécessaire
   - Mettre à jour les exemples d'utilisation

## 🐛 Dépannage

### Problèmes courants Google Calendar

- **Token expiré** : Utiliser `refreshAccessToken()`
- **Erreur de synchronisation** : Vérifier les permissions OAuth
- **Décalage horaire** : Vérifier la configuration des fuseaux horaires

### Problèmes courants Mailer

- **Erreur SMTP** : Vérifier les identifiants et la configuration
- **Template manquant** : Vérifier l'existence du template dans `Template/scenarios/`
- **Données manquantes** : Vérifier la structure des données passées au template

## 📚 Ressources

- [Documentation Google Calendar API](https://developers.google.com/calendar/api)
- [Documentation SMTP Node.js](https://nodemailer.com/)
- [Documentation NextAuth.js](https://next-auth.js.org/)

---

**Note** : Pour plus de détails sur le service Mailer, consultez le [README spécifique](./Mailer/README.md). 