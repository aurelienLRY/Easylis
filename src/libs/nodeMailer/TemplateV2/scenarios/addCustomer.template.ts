import { ICustomerSession, ISessionWithDetails } from "@/types";
import {
  IEmailTemplateData,
  ITemplateData,
} from "@/libs/nodeMailer/TemplateV2/types";
import { formatDate } from "@/libs/nodeMailer/TemplateV2/utils";

export const addCustomerTemplate = (
  data: ITemplateData
): IEmailTemplateData => {
  const { customer, session, profile_from } = data;
  const meting =
    session.type_formule === "half_day"
      ? session.spot.meetingPoint.half_day
      : session.spot.meetingPoint.full_day;
  return {
    title: `Votre réservation pour le ${formatDate(session.date)} est validée`,
    content: `
      <p>Bonjour ${customer.first_names},</p>
      <p>Votre réservation pour l'activité "${
        session.activity.name
      }" du ${formatDate(session.date)} 
      pour ${customer.number_of_people} personne(s) est confirmée.</p>
      <p style="font-weight: bold;">Détails de la session :</p>
      <ul>
        <li>Horaires : ${session.startTime} - ${session.endTime}</li>
        <li>Lieu : ${session.spot.name}</li>
        <li>Prix total : ${customer.price_total}€</li>
      </ul>
      <p style="font-weight: bold;">Équipement nécessaire :</p>
      ${session.activity.required_equipment}
    `,
    buttonText: "Voir l'itinéraire",
    buttonUrl: `https://www.google.com/maps/dir/?api=1&destination=${
      meting || session.spot.gpsCoordinates
    }`,
    profile_from,
  };
};
