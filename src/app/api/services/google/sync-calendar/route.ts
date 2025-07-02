"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth";
import { connectDBOnce } from "@/libs/database/setting.mongoose";
import { User } from "@/libs/database";
import {
  GET_SESSIONS_WITH_DETAILS,
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
} from "@/services/GoogleCalendar";
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
      const events = await getEvent(user.tokenCalendar);
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
 */
const generateGoogleEvent = (session: ISessionWithDetails) => {
  const startDate = new Date(session.date);
  const [startHour, startMinute] = session.startTime.split(':').map(Number);
  startDate.setHours(startHour, startMinute, 0, 0);

  const endDate = new Date(session.date);
  const [endHour, endMinute] = session.endTime.split(':').map(Number);
  endDate.setHours(endHour, endMinute, 0, 0);

  return {
    summary: `${session.activity.name} - ${session.spot.name}`,
    description: `Activité: ${session.activity.name}\nLieu: ${session.spot.name}\nType: ${session.type_formule}\nPlaces réservées: ${session.placesReserved}/${session.placesMax}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'Europe/Paris',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'Europe/Paris',
    },
    location: session.spot.gpsCoordinates || session.spot.name,
  };
};

/**
 * Vérifie si un événement existe sur Google Calendar
 */
const checkEventExistsOnGoogle = async (credentials: ICredentials, eventId: string): Promise<boolean> => {
  try {
    const events = await getEvent(credentials.access_token);
    return events.data.items?.some((event: any) => event.id === eventId) || false;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'événement Google:", error);
    return false;
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

    // Récupérer toutes les sessions avec détails
    const sessionsResponse = await GET_SESSIONS_WITH_DETAILS();
    if (!sessionsResponse.success) {
      return createResponse(
        false,
        null,
        ["Erreur lors de la récupération des sessions"],
        null,
        500
      );
    }

    const sessions = sessionsResponse.data as ISessionWithDetails[];
    const validatedSessions = sessions.filter(s => s.status === "Actif");
    
    let eventsCreated = 0;
    let eventsUpdated = 0;
    let eventsDeleted = 0;
    const errors: string[] = [];

    // 1. Nettoyer les événements orphelins (sessions invalides)
    for (const session of sessions) {
      if (session.status !== "Actif") {
        const eventResponse = await GET_EVENT_BY_SESSION_ID(session._id);
        if (eventResponse.success && eventResponse.data) {
          const event = eventResponse.data as IEventModel;
          
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
            eventsDeleted++;
          } catch (error) {
            errors.push(`Erreur suppression BD event ${event._id}: ${error}`);
          }
        }
      }
    }

    // 2. Synchroniser les sessions valides
    for (const session of validatedSessions) {
      const eventResponse = await GET_EVENT_BY_SESSION_ID(session._id);
      
      if (eventResponse.success && eventResponse.data) {
        // Événement existe en BD, vérifier sur Google
        const event = eventResponse.data as IEventModel;
        const existsOnGoogle = await checkEventExistsOnGoogle(credentials, event.eventId);
        
        if (!existsOnGoogle) {
          // Événement n'existe pas sur Google, le recréer
          try {
            const googleEvent = generateGoogleEvent(session);
            const googleResponse = await addEvent(credentials.access_token, googleEvent);
            
            if (googleResponse.status === 200 && googleResponse.data.id) {
              // Mettre à jour l'ID de l'événement en BD
              await UPDATE_EVENT(event._id!, {
                ...event,
                eventId: googleResponse.data.id,
              });
              eventsUpdated++;
            }
          } catch (error) {
            errors.push(`Erreur recréation event session ${session._id}: ${error}`);
          }
        } else {
          // Événement existe sur Google, vérifier s'il est à jour
          try {
            const googleEvent = generateGoogleEvent(session);
            await updateEvent(credentials.access_token, googleEvent, event.eventId);
            eventsUpdated++;
          } catch (error) {
            errors.push(`Erreur mise à jour event session ${session._id}: ${error}`);
          }
        }
      } else {
        // Événement n'existe pas en BD, le créer
        try {
          const googleEvent = generateGoogleEvent(session);
          const googleResponse = await addEvent(credentials.access_token, googleEvent);
          
          if (googleResponse.status === 200 && googleResponse.data.id) {
            await CREATE_EVENT({
              eventId: googleResponse.data.id,
              sessionId: session._id,
            });
            eventsCreated++;
          }
        } catch (error) {
          errors.push(`Erreur création event session ${session._id}: ${error}`);
        }
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