"use server";
import nodemailer from "nodemailer";
import { IEmailSendResult, IMailerConfig, EmailErrorType } from "../clientSide/types";
import { analyzeEmailError } from "../clientSide/errorHandler";
import { CREATE_EMAIL_LOG } from "@/libs/ServerAction/emailLog.actions";

/**
 * Configuration par défaut du mailer
 */
const defaultConfig: IMailerConfig = {
  maxRetries: 3,
  retryDelay: 2000, // 2 secondes
  timeout: 30000, // 30 secondes
  enableLogging: true
};

/**
 * Crée un transporteur pour envoyer des emails avec nodemailer
 */
const createTransporter = () => {
  return nodemailer.createTransport(
    {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: defaultConfig.timeout,
      greetingTimeout: defaultConfig.timeout,
      socketTimeout: defaultConfig.timeout,
    },
    {
      from: process.env.SMTP_EMAIL,
    }
  );
};

/**
 * Valide une adresse email
 * @param email - L'adresse email à valider
 * @returns true si l'email est valide
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Envoi un email avec nodemailer avec gestion d'erreurs avancée
 * @param email - L'email du destinataire
 * @param subject - Le sujet de l'email
 * @param html - Le contenu de l'email
 * @param config - Configuration optionnelle du mailer
 * @returns EmailSendResult avec les détails de l'envoi
 */
export const nodeMailerSender = async (
  email: string,
  subject: string,
  html: string,
  config: Partial<IMailerConfig> = {},
  scenario: string = "CUSTOM",
  customerId?: string,
  sessionId?: string
): Promise<IEmailSendResult> => {
  const finalConfig = { ...defaultConfig, ...config };
  const timestamp = new Date();
  let retryCount = 0;

  // Validation des paramètres
  if (!email || !subject || !html) {
    return {
      success: false,
      recipient: email,
      subject,
      timestamp,
              error: {
          type: "INVALID_CONTENT" as EmailErrorType,
          message: "Paramètres manquants ou invalides",
          retryable: false
        }
    };
  }

  // Validation de l'adresse email
  if (!isValidEmail(email)) {
    return {
      success: false,
      recipient: email,
      subject,
      timestamp,
              error: {
          type: "INVALID_EMAIL" as EmailErrorType,
          message: "Adresse email invalide",
          retryable: false
        }
    };
  }

  // Tentatives d'envoi avec retry
  while (retryCount <= finalConfig.maxRetries) {
    try {
      const transporter = createTransporter();

      // Vérification de la connexion SMTP
      const isVerified = await transporter.verify();
      if (!isVerified) {
        throw new Error("Le serveur SMTP n'est pas disponible");
      }

      const mailOptions = {
        from: `Occitanie Evasion <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: subject,
        html: html,
      };

      const info = await transporter.sendMail(mailOptions);
      
      if (!info.messageId) {
        throw new Error("L'email n'a pas été envoyé");
      }

      // Succès
      if (finalConfig.enableLogging) {
        console.log(`✅ Email envoyé avec succès à ${email}`, {
          messageId: info.messageId,
          timestamp: timestamp.toISOString()
        });
      }

      const result = {
        success: true,
        messageId: info.messageId,
        recipient: email,
        subject,
        timestamp,
        retryCount
      };

      // Log de l'email envoyé
      try {
        await CREATE_EMAIL_LOG(
          {
            recipient: email,
            subject,
            content: html,
            scenario,
            customerId,
            sessionId,
          },
          result
        );
      } catch (logError) {
        console.error("Erreur lors du logging de l'email:", logError);
        // Ne pas faire échouer l'envoi si le logging échoue
      }

      return result;

    } catch (error: any) {
      retryCount++;
      const emailError = analyzeEmailError(error);

      // Log de l'erreur
      if (finalConfig.enableLogging) {
        console.error(`❌ Erreur d'envoi email (tentative ${retryCount}/${finalConfig.maxRetries + 1}):`, {
          recipient: email,
          error: emailError,
          timestamp: timestamp.toISOString()
        });
      }

      // Si c'est la dernière tentative ou si l'erreur n'est pas retentable
      if (retryCount > finalConfig.maxRetries || !emailError.retryable) {
        const result = {
          success: false,
          recipient: email,
          subject,
          timestamp,
          error: emailError,
          retryCount
        };

        // Log de l'échec d'envoi
        try {
          await CREATE_EMAIL_LOG(
            {
              recipient: email,
              subject,
              content: html,
              scenario,
              customerId,
              sessionId,
            },
            result
          );
        } catch (logError) {
          console.error("Erreur lors du logging de l'échec d'email:", logError);
        }

        return result;
      }

      // Attendre avant de retenter
      if (retryCount <= finalConfig.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay));
      }
    }
  }

  // Ne devrait jamais arriver, mais au cas où
  return {
    success: false,
    recipient: email,
    subject,
    timestamp,
          error: {
        type: "UNKNOWN_ERROR" as EmailErrorType,
        message: "Erreur inconnue après toutes les tentatives",
        retryable: false
      },
    retryCount
  };
};

/**
 * Version simplifiée pour compatibilité (retourne boolean)
 * @deprecated Utilisez nodeMailerSender pour plus de détails
 */
export const nodeMailerSenderSimple = async (
  email: string,
  subject: string,
  html: string
): Promise<boolean> => {
  const result = await nodeMailerSender(email, subject, html);
  return result.success;
};


