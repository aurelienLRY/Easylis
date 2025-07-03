import { IEmailSendResult, EmailErrorType } from './types';

/**
 * Service client pour l'envoi d'emails via l'API
 */
export class EmailClientService {
  private static readonly API_URL = '/api/services/email/send';

  /**
   * Envoie un email via l'API
   */
  static async sendEmail(
    to: string, 
    subject: string, 
    content: string
  ): Promise<IEmailSendResult> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          content
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Succès
        return {
          success: true,
          messageId: data.data.messageId,
          recipient: data.data.recipient,
          subject: data.data.subject,
          timestamp: new Date(data.data.timestamp),
          retryCount: data.data.retryCount || 0
        };
      } else {
        // Erreur de l'API
        return {
          success: false,
          recipient: to,
          subject: subject,
          timestamp: new Date(),
          error: {
            type: EmailErrorType.UNKNOWN_ERROR,
            message: data.error?.message || 'Erreur lors de l\'envoi de l\'email',
            details: data.error?.details || `Status: ${response.status}`,
            retryable: data.error?.retryable !== false
          }
        };
      }
    } catch (error: any) {
      // Erreur réseau ou autre
      console.error('Erreur lors de l\'appel à l\'API email:', error);
      
      return {
        success: false,
        recipient: to,
        subject: subject,
        timestamp: new Date(),
        error: {
          type: EmailErrorType.UNKNOWN_ERROR,
          message: 'Erreur de connexion lors de l\'envoi de l\'email',
          details: error.message,
          retryable: true
        }
      };
    }
  }

  /**
   * Vérifie si l'API est accessible
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'OPTIONS'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
} 