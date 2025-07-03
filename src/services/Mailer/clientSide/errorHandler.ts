import { IEmailError, EmailErrorType } from "./types";

/**
 * Analyse une erreur nodemailer et retourne un objet EmailError structuré
 * @param error - L'erreur nodemailer
 * @returns EmailError avec les détails de l'erreur
 */
export const analyzeEmailError = (error: any): IEmailError => {
  const errorMessage = error.message?.toLowerCase() || "";
  const errorCode = error.code || error.responseCode;

  // Erreurs de configuration SMTP
  if (errorMessage.includes("smtp") || errorMessage.includes("connection")) {
    if (errorMessage.includes("authentication") || errorCode === 535) {
      return {
        type: EmailErrorType.SMTP_AUTHENTICATION,
        message: "Erreur d'authentification SMTP. Vérifiez vos identifiants.",
        code: errorCode,
        details: errorMessage,
        retryable: false
      };
    }
    
    if (errorMessage.includes("connection") || errorCode === "ECONNREFUSED") {
      return {
        type: EmailErrorType.SMTP_CONNECTION,
        message: "Impossible de se connecter au serveur SMTP.",
        code: errorCode,
        details: errorMessage,
        retryable: true
      };
    }
    
    return {
      type: EmailErrorType.SMTP_CONFIGURATION,
      message: "Erreur de configuration SMTP.",
      code: errorCode,
      details: errorMessage,
      retryable: false
    };
  }

  // Erreurs d'adresse email
  if (errorMessage.includes("invalid") && errorMessage.includes("email")) {
    return {
      type: EmailErrorType.INVALID_EMAIL,
      message: "L'adresse email n'est pas valide.",
      code: errorCode,
      details: errorMessage,
      retryable: false
    };
  }

  if (errorMessage.includes("not found") || errorCode === 550) {
    return {
      type: EmailErrorType.EMAIL_NOT_FOUND,
      message: "L'adresse email n'existe pas ou n'est pas accessible.",
      code: errorCode,
      details: errorMessage,
      retryable: false
    };
  }

  if (errorMessage.includes("blocked") || errorMessage.includes("spam")) {
    return {
      type: EmailErrorType.EMAIL_BLOCKED,
      message: "L'email a été bloqué par le serveur de destination.",
      code: errorCode,
      details: errorMessage,
      retryable: false
    };
  }

  // Erreurs de quota et rate limiting
  if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
    return {
      type: EmailErrorType.QUOTA_EXCEEDED,
      message: "Quota d'envoi d'emails dépassé.",
      code: errorCode,
      details: errorMessage,
      retryable: true
    };
  }

  if (errorMessage.includes("rate") || errorCode === 421) {
    return {
      type: EmailErrorType.RATE_LIMIT,
      message: "Limite de fréquence d'envoi dépassée. Réessayez plus tard.",
      code: errorCode,
      details: errorMessage,
      retryable: true
    };
  }

  // Erreurs de timeout
  if (errorMessage.includes("timeout") || errorCode === "ETIMEDOUT") {
    return {
      type: EmailErrorType.TIMEOUT,
      message: "Délai d'attente dépassé lors de l'envoi.",
      code: errorCode,
      details: errorMessage,
      retryable: true
    };
  }

  // Erreurs de serveur
  if (errorCode >= 500) {
    return {
      type: EmailErrorType.SERVER_ERROR,
      message: "Erreur du serveur de destination.",
      code: errorCode,
      details: errorMessage,
      retryable: true
    };
  }

  // Erreur par défaut
  return {
    type: EmailErrorType.UNKNOWN_ERROR,
    message: "Erreur inconnue lors de l'envoi de l'email.",
    code: errorCode,
    details: errorMessage,
    retryable: true
  };
};

/**
 * Génère un message utilisateur convivial basé sur le type d'erreur
 * @param error - L'erreur d'email
 * @returns Message utilisateur convivial
 */
export const getUserFriendlyMessage = (error: IEmailError): string => {
  switch (error.type) {
    case EmailErrorType.INVALID_EMAIL:
      return "L'adresse email saisie n'est pas valide. Veuillez vérifier et réessayer.";
    
    case EmailErrorType.EMAIL_NOT_FOUND:
      return "Cette adresse email n'existe pas ou n'est pas accessible. Veuillez vérifier l'adresse.";
    
    case EmailErrorType.EMAIL_BLOCKED:
      return "L'email a été bloqué par le serveur de destination. Veuillez contacter le destinataire.";
    
    case EmailErrorType.SMTP_AUTHENTICATION:
      return "Erreur de configuration du serveur d'envoi. Contactez l'administrateur.";
    
    case EmailErrorType.SMTP_CONNECTION:
      return "Problème de connexion au serveur d'envoi. Réessayez dans quelques minutes.";
    
    case EmailErrorType.QUOTA_EXCEEDED:
      return "Limite d'envoi d'emails atteinte. Réessayez demain.";
    
    case EmailErrorType.RATE_LIMIT:
      return "Trop d'emails envoyés récemment. Réessayez dans quelques minutes.";
    
    case EmailErrorType.TIMEOUT:
      return "L'envoi prend trop de temps. Réessayez dans quelques instants.";
    
    case EmailErrorType.SERVER_ERROR:
      return "Problème temporaire du serveur. Réessayez dans quelques minutes.";
    
    default:
      return "Une erreur inattendue s'est produite. Réessayez plus tard.";
  }
};

/**
 * Détermine si une erreur peut être retentée
 * @param error - L'erreur d'email
 * @returns true si l'erreur peut être retentée
 */
export const isRetryableError = (error: IEmailError): boolean => {
  return error.retryable;
}; 