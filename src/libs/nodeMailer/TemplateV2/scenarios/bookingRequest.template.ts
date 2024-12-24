import { ICustomerSession, ISessionWithDetails } from "@/types";
import {
  IEmailTemplateData,
  ITemplateData,
} from "@/libs/nodeMailer/TemplateV2/types";
import { formatDate, formatPrice } from "@/libs/nodeMailer/TemplateV2/utils";

export const bookingRequestTemplate = (
  data: ITemplateData
): IEmailTemplateData => {
  const { customer, session, profile_from } = data;
  return {
    title: `Demande de réservation reçue pour le ${formatDate(session.date)}`,
    content: `
      <p>Bonjour ${customer.first_names},</p>
      <p>Nous avons bien reçu votre demande de réservation pour l'activité "${
        session.activity.name
      }".</p>
      <p>Détails de votre demande :</p>
      <ul>
        <li>Date : ${formatDate(session.date)}</li>
        <li>Activité : ${session.activity.name}</li>
        <li>Nombre de personnes : ${customer.number_of_people}</li>
        <li>Prix total : ${formatPrice(customer.price_total)}</li>
      </ul>
      <p>Nous traiterons votre demande dans les plus brefs délais et vous recontacterons sous 48h pour confirmer votre réservation.</p>
    `,
     profile_from,
  };
};

