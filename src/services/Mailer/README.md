# Mailer - Système d'envoi d'emails

Ce dossier contient le système complet d'envoi d'emails pour l'application Easylis, utilisant Nodemailer avec des templates personnalisés.

## 📁 Structure du dossier

```
src/services/Mailer/
├── README.md                 # Ce fichier de documentation
├── index.ts                  # Point d'entrée principal
├── sender.ts                 # Envoi d'emails pour Server Actions
├── senderAPI.ts              # Envoi d'emails pour API Routes
└── clientSide/               # Modules côté client
    ├── index.ts              # Point d'entrée côté client
    ├── fetcherEmail.ts       # Fonctions de récupération d'emails
    ├── errorHandler.ts       # Gestionnaire d'erreurs
    ├── types.ts              # Types TypeScript
    └── Template/             # Système de templates d'emails
        ├── index.ts          # Point d'entrée des templates
        ├── base.template.ts  # Template de base HTML
        ├── constants.ts      # Constantes des scénarios
        ├── types.ts          # Types TypeScript
        ├── utils.ts          # Utilitaires
        └── scenarios/        # Scénarios d'emails spécifiques
            ├── index.ts      # Export des scénarios
            ├── addCustomer.template.ts
            ├── updateCustomer.template.ts
            ├── cancelCustomer.template.ts
            ├── updateSession.template.ts
            └── bookingRequest.template.ts

src/hooks/
└── useMailer.ts              # Hook Zustand pour la gestion des emails
```

## 🚀 Utilisation

### 1. Server Actions (côté client)

```typescript
import { nodeMailerSender } from "@/services/Mailer";

// Envoi d'un email simple
const success = await nodeMailerSender(
  "client@example.com",
  "Sujet de l'email",
  "<h1>Contenu HTML</h1>"
);
```

### 2. API Routes (côté serveur)

```typescript
import { nodeMailerSenderAPI } from "@/services/Mailer";

// Envoi d'un email depuis une API route
const success = await nodeMailerSenderAPI(
  "client@example.com",
  "Sujet de l'email",
  "<h1>Contenu HTML</h1>"
);
```

### 3. Templates avec scénarios

```typescript
import { emailScenarios, generateEmail } from "@/services/Mailer";

// Génération d'un email avec template
const emailContent = generateEmail(emailScenarios.BOOKING_REQUEST, {
  customer: customerData,
  session: sessionData,
  profile_from: userData
});

// Envoi avec le template généré
await nodeMailerSenderAPI(customer.email, emailScenarios.BOOKING_REQUEST.subject, emailContent);
```

### 4. Hook useMailer (Interface utilisateur)

```typescript
import { useMailer } from "@/hooks/useMailer";

// Dans un composant React
const mailer = useMailer();

// Préparer un email avec template
mailer.prepareEmail(EMAIL_SCENARIOS.BOOKING_REQUEST, {
  customer: customerData,
  session: sessionData,
  profile_from: userData
});

// Envoyer l'email
await mailer.sendEmail();

// Gérer une file d'attente d'emails
mailer.setQueuedEmails([
  { scenario: EMAIL_SCENARIOS.ADD_CUSTOMER, data: data1 },
  { scenario: EMAIL_SCENARIOS.UPDATE_CUSTOMER, data: data2 }
]);

// Traiter le prochain email
mailer.processNextEmail();
```

## 📧 Scénarios d'emails disponibles

### 1. `BOOKING_REQUEST`
- **Sujet** : "Occitanie Évasion - 🎉​​ Demande de réservation reçue 🎉​​"
- **Usage** : Confirmation de demande de réservation
- **Données requises** : `customer`, `session`, `profile_from`

### 2. `ADD_CUSTOMER`
- **Sujet** : "Occitanie Évasion - 🎉​​ Confirmation de votre réservation 🎉​​"
- **Usage** : Confirmation d'ajout d'un client
- **Données requises** : `customer`, `session`, `profile_from`

### 3. `UPDATE_CUSTOMER`
- **Sujet** : "Occitanie Évasion - 🧐 Modification de votre réservation 🧐"
- **Usage** : Notification de modification de réservation
- **Données requises** : `customer`, `session`, `profile_from`

