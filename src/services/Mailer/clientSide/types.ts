/**
 * Types d'erreurs d'email possibles
 */
export enum EmailErrorType {
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

/**
 * Interface pour les détails d'erreur d'email
 */
export interface IEmailError {
  type: EmailErrorType;
  message: string;
  code?: string | number;
  details?: string;
  retryable: boolean;
}

/**
 * Interface pour la réponse d'envoi d'email
 */
export interface IEmailSendResult {
  success: boolean;
  messageId?: string;
  error?: IEmailError;
  recipient: string;
  subject: string;
  timestamp: Date;
  retryCount?: number;
}

/**
 * Interface pour les statistiques d'envoi
 */
export interface IEmailStats {
  totalSent: number;
  totalFailed: number;
  lastSent?: Date;
  lastError?: IEmailError;
}

/**
 * Interface pour la configuration du mailer
 */
export interface IMailerConfig {
  maxRetries: number;
  retryDelay: number; // en millisecondes
  timeout: number; // en millisecondes
  enableLogging: boolean;
} 