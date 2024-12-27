"use server";
/* libs */
import * as yup from "yup";
import xss from "xss";

/* Database */
import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";
/* Models */
import { CustomerSession , Session } from "@/libs/database/models";
import { customerSessionSchema } from "@/libs/yup";

/* Types */
import {
  ICustomerSession,
  ISession,
  ISessionWithDetails,
  ICallbackForCustomerSession,
  ICallbackForCustomerSessions,
  ICallbackForSessionWithDetails,
} from "@/types";

/* Actions */
import { GET_SERVER_SESSION_WITH_DETAILS } from "@/libs/ServerAction";

/*
 * Validate the customerSession
 * @param customerSession - The customerSession to validate
 * @returns The validation result
 */
export const validateCustomerSession = async (
  customerSession: ICustomerSession
) => {
  return await customerSessionSchema.validate(customerSession, {
    abortEarly: false,
  });
};

/*
 * XSS the customerSession
 * @param customerSession - The customerSession to xss
 * @returns The xss result
 */
export const xssCustomerSession = async (customerSession: ICustomerSession) => {
  try {
    const xssData: ICustomerSession = {
      ...customerSession,
      last_name: xss(customerSession.last_name),
      first_names: xss(customerSession.first_names),
      email: xss(customerSession.email),
      phone: xss(customerSession.phone),
      typeOfReservation: xss(customerSession.typeOfReservation),
      number_of_people: customerSession.number_of_people,
      people_list: customerSession.people_list.map((person: { size: string; weight: string; price_applicable: number; isReduced: boolean }) => ({
        size: xss(person.size),
        weight: xss(person.weight),
        price_applicable: person.price_applicable,
        isReduced: person.isReduced,
      })),
    };
    return JSON.parse(JSON.stringify(xssData));
  } catch (error) {
    console.error("Erreur lors de la validation du customerSession:", error);
    throw error;
  }
};

/**
 * Create a customer session
 * @param customer - The customer session to create
 * @returns the customer session created with details
 */
export async function CREATE_CUSTOMER_SESSION(
  customer: ICustomerSession
): Promise<ICallbackForSessionWithDetails> {
  try {
    /* validation & cleaning */
    const YupValidation = (await validateCustomerSession(
      customer
    )) as ICustomerSession;
    const xssCustomer = (await xssCustomerSession(
      YupValidation
    )) as ICustomerSession;

    await connectDB();

    const UpdateSession = (await Session.findByIdAndUpdate(
      xssCustomer.sessionId,
      { $inc: { placesReserved: xssCustomer.number_of_people } },
      { new: true }
    )) as ISession;
    if (!UpdateSession) {
      throw new Error("Erreur lors de la mise à jour de la session ");
    }
    const prepareCustomerSession = { ...xssCustomer, createdAt: new Date() };

    if (prepareCustomerSession.status === "Validated") {
      prepareCustomerSession.validatedAt = new Date();
    }

    const newCustomerSession = new CustomerSession(prepareCustomerSession);
    await newCustomerSession.save();
    if (!newCustomerSession) {
      throw new Error("Erreur lors de l'ajout du client à la session");
    }

    const sessionWithDetails = (await GET_SERVER_SESSION_WITH_DETAILS(
      UpdateSession._id
    )) as ISessionWithDetails;

    return {
      success: true,
      data: JSON.parse(JSON.stringify(sessionWithDetails)),
      error: null,
      feedback: ["Client ajouté à la session avec succès"],
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du client à la session:", error);
    if (error instanceof yup.ValidationError) {
      return {
        success: false,
        error: null,
        feedback: error.errors,
        data: null,
      };
    } else {
      const message = (error as Error).message;
      return {
        success: false,
        error: message,
        feedback: null,
        data: null,
      };
    }
  } finally {
    await disconnectDB();
  }
}

/*
 * Récupérer toutes les sessions clients
 * @returns {success: boolean, data: ICustomerSession[] | null, error: string | null, feedback: string | null}
 */
export async function GET_CUSTOMER_SESSIONS(): Promise<ICallbackForCustomerSessions> {
  try {
    await connectDB();
    const sessions = (await CustomerSession.find()) as ICustomerSession[];
    return {
      success: true,
      data: JSON.parse(JSON.stringify(sessions)),
      error: null,
      feedback: null,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des sessions clients:",
      error
    );
    const message = (error as Error).message;
    return { success: false, data: null, error: message, feedback: null };
  } finally {
    await disconnectDB();
  }
}

/*
 * Récupérer une session client par son id
 * @param id - The id of the customer session to get
 * @returns {success: boolean, data: ICustomerSession | null, error: string | null, feedback: string[] | null}
 *
 */
export async function GET_CUSTOMER_SESSION_BY_ID(
  id: string
): Promise<ICallbackForCustomerSession> {
  try {
    await connectDB();
    const thisCustomerSession = (await CustomerSession.findById(
      id
    )) as ICustomerSession;
    if (!thisCustomerSession) {
      throw new Error("Erreur lors de la récupération de la session client");
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(thisCustomerSession)),
      error: null,
      feedback: null,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la session client:",
      error
    );
    const message = (error as Error).message;
    return { success: false, data: null, error: message, feedback: null };
  } finally {
    await disconnectDB();
  }
}

