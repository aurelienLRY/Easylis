import { ICustomerSession, ISessionWithDetails } from "@/types";
import {
  IEmailTemplateData,
  ITemplateData,
} from "../types";
import { formatDate } from "../utils";

export const updateCustomerTemplate = (
  data: ITemplateData
): IEmailTemplateData => {
  const { customer, session, profile_from } = data;
  const meting =
  session.type_formule === "half_day"
      ? session.spot.meetingPoint.half_day
      : session.spot.meetingPoint.full_day;
  
  const required_equipment = session.activity.required_equipment === null ? "" : (`<p style="font-weight: bold;">Ce qu’il vous faut prévoir pour profiter pleinement de la sortie:</p>
        ${session.activity.required_equipment }`);  
      return {
    title: `Votre réservation pour le ${formatDate(
      session.date
    )} a été modifiée`,
    content: `
    <p>Bonjour ${customer.first_names},</p>
    <p>Votre réservation du ${formatDate(session.date)}  à été modifiée.</p>
    <p style="font-weight: bold; text-align: center; font-size: 1.2rem;"> voici les informations  mise à jour </p>
    <ul>
      <li>Activité : ${session.activity.name}</li>
      <li>Nombre de personne : ${customer.number_of_people}</li>
      <li>Horaires : ${session.startTime} - ${session.endTime}</li>
      <li>Lieu : ${session.spot.name}</li>
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
