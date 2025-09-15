import { nodeMailerSender } from "./sender";

/**
 * Envoi un email avec nodemailer (pour API Routes)
 * @param email - L'email du destinataire
 * @param subject - Le sujet de l'email
 * @param html - Le contenu de l'email
 * @param config - Configuration optionnelle
 * @param scenario - Type de scénario d'email
 * @param customerId - ID du client (optionnel)
 * @param sessionId - ID de la session (optionnel)
 * @param userId - ID de l'utilisateur (optionnel, pour les appels serveur)
 * @returns true si l'email a été envoyé avec succès, false sinon
 */
export const nodeMailerSenderAPI = async (
  email: string,
  subject: string,
  html: string,
  config: any = {},
  scenario: string = "CUSTOM",
  customerId?: string,
  sessionId?: string,
  userId?: string
): Promise<boolean> => {
  try {
    const result = await nodeMailerSender(email, subject, html, config, scenario, customerId, sessionId, userId);
    return result.success;
  } catch (error) {
    console.log("Erreur lors de l'envoi de l'email", error);
    return false;
  }
}; 