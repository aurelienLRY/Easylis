import {
  IEmailTemplateData,
  ITemplateData,
} from "../types";
import { formatDate } from "../utils";

export const addCustomerTemplate = (
  data: ITemplateData
): IEmailTemplateData => {
  const { customer, session, profile_from } = data;
  const meting =
    session.type_formule === "half_day"
      ? session.spot.meetingPoint.half_day
      : session.spot.meetingPoint.full_day;

      const  required_equipment = session.activity.required_equipment === null ? "" : (`<p style="font-weight: bold;">Ce qu’il vous faut prévoir pour profiter pleinement de la sortie:</p>
        ${session.activity.required_equipment }`);  
  return {
    title: `Confirmation de votre réservation pour l’activité ${session.activity.name}`,
    content: `
      <p>Bonjour ${customer.first_names},</p>
      <p> Occitanie Evasion vous remercie pour votre réservation ! </p>
      <p> Je suis ravis de vous accueillir pour une
expérience en "${session.activity.name}". </p>
      <p style="font-weight: bold;">Voici les détails de votre réservation:</p>
      <ul>
        <li> Activité : ${session.activity.name}</li>
        <li> Formule (journée/demi journée) : ${
          session.type_formule === "half_day" ? "Demi-journée" : "Journée"
        }</li>
        <li>Date : ${formatDate(session.date)}</li>
        <li>Heure de rendez-vous : ${session.startTime}</li>
        <li>Lieu : ${session.spot.name}</li>
        <li>Nombre de personnes : ${customer.number_of_people}</li>
        <li>Prix total : ${customer.price_total}€</li>
      </ul>
      <p> Le règlement est à effectuer sur place, exclusivement en espèces ou par chèque.  </p>
      
      ${required_equipment}
    `,
    buttonText: "Voir l'itinéraire",
    buttonUrl: `https://www.google.com/maps/dir/?api=1&destination=${
      meting || session.spot.gpsCoordinates
    }`,
    profile_from,
  };
};
