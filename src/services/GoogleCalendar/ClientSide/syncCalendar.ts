import { generateEvent } from "./generateEvent";
import { 
  fetcherAddEvent, 
  fetcherUpdateEvent, 
  fetcherDeleteEvent,
  fetcherCheckEventExists 
} from "./index";
import { ISessionWithDetails, ICallback, IEventModel } from "@/types";

interface SyncResult {
  validatedSessions: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  errors: string[];
}

/**
 * Supprime un événement orphelin (session invalide)
 */
const deleteOrphanEvent = async (
  refreshToken: string,
  session: ISessionWithDetails,
  errors: string[]
): Promise<number> => {
  try {
    // Vérifier si l'événement existe en base de données
    const eventExistsResult = await fetcherCheckEventExists(session._id, refreshToken);
    
    if (!eventExistsResult.success || !eventExistsResult.data?.existsInDB) {
      return 0;
    }

    const eventData = eventExistsResult.data;
    let deletedCount = 0;

    // Si l'événement existe sur Google, le supprimer
    if (eventData.existsInGoogle && eventData.eventId) {
      try {
        await fetcherDeleteEvent(refreshToken, session._id);
        deletedCount++;
      } catch (error) {
        errors.push(`Erreur suppression Google event ${eventData.eventId}: ${error}`);
      }
    }

    return deletedCount;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement orphelin:", error);
    return 0;
  }
};

/**
 * Synchronise un événement existant
 */
const syncExistingEvent = async (
  refreshToken: string,
  session: ISessionWithDetails,
  eventExistsData: any,
  errors: string[]
): Promise<{ updated: number; created: number }> => {
  let updated = 0;
  let created = 0;

  try {
    // Toujours essayer de mettre à jour l'événement existant
    console.log(`Tentative de mise à jour de l'événement pour la session ${session._id}`);
    const googleEvent = generateEvent(session);
    await fetcherUpdateEvent(refreshToken, googleEvent, session._id);
    updated++;
    console.log(`Événement pour la session ${session._id} mis à jour avec succès`);
  } catch (error: any) {
    // Si l'événement n'existe pas sur Google, le recréer
    if (error.code === 404 || error.message?.includes("404") || !eventExistsData.existsInGoogle) {
      console.log(`Événement pour la session ${session._id} non trouvé sur Google, recréation...`);
      try {
        const googleEvent = generateEvent(session);
        const result = await fetcherAddEvent(refreshToken, googleEvent, session._id);

        if (result.success) {
          created++;
          console.log(`Événement recréé pour la session ${session._id}`);
        }
      } catch (addError) {
        errors.push(`Erreur recréation event session ${session._id}: ${addError}`);
      }
    } else {
      console.error(`Erreur lors de la mise à jour de l'événement pour la session ${session._id}:`, error);
      errors.push(`Erreur mise à jour event session ${session._id}: ${error}`);
    }
  }

  return { updated, created };
};

/**
 * Crée un nouvel événement
 */
const createNewEvent = async (
  refreshToken: string,
  session: ISessionWithDetails,
  errors: string[]
): Promise<number> => {
  try {
    const googleEvent = generateEvent(session);
    const result = await fetcherAddEvent(refreshToken, googleEvent, session._id);

    if (result.success) {
      return 1;
    }
    return 0;
  } catch (error) {
    errors.push(`Erreur création event session ${session._id}: ${error}`);
    return 0;
  }
};

/**
 * Fonction principale de synchronisation du calendrier
 * @param sessions - Les sessions à synchroniser (depuis le store)
 * @param refreshToken - Le token de rafraîchissement Google Calendar
 * @returns Le résultat de la synchronisation
 */
export const syncCalendar = async (
  sessions: ISessionWithDetails[],
  refreshToken: string
): Promise<ICallback & { data: SyncResult }> => {
  try {
    if (!refreshToken) {
      return {
        success: false,
        data: {
          validatedSessions: 0,
          eventsCreated: 0,
          eventsUpdated: 0,
          eventsDeleted: 0,
          errors: ["Aucun token Google Calendar valide trouvé"],
        },
        error: "Token manquant",
        feedback: ["Veuillez d'abord connecter votre calendrier Google"],
      };
    }

    // Filtrer les sessions valides
    const validatedSessions = sessions.filter(s => s.status === "Actif");
    
    let eventsCreated = 0;
    let eventsUpdated = 0;
    let eventsDeleted = 0;
    const errors: string[] = [];

    // 1. Nettoyer les événements orphelins (sessions invalides)
    for (const session of sessions) {
      if (session.status !== "Actif") {
        eventsDeleted += await deleteOrphanEvent(refreshToken, session, errors);
      }
    }

    // 2. Synchroniser les sessions valides
    for (const session of validatedSessions) {
      try {
        // Vérifier si un événement existe pour cette session
        const eventExistsResult = await fetcherCheckEventExists(session._id, refreshToken);
        
        if (eventExistsResult.success && eventExistsResult.data?.existsInDB) {
          // Événement existe en BD, le synchroniser
          console.log(`Synchronisation de l'événement pour la session ${session._id}`);
          const syncResult = await syncExistingEvent(refreshToken, session, eventExistsResult.data, errors);
          eventsUpdated += syncResult.updated;
          eventsCreated += syncResult.created;
          console.log(`Résultat: ${syncResult.updated} mis à jour, ${syncResult.created} créés`);
        } else {
          // Événement n'existe pas en BD, le créer
          console.log(`Création d'un nouvel événement pour la session ${session._id}`);
          eventsCreated += await createNewEvent(refreshToken, session, errors);
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de la session ${session._id}:`, error);
        errors.push(`Erreur lors du traitement de la session ${session._id}: ${error}`);
      }
    }

    const result: SyncResult = {
      validatedSessions: validatedSessions.length,
      eventsCreated,
      eventsUpdated,
      eventsDeleted,
      errors,
    };

    return {
      success: true,
      data: result,
      error: null,
      feedback: [
        `Synchronisation terminée: ${eventsCreated} créés, ${eventsUpdated} mis à jour, ${eventsDeleted} supprimés`,
      ],
    };

  } catch (error: any) {
    console.error("Erreur lors de la synchronisation:", error);
    return {
      success: false,
      data: {
        validatedSessions: 0,
        eventsCreated: 0,
        eventsUpdated: 0,
        eventsDeleted: 0,
        errors: [`Erreur lors de la synchronisation: ${error.message}`],
      },
      error: error.message,
      feedback: ["Erreur lors de la synchronisation du calendrier"],
    };
  }
};