### 4. `CANCEL_CUSTOMER`
- **Sujet** : "Occitanie Évasion - 🙄 Annulation de votre réservation 🙄"
- **Usage** : Notification d'annulation
- **Données requises** : `customer`, `session`, `profile_from`

### 5. `UPDATE_SESSION`
- **Sujet** : "Occitanie Évasion - 🧐 Modification de votre session 🧐"
- **Usage** : Notification de modification de session
- **Données requises** : `customer`, `session`, `profile_from`

## ⚙️ Configuration SMTP

### Variables d'environnement requises

```env
# Configuration SMTP
SMTP_HOST="smtp.gmail.com"           # Serveur SMTP
SMTP_PORT=465                        # Port SMTP (465 pour SSL, 587 pour TLS)
SMTP_SECURE=true                     # Utiliser SSL/TLS
SMTP_EMAIL="votre@email.com"         # Email d'envoi
SMTP_PASSWORD="votre_mot_de_passe"   # Mot de passe de l'email
```

### Configuration recommandée

#### Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_EMAIL="votre@email.com"
SMTP_PASSWORD="votre_mot_de_passe"
```

#### Serveur SMTP personnalisé
```env
SMTP_HOST="votre-serveur-smtp.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_EMAIL="votre@email.com"
SMTP_PASSWORD="votre_mot_de_passe"
```

## 🔧 Fonctions principales

### `nodeMailerSender(email, subject, html)`
- **Usage** : Server Actions uniquement
- **Retour** : `Promise<boolean>`
- **Fichier** : `sender.ts`

### `nodeMailerSenderAPI(email, subject, html)`
- **Usage** : API Routes uniquement
- **Retour** : `Promise<boolean>`
- **Fichier** : `senderAPI.ts`

### `generateEmail(scenario, data)`
- **Usage** : Génération de contenu HTML avec template
- **Retour** : `string` (HTML)
- **Fichier** : `clientSide/Template/index.ts`

### `useMailer()` (Hook Zustand)
- **Usage** : Gestion des emails côté client avec interface utilisateur
- **Retour** : `MailerStore` (objet avec méthodes et état)
- **Fichier** : `src/hooks/useMailer.ts`
- **Fonctionnalités** :
  - Éditeur d'email intégré
  - File d'attente d'emails
  - Gestion des templates
  - Notifications toast

## 📝 Types TypeScript

### `ITemplateData`
```typescript
interface ITemplateData {
  customer: ICustomerSession;
  session: ISessionWithDetails;
  profile_from: IUser;
}
```

### `IEmailScenario`
```typescript
interface IEmailScenario {
  scenario: EmailScenarioType;
  subject: string;
  template: (data: ITemplateData) => IEmailTemplateData;
}
```

### `MailerStore` (Hook useMailer)
```typescript
interface MailerStore {
  // État
  isSubmitting: boolean;
  isEditorOpen: boolean;
  initialEmailContent: string;
  currentEmailContent: string;
  queuedEmails: QueuedEmail[];
  emailData: { to: string; subject: string } | null;

  // Méthodes
  openEditor: () => void;
  closeEditor: () => void;
  handleEmailContent: (content: string) => void;
  prepareEmail: (scenario: EmailScenarioType, data: ITemplateData) => void;
  sendEmail: () => Promise<boolean>;
  setQueuedEmails: (emails: QueuedEmail[]) => void;
  processNextEmail: () => boolean;
  onClose: () => void;
}
```

## 🎨 Personnalisation et utilisation avancée

### Créer un nouveau scénario

1. **Créer le template** dans `clientSide/Template/scenarios/`
```typescript
// nouveauTemplate.template.ts
export const nouveauTemplate = (data: ITemplateData): IEmailTemplateData => ({
  title: "Nouveau titre",
  content: `<p>Bonjour ${data.customer.first_names}...</p>`,
  buttonText: "Action",
  buttonUrl: "https://example.com",
  profile_from: data.profile_from
});
```

2. **Ajouter la constante** dans `clientSide/Template/constants.ts`
```typescript
export const EMAIL_SCENARIOS = {
  // ... autres scénarios
  NOUVEAU_SCENARIO: "NOUVEAU_SCENARIO",
} as const;
```

3. **Enregistrer le scénario** dans `clientSide/Template/scenarios/index.ts`
```typescript
export const emailScenarios: Record<string, IEmailScenario> = {
  // ... autres scénarios
  [EMAIL_SCENARIOS.NOUVEAU_SCENARIO]: {
    scenario: EMAIL_SCENARIOS.NOUVEAU_SCENARIO,
    subject: "Nouveau sujet",
    template: nouveauTemplate,
  },
};
```

### Utilisation du hook useMailer dans un composant

```typescript
import { useMailer } from "@/hooks/useMailer";
import { EMAIL_SCENARIOS } from "@/services/Mailer";

