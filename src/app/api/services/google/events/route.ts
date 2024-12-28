"use server";

/* libraries */
import { NextRequest, NextResponse } from "next/server";

/* services */
import {
  addEvent,
  getEvent,
  updateEvent,
  deleteEvent,
} from "@/services/GoogleCalendar";

/* types */
import { ICallback } from "@/types";

/* Actions */
import {
  CREATE_EVENT,
  DELETE_EVENT,
  GET_EVENT_BY_SESSION_ID,
} from "@/libs/ServerAction";
import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";

/**
 * Gestionnaire d'erreurs centralisé
 * @param error - L'erreur à traiter
 * @param defaultMessage - Message par défaut si l'erreur n'a pas de message
 * @returns Response avec les détails de l'erreur
 */
const handleError = (
  error: any,
  defaultMessage: string
): NextResponse<ICallback> => {
  console.error(`Erreur: ${defaultMessage}`, error);
  return NextResponse.json(
    {
      success: false,
      data: null,
      feedback: null,
      error: error.message || defaultMessage,
    },
    { status: 500 }
  );
};

/**
 * Validation des paramètres requis
 * @param params - Objet contenant les paramètres à valider
 * @param requiredParams - Liste des paramètres requis
 * @returns true si tous les paramètres sont présents, false sinon
 */
const validateParams = (params: any, requiredParams: string[]): boolean => {
  return requiredParams.every(
    (param) => params[param] !== undefined && params[param] !== null
  );
};

/**
 * GET - Récupère les événements du calendrier Google
 * @route GET /api/services/google/events
 */
export async function GET(req: NextRequest): Promise<NextResponse<ICallback>> {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        feedback: null,
        error: "Token manquant",
      },
      { status: 400 }
    );
  }

  try {
    const response = await getEvent(token);
    return NextResponse.json(
      {
        success: true,
        data: response.data.items || [],
        feedback: null,
        error: null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return handleError(error, "Impossible de récupérer les événements");
  }
}

/**
 * POST - Ajoute un événement au calendrier Google
 * @route POST /api/services/google/events
 */
export async function POST(req: NextRequest): Promise<NextResponse<ICallback>> {
  try {
    const { refreshToken, event, sessionId } = await req.json();

    if (
      !validateParams({ refreshToken, event, sessionId }, [
        "refreshToken",
        "event",
        "sessionId",
      ])
    ) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          feedback: null,
          error: "Paramètres manquants",
        },
        { status: 400 }
      );
    }

    const response = await addEvent(refreshToken, event);

    if (response.status === 200 && response.data.id) {
      const result = await CREATE_EVENT({
        eventId: response.data.id,
        sessionId: sessionId,
      });

      if (!result.success) {
        throw new Error(
          "Impossible d'enregistrer l'événement en base de données"
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: response.data,
          feedback: null,
          error: null,
        },
        { status: 200 }
      );
    }

    throw new Error("Impossible d'ajouter un événement à Google Calendar");
  } catch (error: any) {
    return handleError(error, "Impossible d'ajouter un événement");
  }
}

/**
 * PUT - Met à jour un événement dans le calendrier Google
 * @route PUT /api/services/google/events
 */
export async function PUT(req: NextRequest): Promise<NextResponse<ICallback>> {
  try {
    const { refreshToken, event, sessionId } = await req.json();

    if (
      !validateParams({ refreshToken, event, sessionId }, [
        "refreshToken",
        "event",
        "sessionId",
      ])
    ) {
      throw new Error("Paramètres manquants");
    }

    const EventDB = await GET_EVENT_BY_SESSION_ID(sessionId);
    if (!EventDB.success || !EventDB.data) {
      throw new Error("Événement non trouvé");
    }

    const response = await updateEvent(
      refreshToken,
      event,
      EventDB.data.eventId
    );

    return NextResponse.json(
      {
        success: true,
        data: response.data,
        feedback: null,
        error: null,
      },
      { status: response.status }
    );
  } catch (error: any) {
    return handleError(error, "Impossible de mettre à jour l'événement");
  }
}

/**
 * DELETE - Supprime un événement du calendrier Google
 * @route DELETE /api/services/google/events
 */
export async function DELETE(
  req: NextRequest
): Promise<NextResponse<ICallback>> {
  try {
    await connectDB();
    const { refreshToken, sessionId } = await req.json();

    if (
      !validateParams({ refreshToken, sessionId }, [
        "refreshToken",
        "sessionId",
      ])
    ) {
      throw new Error("Paramètres manquants");
    }

    const EventDB = await GET_EVENT_BY_SESSION_ID(sessionId);
    if (!EventDB.success || !EventDB.data) {
      throw new Error("Événement non trouvé");
    }

    const response = await deleteEvent(refreshToken, EventDB.data.eventId);

    if (response.status === 204) {
      const result = await DELETE_EVENT(EventDB.data._id as string);
      if (!result.success) {
        throw new Error(
          "Impossible de supprimer l'événement en base de données"
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: null,
          feedback: ["Événement supprimé avec succès"],
          error: null,
        },
        { status: 200 }
      );
    }

    throw new Error("Impossible de supprimer l'événement de Google Calendar");
  } catch (error: any) {
    return handleError(error, "Impossible de supprimer l'événement");
  } finally {
    await disconnectDB();
  }
}
