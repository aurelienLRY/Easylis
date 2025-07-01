# NodeMailer - Système d'envoi d'emails

Ce dossier contient le système complet d'envoi d'emails pour l'application Easylis, utilisant Nodemailer avec des templates personnalisés.

## 📁 Structure du dossier

```
src/libs/nodeMailer/
├── README.md                 # Ce fichier de documentation
├── index.ts                  # Point d'entrée principal
├── sender.ts                 # Envoi d'emails pour Server Actions
├── senderAPI.ts              # Envoi d'emails pour API Routes
└── TemplateV2/               # Système de templates d'emails
    ├── index.ts              # Point d'entrée des templates
    ├── base.template.ts      # Template de base HTML
    ├── constants.ts          # Constantes des scénarios
    ├── types.ts              # Types TypeScript
    └── scenarios/            # Scénarios d'emails spécifiques
        ├── index.ts          # Export des scénarios
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
import { nodeMailerSender } from "@/libs/nodeMailer/sender";

// Envoi d'un email simple
const success = await nodeMailerSender(
  "client@example.com",
  "Sujet de l'email",
  "<h1>Contenu HTML</h1>"
);
```

### 2. API Routes (côté serveur)

```typescript
import { nodeMailerSenderAPI } from "@/libs/nodeMailer/senderAPI";

// Envoi d'un email depuis une API route
const success = await nodeMailerSenderAPI(
  "client@example.com",
  "Sujet de l'email",
  "<h1>Contenu HTML</h1>"
);
```

### 3. Templates avec scénarios

```typescript
import { emailScenarios, generateEmail } from "@/libs/nodeMailer/TemplateV2";

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
- **Fichier** : `TemplateV2/index.ts`

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

1. **Créer le template** dans `TemplateV2/scenarios/`
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

2. **Ajouter la constante** dans `TemplateV2/constants.ts`
```typescript
export const EMAIL_SCENARIOS = {
  // ... autres scénarios
  NOUVEAU_SCENARIO: "NOUVEAU_SCENARIO",
} as const;
```

3. **Enregistrer le scénario** dans `TemplateV2/scenarios/index.ts`
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
import { EMAIL_SCENARIOS } from "@/libs/nodeMailer/TemplateV2/constants";

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