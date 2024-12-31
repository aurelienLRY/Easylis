"use server";
/* libs */
import * as yup from "yup";
import xss from "xss";

/* Type*/
import {
  ISession,
  ISessionWithDetails,
  ICallbackForSessionWithDetails,
  ICallbackForSessions,
  ICallbackForSession,
  ICallbackForSessionWithDetailsArray,
} from "@/types";
/* Gestion Database */
import { connectDB, disconnectDB, Session } from "@/libs/database";

/*  actions */
import {
  GET_SERVER_SESSIONS_WITH_DETAILS,
  GET_SERVER_SESSION_WITH_DETAILS,
} from "@/libs/ServerAction";
import { sessionSchema } from "@/libs/yup";

/**
 * Validate session
 * @param session - The session to validate
 * @returns The validated session
 */
export const validateSession = async (
  session: ISession
): Promise<ISession | object> => {
  try {
    const validation = await sessionSchema.validate(session, {
      abortEarly: false,
    });
    return validation as ISession;
  } catch (error) {
    console.error("Erreur lors de la validation de la session:", error);
    return error as object;
  }
};

/**
 * XSS the session
 * @param session - The session to xss
 * @returns The xss session
 */
export const xssSession = async (session: ISession): Promise<ISession> => {
  try {
    const xssSession = {
      ...session,
      status: xss(session.status),
      date: session.date,
      startTime: xss(session.startTime),
      endTime: xss(session.endTime),
      activity: xss(session.activity),
      spot: xss(session.spot),
      type_formule: xss(session.type_formule),
      duration: session.duration ? xss(session.duration) : null,
    };
    return JSON.parse(JSON.stringify(xssSession));
  } catch (error) {
    console.error("Erreur lors du xss de la session:", error);
    throw error;
  }
};

/**
 * Create a session
 * @param formData - The session to create
 * @returns the session created with details
 */
export async function CREATE_SESSION(
  formData: ISession
): Promise<ICallbackForSessionWithDetails> {
  try {
    /* validation and xss */
    const YupValidation = await validateSession(formData);
    const xssData = await xssSession(YupValidation as ISession);

    /* connect to database */
    await connectDB();

    /* create session */
    const newSession = new Session(xssData);
    await newSession.save();

    /* get session with details */
    const sessionWithDetails = (await GET_SERVER_SESSION_WITH_DETAILS(
      newSession._id
    )) as ISessionWithDetails;
    return {
      success: true,
      data: JSON.parse(JSON.stringify(sessionWithDetails)),
      feedback: ["Session créée avec succès"],
      error: null,
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      console.error("Erreur lors de la création de la session:", error);
      return {
        success: false,
        error: null,
        feedback: error.errors,
        data: null,
      };
    } else {
      const message = (error as Error).message;
      console.error("Erreur lors de la création de la session:", error);
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

/**
 * Récupérer toutes les sessions
 * @returns {success: boolean, data: ISession[] | null, error: string | null, feedback: string | null}
 */
export async function GET_SESSIONS(): Promise<ICallbackForSessions> {
  try {
    await connectDB();
    const sessions = (await Session.find()) as ISession[];
    if (sessions.length === 0) {
      return {
        success: false,
        data: null,
        error: "Aucune session trouvée",
        feedback: null,
      };
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(sessions)),
      error: null,
      feedback: null,
    };
  } catch (error) {
    const message = (error as Error).message;
    console.error("Erreur lors de la récupération des sessions:", error);
    return {
      success: false,
      data: null,
      error: message,
      feedback: ["Erreur lors de la récupération des sessions"],
    };
  } finally {
    await disconnectDB();
  }
}

/**
 * Récupérer une session par son id
 * @param id
 * @returns {success: boolean, data: ISession | null, error: string | null, feedback: string | null}
 */
export async function GET_SESSION_BY_ID(
  id: string
): Promise<ICallbackForSession> {
  try {
    await connectDB();
    const session = (await Session.findById(id)) as ISession | null;
    if (!session) {
      return {
        success: false,
        data: null,
        error: "Session non trouvée",
        feedback: null,
      };
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(session)),
      error: null,
      feedback: null,
    };
  } catch (error) {
    const message = (error as Error).message;
    console.error("Erreur lors de la récupération de la session:", error);
    return {
      success: false,
      data: null,
      error: message,
      feedback: ["Erreur lors de la récupération de la session"],
    };
  } finally {
    await disconnectDB();
  }
}

/**
 *  function to get all sessions with details
 * @returns {success: boolean, data: ISessionWithDetails[] | null, error: string | null, feedback: string | null}
 */
export async function GET_SESSIONS_WITH_DETAILS(): Promise<ICallbackForSessionWithDetailsArray> {
  try {
    await connectDB();

    const sessionsWithDetails = await GET_SERVER_SESSIONS_WITH_DETAILS();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(sessionsWithDetails)),
      error: null,
      feedback: null,
    };
  } catch (error) {
    const message = (error as Error).message;
    console.error(
      "Erreur lors de la récupération des sessions avec détails:",
      error
    );
    return {
      success: false,
      data: null,
      error: message,
      feedback: null,
    };
  } finally {
    await disconnectDB();
  }
}

/**
 * Update a session
 * @param sessionId
 * @param data
 * @returns {success: boolean, data: ISessionWithDetails | null, error: string | null, feedback: string[] | string | null}
 */
export const UPDATE_SESSION = async (
  sessionId: string,
  data: ISession
): Promise<ICallbackForSessionWithDetails> => {
  try {
    /* Validation & xss */
    const YupValidation = await validateSession(data);
    const xssData = await xssSession(YupValidation as ISession);

    // Filtrer les champs pertinents pour la mise à jour
    const updateData: Partial<ISession> = {
      status: xssData.status,
      date: xssData.date,
      startTime: xssData.startTime,
      endTime: xssData.endTime,
      activity: xssData.activity,
      spot: xssData.spot,
      placesMax: xssData.placesMax,
      placesReserved: xssData.placesReserved,
      type_formule: xssData.type_formule,
      duration: xssData.duration,
    };

    await connectDB();
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true }
    );
    if (!updatedSession) {
      throw new Error("Session non trouvée");
    }
    const sessionWithDetails = await GET_SERVER_SESSION_WITH_DETAILS(sessionId);
    return {
      success: true,
      data: JSON.parse(
        JSON.stringify(sessionWithDetails as ISessionWithDetails)
      ),
      feedback: ["Session modifiée avec succès"],
      error: null,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de la session:", error);
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

/**
 *
 * @param sessionId
 * @returns {success: boolean, data: ISession | null, error: string | null, feedback: string | null}
 */
export const DELETE_SESSION = async (
  sessionId: string
): Promise<ICallbackForSession> => {
  try {
    await connectDB();
    const session = (await Session.findById(sessionId)) as ISession;
    if (!session) {
      throw new Error("Session not found");
    }
    if (session.status !== "Archived") {
      throw new Error("La session doit être archivée");
    } else if (session.status === "Archived") {
      const result = await Session.findByIdAndDelete(sessionId);
      return {
        success: true,
        data: JSON.parse(JSON.stringify(result)),
        error: null,
        feedback: ["Session supprimée avec succès"],
      };
    }
    throw new Error("Erreur lors de la suppression de la session");
  } catch (error) {
    console.log("Erreur lors de la suppression de la session:", error);
    const message = (error as Error).message;
    return { success: false, error: message, data: null, feedback: null };
  } finally {
    await disconnectDB();
  }
};