const MyComponent = () => {
  const mailer = useMailer();

  const handleSendEmail = async () => {
    // Préparer l'email avec template
    mailer.prepareEmail(EMAIL_SCENARIOS.BOOKING_REQUEST, {
      customer: customerData,
      session: sessionData,
      profile_from: userData
    });

    // L'éditeur s'ouvre automatiquement
    // L'utilisateur peut modifier le contenu
    // Puis cliquer sur "Envoyer"
  };

  const handleBatchEmails = () => {
    // Créer une file d'attente d'emails
    const emailsToSend = [
      { scenario: EMAIL_SCENARIOS.ADD_CUSTOMER, data: data1 },
      { scenario: EMAIL_SCENARIOS.UPDATE_CUSTOMER, data: data2 },
      { scenario: EMAIL_SCENARIOS.CANCEL_CUSTOMER, data: data3 }
    ];

    mailer.setQueuedEmails(emailsToSend);
    mailer.processNextEmail(); // Commence le traitement
  };

  return (
    <div>
      <button onClick={handleSendEmail}>Envoyer un email</button>
      <button onClick={handleBatchEmails}>Envoyer plusieurs emails</button>
    </div>
  );
};
```

## 🐛 Dépannage

### Erreur "No recipients defined"
- **Cause** : Email du destinataire manquant ou invalide
- **Solution** : Vérifier que l'email est défini et non vide

### Erreur "Le serveur SMTP n'est pas disponible"
- **Cause** : Configuration SMTP incorrecte
- **Solution** : Vérifier les variables d'environnement SMTP

### Erreur "use server" dans API Routes
- **Cause** : Utilisation de `nodeMailerSender` dans une API Route
- **Solution** : Utiliser `nodeMailerSenderAPI` pour les API Routes

### Problèmes avec useMailer
- **Cause** : État du hook non synchronisé
- **Solution** : Vérifier que le hook est utilisé dans un composant React valide
- **Cause** : Éditeur qui ne s'ouvre pas
- **Solution** : S'assurer que `EmailTemplateEditor` est rendu dans le template

## 📋 Bonnes pratiques

1. **Validation** : Toujours valider l'email avant envoi
2. **Gestion d'erreurs** : Capturer et logger les erreurs d'envoi
3. **Templates** : Utiliser les templates pour la cohérence
4. **Tests** : Tester avec des emails de développement
5. **Sécurité** : Ne jamais exposer les credentials SMTP côté client
6. **Interface utilisateur** : Utiliser `useMailer` pour les interactions utilisateur
7. **File d'attente** : Gérer les envois multiples avec `setQueuedEmails`
8. **Éditeur** : Permettre la modification du contenu avant envoi

## 🔗 Liens utiles

- [Documentation Nodemailer](https://nodemailer.com/)
- [Configuration SMTP Gmail](https://support.google.com/mail/answer/7126229)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

# Système de Mailer Amélioré - Documentation

## 📧 Vue d'ensemble

Le système de mailer a été considérablement amélioré pour fournir un feedback utilisateur détaillé et une gestion d'erreurs avancée. Il permet maintenant de :

- **Détecter précisément les types d'erreurs** (adresse invalide, serveur indisponible, etc.)
- **Fournir des messages utilisateur conviviaux** selon le type d'erreur
- **Gérer les tentatives automatiques** pour les erreurs récupérables
- **Afficher des détails techniques** en mode développement
- **Tracer les statistiques d'envoi** pour le debugging

## 🏗️ Architecture

### Types d'erreurs supportés

```typescript
enum EmailErrorType {
  // Erreurs de configuration SMTP
  SMTP_CONFIGURATION = "SMTP_CONFIGURATION",
  SMTP_CONNECTION = "SMTP_CONNECTION", 
  SMTP_AUTHENTICATION = "SMTP_AUTHENTICATION",
  
