"use client";
import { generateEvent } from "@/services/GoogleCalendar/ClientSide/generateEvent";
import { fetcherUpdateEvent } from "@/services/GoogleCalendar/ClientSide/fetcherUpdateEvent";
import { useProfile, useSessionWithDetails } from "@/store";
import { ICustomerSession } from "@/types";
import { useState } from "react";
import {
  CANCEL_CUSTOMER_SESSION,
  CREATE_CUSTOMER_SESSION,
  UPDATE_CUSTOMER_SESSION,
} from "@/libs/ServerAction";

import { toast } from "sonner";
import { ToasterAction } from "@/components";

/* template email */
import { EMAIL_SCENARIOS } from "@/libs/nodeMailer/TemplateV2/constants";

/* hooks */
import { useMailer } from "@/hooks/useMailer";

/**
 * Hooks pour les actions sur les clients
 * @returns
 */
export const useCustomer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useProfile();
  const mailer = useMailer();
  const { updateSessionWithDetails, SessionWithDetails } =
    useSessionWithDetails();

  const CancelCustomer = async (customer: ICustomerSession) => {
    const wantToCancel = window.confirm(
      `Voulez-vous annuler ${customer.first_names} ${customer.last_name} ?`
    );
    if (wantToCancel) {
      const thisSession = SessionWithDetails.find(
        (session) => session._id === customer.sessionId
      );
      setIsSubmitting(true);
      const act = await CANCEL_CUSTOMER_SESSION(customer._id);
      if (act.success && act.data) {
        updateSessionWithDetails(act.data);
        const refreshToken = profile?.tokenRefreshCalendar;
        if (refreshToken) {
          const event = generateEvent(act.data);
          await fetcherUpdateEvent(refreshToken, event, act.data._id);
        } else {
          toast.error(
            "Votre calendrier n'est pas connecté, l'évènement n'a pas été mis à jour dans votre calendrier"
          );
        }
        const wantToSendEmail =
          thisSession &&
          mailer &&
          window.confirm(
            `Votre client ${customer.first_names} ${customer.last_name} a été annulé avec succès ! \nVoulez-vous envoyer un email au client ?`
          );
        if (wantToSendEmail) {
          mailer.prepareEmail(EMAIL_SCENARIOS.CANCEL_CUSTOMER, {
            customer: customer,
            session: thisSession,
            profile_from: profile!,
          });
        }
      }
      ToasterAction({
        result: act,
        defaultMessage: "Client annulé avec succès",
      });
      setIsSubmitting(false);
      return act;
    }
  };

  const addCustomer = async (customer: ICustomerSession) => {
    setIsSubmitting(true);
    const act = await CREATE_CUSTOMER_SESSION(customer);
    if (act.success && act.data) {
      updateSessionWithDetails(act.data);
      const refreshToken = profile?.tokenRefreshCalendar;
      if (refreshToken) {
        const event = generateEvent(act.data);
        await fetcherUpdateEvent(refreshToken, event, act.data._id);
      } else {
        toast.error(
          "Votre calendrier n'est pas connecté, l'évènement n'a pas été mis à jour dans votre calendrier"
        );
      }
      if (mailer) {
        const wantToSendEmail = window.confirm(
          `Client ajouté avec succès ! \nVoulez-vous envoyer un email au client ?`
        );
        if (wantToSendEmail) {
          mailer?.prepareEmail(EMAIL_SCENARIOS.ADD_CUSTOMER, {
            customer: customer,
            session: act.data,
            profile_from: profile!,
          });
        }
      }
      ToasterAction({
        result: act,
        defaultMessage: "Client ajouté avec succès",
      });
      setIsSubmitting(false);
    }
  };

  const updateCustomer = async (customer: ICustomerSession) => {
    setIsSubmitting(true);
    const act = await UPDATE_CUSTOMER_SESSION(customer._id, customer);
    if (act.success && act.data) {
      updateSessionWithDetails(act.data);
      const refreshToken = profile?.tokenRefreshCalendar;
      if (refreshToken) {
        const event = generateEvent(act.data);
        await fetcherUpdateEvent(refreshToken, event, act.data._id);
      } else {
        toast.error(
          "Votre calendrier n'est pas connecté, l'évènement n'a pas été mis à jour dans votre calendrier"
        );
      }
      if (mailer) {
        const wantToSendEmail = window.confirm(
          `Client modifié avec succès ! \nVoulez-vous envoyer un email au client ?`
        );
        if (wantToSendEmail) {
          mailer?.prepareEmail(EMAIL_SCENARIOS.UPDATE_CUSTOMER, {
            customer: customer,
            session: act.data,
            profile_from: profile!,
          });
        }
      }
      ToasterAction({
        result: act,
        defaultMessage: "Client modifié avec succès",
      });
      setIsSubmitting(false);
    }
  };

  return { CancelCustomer, addCustomer, updateCustomer, isSubmitting };
};
