"use server";

import { NextRequest, NextResponse } from "next/server";
import { connectDBOnce } from "@/libs/database/setting.mongoose";
import { EventCalendar } from "@/libs/database/models/EventCalendar.model";
import { getEvent } from "@/services/GoogleCalendar";
import { ICallback } from "@/types";

interface IEventExistsResponse {
  existsInDB: boolean;
  existsInGoogle: boolean;
  eventId?: string;
}

/**
 * POST - Vérifie si un événement existe en base de données et sur Google Calendar
 * @route POST /api/services/google/events/check-exists
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ICallback & { data: IEventExistsResponse }>> {
  try {
    await connectDBOnce();
    const { sessionId, refreshToken } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          data: {
            existsInDB: false,
            existsInGoogle: false,
          },
          feedback: null,
          error: "SessionId manquant",
        },
        { status: 400 }
      );
    }

    // Vérification en base de données
    const eventInDB = await EventCalendar.findOne({ sessionId });
    const existsInDB = !!eventInDB;
    const eventId = eventInDB?.eventId;

    let existsInGoogle = false;

    // Vérification sur Google Calendar si on a un refreshToken et un eventId
    if (refreshToken && eventId) {
      try {
        const googleResponse = await getEvent(refreshToken);
        
        // Vérifier si l'événement existe dans la liste des événements Google
        if (googleResponse.data?.items) {
          existsInGoogle = googleResponse.data.items.some(
            (event: any) => event.id === eventId
          );
        }
      } catch (error) {
        console.warn("Impossible de vérifier l'événement sur Google Calendar:", error);
        // On ne considère pas cela comme une erreur fatale
        existsInGoogle = false;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          existsInDB,
          existsInGoogle,
          eventId: eventId || undefined,
        },
        feedback: null,
        error: null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erreur lors de la vérification de l'événement:", error);
    return NextResponse.json(
      {
        success: false,
        data: {
          existsInDB: false,
          existsInGoogle: false,
        },
        feedback: null,
        error: error.message || "Erreur lors de la vérification de l'événement",
      },
      { status: 500 }
    );
  }
} 