  // Erreurs d'adresse email
  INVALID_EMAIL = "INVALID_EMAIL",
  EMAIL_NOT_FOUND = "EMAIL_NOT_FOUND",
  EMAIL_BLOCKED = "EMAIL_BLOCKED",
  
  // Erreurs de contenu
  INVALID_SUBJECT = "INVALID_SUBJECT",
  INVALID_CONTENT = "INVALID_CONTENT",
  CONTENT_TOO_LARGE = "CONTENT_TOO_LARGE",
  
  // Erreurs de serveur
  SERVER_ERROR = "SERVER_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  
  // Erreurs génériques
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  TIMEOUT = "TIMEOUT"
}
```

### Structure de réponse

```typescript
interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: EmailError;
  recipient: string;
  subject: string;
  timestamp: Date;
  retryCount?: number;
}

interface EmailError {
  type: EmailErrorType;
  message: string;
  code?: string | number;
  details?: string;
  retryable: boolean;
}
```

## 🚀 Utilisation

### Envoi d'email avec gestion d'erreurs

```typescript
import { nodeMailerSender } from "@/services/Mailer";

const result = await nodeMailerSender(
  "destinataire@example.com",
  "Sujet de l'email",
  "<h1>Contenu HTML</h1>"
);

if (result.success) {
  console.log("✅ Email envoyé:", result.messageId);
} else {
  console.error("❌ Erreur:", result.error);
}
```

### Utilisation avec le hook useMailer

```typescript
import { useMailer } from "@/hooks/useMailer";

const { sendEmail, getLastSendResult } = useMailer();

const handleSend = async () => {
  const success = await sendEmail();
  
  if (!success) {
    const result = getLastSendResult();
    // Afficher les détails de l'erreur
    console.log("Détails de l'erreur:", result);
  }
};
```

### Affichage des erreurs avec EmailErrorDisplay

```typescript
import { EmailErrorDisplay } from "@/components/feedback/EmailErrorDisplay.feedback";

const MyComponent = () => {
  const { getLastSendResult, sendEmail } = useMailer();
  const result = getLastSendResult();

  return (
    <div>
      <button onClick={sendEmail}>Envoyer</button>
      
      {result && !result.success && (
        <EmailErrorDisplay 
          result={result}
          onRetry={sendEmail}
          onClose={() => {/* fermer l'affichage */}}
        />
      )}
    </div>
  );
};
```

## 🔧 Configuration

### Configuration du mailer

```typescript
const config: MailerConfig = {
  maxRetries: 3,           // Nombre max de tentatives
  retryDelay: 2000,        // Délai entre tentatives (ms)
  timeout: 30000,          // Timeout de connexion (ms)
  enableLogging: true      // Activer les logs
};

const result = await nodeMailerSender(email, subject, html, config);
```

### Variables d'environnement requises

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_EMAIL=votre-email@example.com
SMTP_PASSWORD=votre-mot-de-passe
```

## 📊 Gestion des erreurs

### Types d'erreurs et actions recommandées

| Type d'erreur | Retentable | Action recommandée |
|---------------|------------|-------------------|
| `INVALID_EMAIL` | ❌ | Demander à l'utilisateur de corriger l'adresse |
| `EMAIL_NOT_FOUND` | ❌ | Vérifier l'adresse avec l'utilisateur |
| `EMAIL_BLOCKED` | ❌ | Contacter le destinataire |
| `SMTP_CONNECTION` | ✅ | Réessayer automatiquement |
| `RATE_LIMIT` | ✅ | Attendre et réessayer |
| `QUOTA_EXCEEDED` | ✅ | Attendre le lendemain |
| `TIMEOUT` | ✅ | Réessayer automatiquement |

