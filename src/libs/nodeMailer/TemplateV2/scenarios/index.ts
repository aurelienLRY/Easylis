import { EMAIL_SCENARIOS } from "@/libs/nodeMailer/TemplateV2/constants";
import { addCustomerTemplate } from "@/libs/nodeMailer/TemplateV2/scenarios/addCustomer.template";
import { updateCustomerTemplate } from "@/libs/nodeMailer/TemplateV2/scenarios/updateCustomer.template";
import { cancelCustomerTemplate } from "@/libs/nodeMailer/TemplateV2/scenarios/cancelCustomer.template";
import { updateSessionTemplate } from "@/libs/nodeMailer/TemplateV2/scenarios/updateSession.template";
import { bookingRequestTemplate } from "@/libs/nodeMailer/TemplateV2/scenarios/bookingRequest.template";
import { IEmailScenario } from "@/libs/nodeMailer/TemplateV2/types";

/**
 * Scénarios d'emails disponibles avec leurs configurations
 */
export const emailScenarios: Record<string, IEmailScenario> = {
  [EMAIL_SCENARIOS.ADD_CUSTOMER]: {
    scenario: EMAIL_SCENARIOS.ADD_CUSTOMER,
    subject: "Confirmation de votre réservation",
    template: addCustomerTemplate,
  },
  [EMAIL_SCENARIOS.UPDATE_CUSTOMER]: {
    scenario: EMAIL_SCENARIOS.UPDATE_CUSTOMER,
    subject: "Modification de votre réservation",
    template: updateCustomerTemplate,
  },
  [EMAIL_SCENARIOS.CANCEL_CUSTOMER]: {
    scenario: EMAIL_SCENARIOS.CANCEL_CUSTOMER,
    subject: "Annulation de votre réservation",
    template: cancelCustomerTemplate,
  },
  [EMAIL_SCENARIOS.UPDATE_SESSION]: {
    scenario: EMAIL_SCENARIOS.UPDATE_SESSION,
    subject: "Modification de votre session",
    template: updateSessionTemplate,
  },
  [EMAIL_SCENARIOS.BOOKING_REQUEST]: {
    scenario: EMAIL_SCENARIOS.BOOKING_REQUEST,
    subject: "Demande de réservation reçue",
    template: bookingRequestTemplate,
  },
} as const;

/**
 * Export des templates individuels pour une utilisation directe si nécessaire
 */
export {
  addCustomerTemplate,
  cancelCustomerTemplate,
  updateSessionTemplate,
  bookingRequestTemplate,
};

/**
 * Type pour les clés des scénarios disponibles
 */
export type EmailScenarioKey = keyof typeof emailScenarios;
