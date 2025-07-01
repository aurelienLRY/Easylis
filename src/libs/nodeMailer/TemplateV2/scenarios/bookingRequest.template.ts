import {
  IEmailTemplateData,
  ITemplateData,
} from "@/libs/nodeMailer/TemplateV2/types";
import { formatDate } from "@/libs/nodeMailer/TemplateV2/utils";

export const bookingRequestTemplate = (
  data: ITemplateData
): IEmailTemplateData => {
  const { customer, session, profile_from } = data;
  return {
    title: `Confirmation de votre demande de réservation pour l’activité ${session.activity.name}`,
    content: `
      <p>Bonjour ${customer.first_names},</p>
      <p>Occitanie Évasion vous remercie pour votre demande de réservation pour l'activité "${
        session.activity.name
      }" le ${formatDate(session.date)} pour ${
      customer.number_of_people
    } personne(s).</p>

    <p> J’ai bien pris en compte votre demande et je reviens vers vous très rapidement soit par mail, soit par
téléphone, pour vous donner tous les détails et finaliser la réservation ensemble.</p>
    `,
    profile_from,
  };
};
