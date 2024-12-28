"use server";
import nodemailer from "nodemailer";

/**
 * Crée un transporteur pour envoyer des emails avec nodemailer
 */
const nodemailerTransporter = nodemailer.createTransport(
  {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  {
    from: process.env.SMTP_EMAIL,
    subject: "Occitanie Evasion - Participer à notre prochaine évasion !",
  }
);

/**
 * Envoi un email avec nodemailer
 * @param email - L'email du destinataire
 * @param subject - Le sujet de l'email
 * @param html - Le contenu de l'email
 * @returns true si l'email a été envoyé avec succès, false sinon
 */
export const nodeMailerSender = async (
  email: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    const isVerified = await nodemailerTransporter.verify();
    if (!isVerified) {
      throw new Error("Le serveur SMTP n'est pas disponible");
    }

    const mailOptions = {
      from: `Occitanie Evasion <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: subject,
      html: html,
    };

    const info = await nodemailerTransporter.sendMail(mailOptions);
    if (!info.messageId) {
      throw new Error("L'email n'a pas été envoyé");
    }
    return true;
  } catch (error) {
    console.log("Erreur lors de l'envoi de l'email", error);
    return false;
  }
};
