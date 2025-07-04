"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth";
import { connectDBOnce } from "@/libs/database/setting.mongoose";
import { User } from "@/libs/database";
import {
  GET_SERVER_SESSIONS_WITH_DETAILS,
  GET_EVENT_BY_SESSION_ID,
  CREATE_EVENT,
  DELETE_EVENT,
  UPDATE_EVENT,
} from "@/libs/ServerAction";
import {
  getEvent,
  addEvent,
  deleteEvent,
  updateEvent,
  refreshAccessToken,
  checkToken,
} from "@/services/GoogleCalendar/ServerSide";
import { generateEvent } from "@/services/GoogleCalendar/ClientSide/generateEvent";
import { createResponse } from "@/utils/ServerSide";

/* Types */
import {
  ISessionWithDetails,
  ICallback,
  IEventModel,
  ICredentials,
} from "@/types";

interface SyncResult {
  success: boolean;
  data: {
    validatedSessions: number;
    eventsCreated: number;
    eventsUpdated: number;
    eventsDeleted: number;
    errors: string[];
  };
  error: string | null;
  feedback: string[] | null;
}

/**
 * Fonction pour convertir une chaîne de date en objet Date correct
 * @param dateString - La date au format string ou Date
 * @returns Un objet Date correctement interprété
 */
const parseDateCorrectly = (dateString: string | Date): Date => {
  // Si c'est déjà un objet Date, le retourner
  if (typeof dateString === 'object' && dateString instanceof Date) {
    return dateString;
  }
  
  // Si c'est une chaîne ISO, la parser en tenant compte du fuseau horaire
  const date = new Date(dateString as string);
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    throw new Error(`Date invalide: ${dateString}`);
  }
  
  return date;
};

/**
 * Fonction pour corriger les dates d'une session
 * @param session - La session avec les dates potentiellement incorrectes
 * @returns La session avec les dates corrigées
 */
const fixSessionDates = (session: any) => {
  return {
    ...session,
    date: parseDateCorrectly(session.date),
  };
};

/**
 * Vérifie si l'utilisateur a un token Google Calendar valide
 */
const checkUserGoogleToken = async (userId: string): Promise<ICredentials | null> => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.tokenCalendar || !user.tokenRefreshCalendar) {
      return null;
    }

    // Vérifier si le token est encore valide
    try {
      await checkToken(user.tokenCalendar);
      return {
        access_token: user.tokenCalendar,
        refresh_token: user.tokenRefreshCalendar,
        scope: 'https://www.googleapis.com/auth/calendar',
        token_type: 'Bearer',
        expiry_date: Date.now() + 3600000, // 1 heure
      };
    } catch (error) {
      // Token expiré, essayer de le rafraîchir
      try {
        const newTokens = await refreshAccessToken(user.tokenRefreshCalendar);
        // Mettre à jour les tokens en base
        await User.findByIdAndUpdate(userId, {
          tokenCalendar: newTokens.credentials.access_token,
          tokenRefreshCalendar: newTokens.credentials.refresh_token || user.tokenRefreshCalendar,
        });
        return newTokens.credentials as unknown as ICredentials;
      } catch (refreshError) {
        console.error("Erreur lors du rafraîchissement du token:", refreshError);
        return null;
      }
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return null;
  }
};

/**
 * Génère un événement Google Calendar à partir d'une session
 * Utilise la fonction generateEvent du dossier ClientSide
 */
const generateGoogleEvent = (session: ISessionWithDetails) => {
  return generateEvent(session);
};

/**
 * Vérifie si un événement existe sur Google Calendar
 * Utilise une approche plus fiable en essayant de récupérer l'événement spécifique
 */
const checkEventExistsOnGoogle = async (credentials: ICredentials, eventId: string): Promise<boolean> => {
  try {
    // Utiliser directement l'API Google Calendar pour récupérer l'événement spécifique
    const { google } = await import("googleapis");
    const oauth2Client = await refreshAccessToken(credentials.refresh_token);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    await calendar.events.get({
      calendarId: "primary",
      eventId: eventId,
    });
    
    return true; // Si on arrive ici, l'événement existe
  } catch (error: any) {
    // Si l'erreur est 404, l'événement n'existe pas
    if (error.code === 404) {
      return false;
    }
    console.error("Erreur lors de la vérification de l'événement Google:", error);
    return false;
  }
};

/**
 * Supprime un événement orphelin (session invalide)
 */
const deleteOrphanEvent = async (
  credentials: ICredentials,
  session: ISessionWithDetails,
  errors: string[]
): Promise<number> => {
  const eventResponse = await GET_EVENT_BY_SESSION_ID(session._id);
  if (!eventResponse.success || !eventResponse.data) {
    return 0;
  }

  const event = eventResponse.data as IEventModel;
  let deletedCount = 0;

  // Vérifier si l'événement existe sur Google et le supprimer
  const existsOnGoogle = await checkEventExistsOnGoogle(credentials, event.eventId);
  if (existsOnGoogle) {
    try {
      await deleteEvent(credentials.access_token, event.eventId);
    } catch (error) {
      errors.push(`Erreur suppression Google event ${event.eventId}: ${error}`);
    }
  }

  // Supprimer l'événement de la base de données
  try {
    await DELETE_EVENT(event._id!);
    deletedCount++;
  } catch (error) {
    errors.push(`Erreur suppression BD event ${event._id}: ${error}`);
  }

  return deletedCount;
};

