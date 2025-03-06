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
    title: `Annulation de votre réservation pour l'activité sportive du ${formatDate(
      session.date
    )}`,
    content: `
      <p>Bonjour ${customer.first_names},</p>
      <p>Occitanie Evasion vous informons que, malheureusement, la réservation pour l'activité "${
        session.activity.name
      }" prévue le ${formatDate(session.date)} a été annulée.</p>
      <p> En espérant vous retrouver une fois prochaine pour une nouvelle évasion en pleine nature !</p>
    `,
    profile_from,
  };
};
