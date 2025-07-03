import { toast } from 'sonner';
import { IEmailSendResult} from '@/services/Mailer/clientSide/types';
import { getUserFriendlyMessage, isRetryableError } from '@/services/Mailer/clientSide/errorHandler';

/**
 * Affiche un toast d'email avec des actions contextuelles
 */
export const showEmailToast = (result: IEmailSendResult, onRetry?: () => void) => {
  if (result.success) {
    // Toast de succès
    toast.success("Email envoyé avec succès", {
      description: `Envoyé à ${result.recipient}`,
      duration: 5000,
      action: {
        label: "Voir les détails dans la console",
        onClick: () => {
          console.log("✅ Email envoyé avec succès:", {
            recipient: result.recipient,
            subject: result.subject,
            messageId: result.messageId,
            timestamp: result.timestamp,
            retryCount: result.retryCount
          });
        }
      }
    });
  } else {
    // Toast d'erreur adapté au type
    const error = result.error!;
    const userMessage = getUserFriendlyMessage(error);
    
    if (isRetryableError(error)) {
      // Erreur retryable - proposer de réessayer
      toast.error("Échec de l'envoi de l'email", {
        description: userMessage,
        duration: 10000,
        action: onRetry ? {
          label: "Réessayer",
          onClick: () => {
            toast.info("Nouvelle tentative d'envoi...");
            onRetry();
          }
        } : undefined
      });
    } else {
      // Erreur non-retryable - afficher les détails
      toast.error("Échec de l'envoi de l'email", {
        description: userMessage,
        duration: 8000,
        action: {
          label: "Voir les détails dans la console",
          onClick: () => {
            console.error("❌ Échec d'envoi email:", {
              recipient: result.recipient,
              subject: result.subject,
              error: result.error,
              timestamp: result.timestamp,
              retryCount: result.retryCount
            });
          }
        }
      });
    }
  }
};

/**
 * Affiche un toast d'information pour les opérations d'email
 */
export const showEmailInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000
  });
};

/**
 * Affiche un toast d'avertissement pour les problèmes d'email
 */
export const showEmailWarningToast = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 6000
  });
};

/**
 * Affiche un toast de succès pour les opérations d'email
 */
export const showEmailSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 5000
  });
};

/**
 * Affiche un toast d'erreur pour les problèmes d'email
 */
export const showEmailErrorToast = (message: string, description?: string, onRetry?: () => void) => {
  toast.error(message, {
    description,
    duration: 8000,
    action: onRetry ? {
      label: "Réessayer",
      onClick: onRetry
    } : undefined
  });
}; 