/**
 * Synchronise un événement existant
 */
const syncExistingEvent = async (
  credentials: ICredentials,
  session: ISessionWithDetails,
  event: IEventModel,
  errors: string[]
): Promise<{ updated: number; created: number }> => {
  let updated = 0;
  let created = 0;

  try {
    // Toujours essayer de mettre à jour l'événement existant
    console.log(`Tentative de mise à jour de l'événement ${event.eventId}`);
    const googleEvent = generateGoogleEvent(session);
    await updateEvent(credentials.access_token, googleEvent, event.eventId);
    updated++;
    console.log(`Événement ${event.eventId} mis à jour avec succès`);
  } catch (error: any) {
    // Si l'erreur est 404, l'événement n'existe pas sur Google, le recréer
    if (error.code === 404) {
      console.log(`Événement ${event.eventId} non trouvé sur Google, recréation...`);
      try {
        const googleEvent = generateGoogleEvent(session);
        const googleResponse = await addEvent(credentials.access_token, googleEvent);

        if (googleResponse.status === 200 && googleResponse.data.id) {
          // Mettre à jour l'ID de l'événement en BD
          await UPDATE_EVENT(event._id!, {
            ...event,
            eventId: googleResponse.data.id,
          });
          created++;
          console.log(`Événement recréé avec le nouvel ID: ${googleResponse.data.id}`);
        }
      } catch (addError) {
        errors.push(`Erreur recréation event session ${session._id}: ${addError}`);
      }
    } else {
      console.error(`Erreur lors de la mise à jour de l'événement ${event.eventId}:`, error);
      errors.push(`Erreur mise à jour event session ${session._id}: ${error}`);
    }
  }

  return { updated, created };
};

/**
 * Crée un nouvel événement
 */
const createNewEvent = async (
  credentials: ICredentials,
  session: ISessionWithDetails,
  errors: string[]
): Promise<number> => {
  try {
    const googleEvent = generateGoogleEvent(session);
    const googleResponse = await addEvent(credentials.access_token, googleEvent);

    if (googleResponse.status === 200 && googleResponse.data.id) {
      await CREATE_EVENT({
        eventId: googleResponse.data.id,
        sessionId: session._id,
      });
      return 1;
    }
    return 0;
  } catch (error) {
    errors.push(`Erreur création event session ${session._id}: ${error}`);
    return 0;
  }
};

/**
 * API de synchronisation du calendrier Google
 */
export async function POST(req: NextRequest): Promise<NextResponse<SyncResult>> {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user._id) {
      return createResponse(
        false,
        null,
        ["Vous devez être connecté pour synchroniser le calendrier"],
        null,
        401
      );
    }

    await connectDBOnce();

    // Vérifier les tokens Google Calendar
    const credentials = await checkUserGoogleToken(session.user._id);
    if (!credentials) {
      return createResponse(
        false,
        null,
        ["Aucun token Google Calendar valide trouvé"],
        null,
        400
      );
    }

    // Récupérer toutes les sessions avec détails directement (sans sérialisation)
    const sessions = await GET_SERVER_SESSIONS_WITH_DETAILS();
    const validatedSessions = sessions.filter(s => s.status === "Actif");
    
    let eventsCreated = 0;
    let eventsUpdated = 0;
    let eventsDeleted = 0;
    const errors: string[] = [];

    // 1. Nettoyer les événements orphelins (sessions invalides)
    for (const session of sessions) {
      if (session.status !== "Actif") {
        eventsDeleted += await deleteOrphanEvent(credentials, session, errors);
      }
    }

    // 2. Synchroniser les sessions valides
    for (const session of validatedSessions) {
      const eventResponse = await GET_EVENT_BY_SESSION_ID(session._id);
      
      if (eventResponse.success && eventResponse.data) {
        // Événement existe en BD, le synchroniser
        const event = eventResponse.data as IEventModel;
        console.log(`Synchronisation de l'événement ${event.eventId} pour la session ${session._id}`);
        const syncResult = await syncExistingEvent(credentials, session, event, errors);
        eventsUpdated += syncResult.updated;
        eventsCreated += syncResult.created;
        console.log(`Résultat: ${syncResult.updated} mis à jour, ${syncResult.created} créés`);
      } else {
        // Événement n'existe pas en BD, le créer
        console.log(`Création d'un nouvel événement pour la session ${session._id}`);
        eventsCreated += await createNewEvent(credentials, session, errors);
      }
    }

    const result: SyncResult = {
      success: true,
      data: {
        validatedSessions: validatedSessions.length,
        eventsCreated,
        eventsUpdated,
        eventsDeleted,
        errors,
      },
      error: null,
      feedback: [
        `Synchronisation terminée: ${eventsCreated} créés, ${eventsUpdated} mis à jour, ${eventsDeleted} supprimés`,
      ],
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("Erreur lors de la synchronisation:", error);
    return createResponse(
      false,
      null,
      ["Erreur lors de la synchronisation du calendrier"],
      error.message,
      500
    );
  }
}