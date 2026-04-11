import { EMAIL_SCENARIOS } from "../constants";
import { addCustomerTemplate } from "./addCustomer.template";
import { updateCustomerTemplate } from "./updateCustomer.template";
import { cancelCustomerTemplate } from "./cancelCustomer.template";
import { updateSessionTemplate } from "./updateSession.template";
import { bookingRequestTemplate } from "./bookingRequest.template";
import { sessionPhotosShareTemplate } from "./sessionPhotosShare.template";
import { IEmailScenario } from "../types";

/**
 * Scénarios d'emails disponibles avec leurs configurations
 */
export const emailScenarios: Record<string, IEmailScenario> = {
  [EMAIL_SCENARIOS.ADD_CUSTOMER]: {
    scenario: EMAIL_SCENARIOS.ADD_CUSTOMER,
    subject: "🎉​​ Confirmation de votre réservation 🎉​​",
    template: addCustomerTemplate,
  },
  [EMAIL_SCENARIOS.UPDATE_CUSTOMER]: {
    scenario: EMAIL_SCENARIOS.UPDATE_CUSTOMER,
    subject: "🧐 Modification de votre réservation 🧐",
    template: updateCustomerTemplate,
  },
  [EMAIL_SCENARIOS.CANCEL_CUSTOMER]: {
    scenario: EMAIL_SCENARIOS.CANCEL_CUSTOMER,
    subject: "🙄 Annulation de votre réservation 🙄",
    template: cancelCustomerTemplate,
  },
  [EMAIL_SCENARIOS.UPDATE_SESSION]: {
    scenario: EMAIL_SCENARIOS.UPDATE_SESSION,
    subject: "🧐 Modification de votre session 🧐",
    template: updateSessionTemplate,
  },
  [EMAIL_SCENARIOS.BOOKING_REQUEST]: {
    scenario: EMAIL_SCENARIOS.BOOKING_REQUEST,
    subject: "🎉​​ Demande de réservation reçue 🎉​​",
    template: bookingRequestTemplate,
  },
  [EMAIL_SCENARIOS.SESSION_PHOTOS_SHARE]: {
    scenario: EMAIL_SCENARIOS.SESSION_PHOTOS_SHARE,
    subject: "📸 Vos photos de votre sortie 📸",
    template: sessionPhotosShareTemplate,
  },
} as const;

/**
 * Export des templates individuels pour une utilisation directe si nécessaire
 */
export {
  addCustomerTemplate,
  updateCustomerTemplate,
  cancelCustomerTemplate,
  updateSessionTemplate,
  bookingRequestTemplate,
  sessionPhotosShareTemplate,
};

/**
 * Type pour les clés des scénarios disponibles
 */
export type EmailScenarioKey = keyof typeof emailScenarios;
