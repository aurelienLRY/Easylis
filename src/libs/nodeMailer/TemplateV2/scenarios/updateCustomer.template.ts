import { ICustomerSession, ISessionWithDetails } from "@/types";
import {
  IEmailTemplateData,
  ITemplateData,
} from "@/libs/nodeMailer/TemplateV2/types";
import { formatDate } from "@/libs/nodeMailer/TemplateV2/utils";

export const updateCustomerTemplate = (
  data: ITemplateData
): IEmailTemplateData => {
  const { customer, session, profile_from } = data;
  const meting =
  session.type_formule === "half_day"
      ? session.spot.meetingPoint.half_day
      : session.spot.meetingPoint.full_day;
  
  
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
    <p style="font-weight: bold; text-align: center; font-size: 1.2rem;"> Équipement nécessaire :</p>
    ${session.activity.required_equipment}
  
    `,
    buttonText: "Voir l'itinéraire",
    buttonUrl: `https://www.google.com/maps/dir/?api=1&destination=${
      meting || session.spot.gpsCoordinates
    }`,
    profile_from,
  };
};