### Messages utilisateur automatiques

Le système génère automatiquement des messages conviviaux selon le type d'erreur :

- **Adresse invalide** : "L'adresse email saisie n'est pas valide. Veuillez vérifier et réessayer."
- **Email introuvable** : "Cette adresse email n'existe pas ou n'est pas accessible. Veuillez vérifier l'adresse."
- **Connexion SMTP** : "Problème de connexion au serveur d'envoi. Réessayez dans quelques minutes."
- **Quota dépassé** : "Limite d'envoi d'emails atteinte. Réessayez demain."

## 🎯 Fonctionnalités avancées

### Validation automatique des adresses

Le système valide automatiquement le format des adresses email avant l'envoi :

```typescript
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### Tentatives automatiques

Pour les erreurs récupérables, le système effectue automatiquement plusieurs tentatives :

```typescript
// Configuration par défaut
const defaultConfig = {
  maxRetries: 3,        // 3 tentatives maximum
  retryDelay: 2000,     // 2 secondes entre chaque tentative
  timeout: 30000        // 30 secondes de timeout
};
```

### Logging détaillé

En mode développement, le système génère des logs détaillés :

```typescript
// Succès
console.log("✅ Email envoyé avec succès:", {
  recipient: result.recipient,
  subject: result.subject,
  messageId: result.messageId,
  timestamp: result.timestamp,
  retryCount: result.retryCount
});

// Erreur
console.error("❌ Échec d'envoi email:", {
  recipient: result.recipient,
  subject: result.subject,
  error: result.error,
  timestamp: result.timestamp,
  retryCount: result.retryCount
});
```

## 🔄 Migration depuis l'ancien système

### Ancien code (déprécié)

```typescript
const success = await nodeMailerSender(email, subject, html);
if (success) {
  console.log("Email envoyé");
} else {
  console.log("Erreur d'envoi");
}
```

### Nouveau code (recommandé)

```typescript
const result = await nodeMailerSender(email, subject, html);
if (result.success) {
  console.log("✅ Email envoyé:", result.messageId);
} else {
  console.error("❌ Erreur:", result.error.message);
}
```

### Compatibilité

Pour maintenir la compatibilité, une version simplifiée est disponible :

```typescript
import { nodeMailerSenderSimple } from "@/services/Mailer";

// Retourne toujours un boolean (comme l'ancien système)
const success = await nodeMailerSenderSimple(email, subject, html);
```

## 🧪 Tests

### Test des différents types d'erreurs

```typescript
// Test avec une adresse invalide
const result1 = await nodeMailerSender("invalid-email", "Test", "Content");
console.log(result1.error?.type); // INVALID_EMAIL

// Test avec une adresse inexistante
const result2 = await nodeMailerSender("nonexistent@example.com", "Test", "Content");
console.log(result2.error?.type); // EMAIL_NOT_FOUND

// Test avec une adresse valide
const result3 = await nodeMailerSender("valid@example.com", "Test", "Content");
console.log(result3.success); // true
```

## 📈 Statistiques et monitoring

Le système fournit des informations détaillées pour le monitoring :

- **Message ID** : Identifiant unique de l'email envoyé
- **Timestamp** : Heure exacte de l'envoi
- **Retry count** : Nombre de tentatives effectuées
- **Error details** : Détails techniques de l'erreur (en développement)

## 🔒 Sécurité

- **Validation des entrées** : Toutes les adresses email sont validées
- **Timeout configurable** : Évite les blocages de connexion
- **Logs sécurisés** : Les mots de passe ne sont jamais loggés
- **Gestion des erreurs** : Aucune information sensible n'est exposée aux utilisateurs

## 🚀 Améliorations futures

- [ ] Interface de monitoring des emails
- [ ] Templates d'erreur personnalisables
- [ ] Intégration avec des services de monitoring (Sentry, etc.)
- [ ] Support des pièces jointes
- [ ] Gestion des listes de diffusion
- [ ] Statistiques d'envoi en temps réel 