/*
 * Update a customer session
 * @param customerId - The id of the customer session to update
 * @param data - The data to update the customer session with
 * @returns {success: boolean, data: ISessionWithDetails | null, error: string | null, feedback: string[] | null}
 * //TODO: Mettre en place l'envoi des mails en fonction des modifications
 */
export const UPDATE_CUSTOMER_SESSION = async (
  customerId: string,
  data: ICustomerSession
): Promise<ICallbackForSessionWithDetails> => {
  try {
    /* Validation circuit */
    const YupValidation = (await validateCustomerSession(
      data
    )) as ICustomerSession;
    const xssData = (await xssCustomerSession(
      YupValidation
    )) as ICustomerSession;

    await connectDB();
    const oldCustomer = (await CustomerSession.findById(
      customerId
    )) as ICustomerSession;

    if (xssData.status === "Validated" && oldCustomer.status !== "Validated") {
      xssData.validatedAt = new Date();
    }
    if (xssData.status === "Canceled" && oldCustomer.status !== "Canceled") {
      xssData.canceledAt = new Date();
    }

    /* Update customer */
    const updatedCustomer = await CustomerSession.findByIdAndUpdate(
      customerId,
      xssData as ICustomerSession,
      { new: true }
    );
    if (!updatedCustomer) {
      throw new Error("Customer not found");
    }

    /* Update session */
    if (updatedCustomer.number_of_people !== oldCustomer.number_of_people) {
      const newPlacesReserved =
        oldCustomer.number_of_people -
        (oldCustomer.number_of_people - updatedCustomer.number_of_people);
      const updatedSession = await Session.findByIdAndUpdate(
        updatedCustomer.sessionId,
        {
          placesReserved: newPlacesReserved,
        },
        { new: true }
      );
      if (!updatedSession) {
        throw new Error("Session not found");
      }
    }

    /* Get session with details */
    const sessionWithDetails = await GET_SERVER_SESSION_WITH_DETAILS(
      updatedCustomer.sessionId
    );
    if (!sessionWithDetails) {
      throw new Error("Session not found");
    }

    /* Return */
    return {
      success: true,
      data: JSON.parse(
        JSON.stringify(sessionWithDetails as ISessionWithDetails)
      ),
      feedback: ["La réservation a été modifiée avec succès"],
      error: null,
    };
  } catch (error: any) {
    console.error("Error updating customer:", error);

    if (error instanceof yup.ValidationError) {
      return {
        success: false,
        error: null,
        feedback: error.errors,
        data: null,
      };
    } else {
      const message = (error as Error).message;
      return {
        success: false,
        error: message,
        feedback: null,
        data: null,
      };
    }
  } finally {
    await disconnectDB();
  }
};

/*
 * Cancel a customer session
 * @param customerSessionId - The id of the customer session to cancel
 * @returns {success: boolean, data: ISessionWithDetails | null, error: string | null, feedback: string[] | null}
 * //TODO: Mettre en place l'envoi des mails lors de l'annulation
 */
export const CANCEL_CUSTOMER_SESSION = async (
  customerSessionId: string
): Promise<ICallbackForSessionWithDetails> => {
  try {
    await connectDB();
    const customerSession = (await CustomerSession.findById(
      customerSessionId
    )) as ICustomerSession;
    if (!customerSession) {
      throw new Error("Le client n'existe pas");
    }

    if (customerSession.status !== "Canceled") {
      const result = await CustomerSession.findByIdAndUpdate(
        customerSessionId,
        { status: "Canceled", canceledAt: new Date() },
        { new: true }
      );
      if (!result) {
        throw new Error("Erreur lors de l'annulation de la réservation");
      }

      const session = (await Session.findById(
        customerSession.sessionId
      )) as ISession;
      if (!session) {
        throw new Error("Erreur lors de la récupération de la session");
      }

      // Mettre à jour le nombre de places réservées
      const updatedSession = (await Session.findByIdAndUpdate(
        customerSession.sessionId,
        {
          placesReserved:
            session.placesReserved - customerSession.number_of_people,
        },
        { new: true }
      )) as ISession;

      if (!updatedSession) {
        throw new Error("Erreur lors de la mise à jour de la session");
      }

      const data = await GET_SERVER_SESSION_WITH_DETAILS(
        customerSession.sessionId
      );

      return {
        success: true,
        data: JSON.parse(JSON.stringify(data)),
        error: null,
        feedback: ["Client annulé avec succès"],
      };
    }
    return {
      success: false,
      data: null,
      error: null,
      feedback: ["Erreur lors de l'annulation de la customer session"],
    };
  } catch (error) {
    console.log("Erreur lors de l'annulation de la customer session:", error);
    const message = (error as Error).message;

    return {
      success: false,
      error: message,
      data: null,
      feedback: ["Erreur lors de l'annulation de la customer session"],
    };
  } finally {
    await disconnectDB();
  }
};

export const DELETE_CUSTOMER_SESSION = async (
  customerSessionId: string
): Promise<ICallbackForCustomerSession> => {
  try {
    await connectDB();
    const result = await CustomerSession.findByIdAndDelete(customerSessionId);
    if (!result) {
      throw new Error("Erreur lors de la suppression de la réservation");
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(result)),
      error: null,
      feedback: ["Customer session supprimée avec succès"],
    };
  } catch (error) {
    console.log("Erreur lors de la suppression de la customer session:", error);
    const message = (error as Error).message;
    return {
      success: false,
      error: message,
      data: null,
      feedback: ["Erreur lors de la suppression de la customer session"],
    };
  }
};
