import { ICustomerSession, ISessionWithDetails } from "@/types";
import {
  IEmailTemplateData,
  ITemplateData,
} from "@/libs/nodeMailer/TemplateV2/types";
import { formatDate } from "@/libs/nodeMailer/TemplateV2/utils";

export const cancelCustomerTemplate = (
  data: ITemplateData
): IEmailTemplateData => {
  const { customer, session, profile_from } = data;
  return {
    title: `Annulation de votre réservation du ${formatDate(session.date)}`,
    content: `
      <p>Bonjour ${customer.first_names},</p>
      <p>Nous vous confirmons l'annulation de votre réservation pour l'activité "${
        session.activity.name
      }" 
      du ${formatDate(session.date)}.</p>
      <p>Nous espérons vous revoir bientôt pour une nouvelle aventure !</p>
    `,
    profile_from,
  };
};
