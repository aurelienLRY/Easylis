import { ICustomerSession, ISessionWithDetails } from "@/types";
import {
  IEmailTemplateData,
  ITemplateData,
} from "@/libs/nodeMailer/TemplateV2/types";
import { formatDate } from "@/libs/nodeMailer/TemplateV2/utils";

export const updateSessionTemplate = (
  data: ITemplateData
): IEmailTemplateData => {
  const { customer, session, changes, profile_from } = data;
  let changesDescription = "";

  if (changes?.oldDate) {
    changesDescription += `<li>Date : ${formatDate(
      changes.oldDate
    )} → ${formatDate(session.date)}</li>`;
  }
  if (changes?.oldStartTime) {
    changesDescription += `<li>Horaire : ${changes.oldStartTime} → ${session.startTime}</li>`;
  }
  if (changes?.oldSpot) {
    changesDescription += `<li>Lieu : ${changes.oldSpot} → ${session.spot.name}</li>`;
  }

  return {
    title: `Modification de votre session du ${formatDate(session.date)}`,
    content: `
      <p>Bonjour ${customer.first_names},</p>
      <p>Votre session de "${session.activity.name}" a été modifiée.</p>
      <p>Changements apportés :</p>
      <ul>
        ${changesDescription}
      </ul>
      <p>Nouveaux détails de la session :</p>
      <ul>
        <li>Date : ${formatDate(session.date)}</li>
        <li>Horaires : ${session.startTime} - ${session.endTime}</li>
        <li>Lieu : ${session.spot.name}</li>
      </ul>
    `,
    buttonText: "Voir le nouveau lieu de rendez-vous",
    buttonUrl: `https://www.google.com/maps/dir/?api=1&destination=${
      session.spot.meetingPoint || session.spot.gpsCoordinates
    }`,
    profile_from,
  };
};
