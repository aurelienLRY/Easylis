"use server";

/* Gestion Database */
import { connectDB, disconnectDB, EventCalendar } from "@/libs/database";

/* Types */
import { IEventModel, ICallbackForEvent } from "@/types";

/**
 * Create an event
 * @param eventModel - The event model
 * @returns The callback for the event
 */
export const CREATE_EVENT = async (
  eventModel: IEventModel
): Promise<ICallbackForEvent> => {
  try {
    await connectDB();
    const newEvent = new EventCalendar(eventModel);
    await newEvent.save();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(newEvent)),
      feedback: ["Événement créé avec succès"],
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      feedback: null,
      error: error as string,
    };
  } finally {
    await disconnectDB();
  }
};

/**
 * Get an event by session id
 * @param sessionId - The session id
 * @returns The callback for the event
 */
export const GET_EVENT_BY_SESSION_ID = async (
  sessionId: string
): Promise<ICallbackForEvent> => {
  try {
    await connectDB();
    const event = await EventCalendar.findOne({ sessionId });
    return {
      success: true,
      data: JSON.parse(JSON.stringify(event)),
      feedback: ["Événement récupéré avec succès"],
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      feedback: null,
      error: error as string,
    };
  } finally {
    await disconnectDB();
  }
};

/**
 * Update an event
 * @param eventId - The event id
 * @param eventModel - The event model
 * @returns The callback for the event
 */
export const UPDATE_EVENT = async (
  eventId: string,
  eventModel: IEventModel
): Promise<ICallbackForEvent> => {
  try {
    await connectDB();
    const updatedEvent = await EventCalendar.findByIdAndUpdate(
      eventId,
      eventModel,
      {
        new: true,
      }
    );
    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedEvent)),
      feedback: ["Événement mis à jour avec succès"],
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      feedback: null,
      error: error as string,
    };
  } finally {
    await disconnectDB();
  }
};

/**
 * Delete an event
 * @param id - The id
 * @returns The callback for the event
 */
export const DELETE_EVENT = async (id: string): Promise<ICallbackForEvent> => {
  try {
    await connectDB();
    await EventCalendar.findByIdAndDelete(id);
    return {
      success: true,
      data: null,
      feedback: ["Événement supprimé avec succès"],
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      feedback: null,
      error: error as string,
    };
  } finally {
    await disconnectDB();
  }
};
