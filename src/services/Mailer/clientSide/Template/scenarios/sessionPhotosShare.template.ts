import { IEmailTemplateData, ITemplateData } from "../types";
import { formatDate } from "../utils";

export const sessionPhotosShareTemplate = (
  data: ITemplateData
): IEmailTemplateData => {
  const { customer, session, profile_from, photoShareUrl } = data;

  if (!photoShareUrl) {
    throw new Error("photoShareUrl est requis pour le template SESSION_PHOTOS_SHARE");
  }

  return {
    title: `Vos photos — ${session.activity.name}`,
    content: `
      <p>Bonjour,</p>
      <p>Les photos de votre sortie <strong>${session.activity.name}</strong> sont disponibles.</p>
      <p style="font-weight: bold;">Rappel de votre sortie :</p>
      <ul>
        <li>Date : ${formatDate(session.date)}</li>
        <li>Horaires : ${session.startTime} - ${session.endTime}</li>
        <li>Lieu : ${session.spot.name}</li>
      </ul>
      <p>Utilisez le bouton ci-dessous pour accéder à votre galerie. Ce lien est personnel et ne doit pas être partagé.</p>
    `,
    buttonText: "Voir les photos",
    buttonUrl: photoShareUrl,
    profile_from,
  };
};
