"use client";

import { useState, useCallback } from "react";
import {
  fetcherAddEvent,
  fetcherUpdateEvent,
  fetcherDeleteEvent,
  fetcherCheckEventExists,
  generateEvent,
} from "@/services/GoogleCalendar/ClientSide";
import { syncCalendar as syncCalendarClient } from "@/services/GoogleCalendar/ClientSide/syncCalendar";
import { ICalendarEvent, ISessionWithDetails, ICallback, IUser } from "@/types";
import { useSessionWithDetails } from "@/store";
import { useProfile } from "@/store";
import { useCalendar } from "@/store";

interface IEventExistsResponse {
  existsInDB: boolean;
  existsInGoogle: boolean;
  eventId?: string;
}

interface IUseGoogleCalendarReturn {
  // États de chargement
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isChecking: boolean;
  isSyncing: boolean;

  // Fonctions principales
  addEvent: (refreshToken: string, event: ICalendarEvent, sessionId: string) => Promise<ICallback>;
  updateEvent: (refreshToken: string, event: ICalendarEvent, sessionId: string) => Promise<ICallback>;
  deleteEvent: (refreshToken: string, sessionId: string) => Promise<ICallback>;
  checkEventExists: (sessionId: string, refreshToken?: string) => Promise<ICallback & { data: IEventExistsResponse }>;
  syncCalendar: () => Promise<ICallback>;
  generateEventFromSession: (session: ISessionWithDetails) => ICalendarEvent;

  // Fonction utilitaire pour gérer un événement complet
  handleEvent: (refreshToken: string, session: ISessionWithDetails, action: 'add' | 'update' | 'delete') => Promise<ICallback>;
}

/**
 * Hook personnalisé pour gérer les opérations Google Calendar
 * @returns Objet contenant toutes les fonctions et états nécessaires
 */
export const useGoogleCalendar = (): IUseGoogleCalendarReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Utiliser les stores pour récupérer les données
  const { SessionWithDetails } = useSessionWithDetails();
  const { profile } = useProfile();

 /**
  * Ajouter un événement
  * @param refreshToken - Le token de rafraîchissement
  * @param event - L'événement à ajouter
  * @param sessionId - L'ID de la session
  * @returns Le résultat de l'ajout de l'événement
  */
  const addEvent = useCallback(async (
    refreshToken: string,
    event: ICalendarEvent,
    sessionId: string
  ): Promise<ICallback> => {
    setIsAdding(true);
    try {
      const result = await fetcherAddEvent(refreshToken, event, sessionId);
      return result;
    } finally {
      setIsAdding(false);
    }
  }, []);

  /**
   * Mettre à jour un événement
   * @param refreshToken - Le token de rafraîchissement
   * @param event - L'événement à mettre à jour
   * @param sessionId - L'ID de la session
   * @returns Le résultat de la mise à jour de l'événement
   */
  const updateEvent = useCallback(async (
    refreshToken: string,
    event: ICalendarEvent,
    sessionId: string
  ): Promise<ICallback> => {
    setIsUpdating(true);
    try {
      const result = await fetcherUpdateEvent(refreshToken, event, sessionId);
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Supprimer un événement
   * @param refreshToken - Le token de rafraîchissement
   * @param sessionId - L'ID de la session
   * @returns Le résultat de la suppression de l'événement
   */
  const deleteEvent = useCallback(async (
    refreshToken: string,
    sessionId: string
  ): Promise<ICallback> => {
    setIsDeleting(true);
    try {
      const result = await fetcherDeleteEvent(refreshToken, sessionId);
      return result;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  /**
   * Vérifier si un événement existe
   * @param sessionId - L'ID de la session
   * @param refreshToken - Le token de rafraîchissement
   * @returns Le résultat de la vérification de l'événement
   */
  const checkEventExists = useCallback(async (
    sessionId: string,
    refreshToken?: string
  ): Promise<ICallback & { data: IEventExistsResponse }> => {
    setIsChecking(true);
    try {
      const result = await fetcherCheckEventExists(sessionId, refreshToken);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Synchroniser le calendrier
   * @returns Le résultat de la synchronisation
   */
  const syncCalendar = useCallback(async (): Promise<ICallback> => {
    setIsSyncing(true);
    try {
      // Vérifier que le profil et le token sont disponibles
      if (!profile || !profile.tokenRefreshCalendar) {
        return {
          success: false,
          data: null,
          error: "Token manquant",
          feedback: ["Veuillez d'abord connecter votre calendrier Google"],
        };
      }

      // Utiliser la nouvelle fonction de synchronisation côté client
      const result = await syncCalendarClient(SessionWithDetails, profile.tokenRefreshCalendar);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [SessionWithDetails, profile]);

  /**
   * Générer un événement à partir d'une session
   * @param session - La session à partir de laquelle générer l'événement
   * @returns L'événement généré
   */
  const generateEventFromSession = useCallback((session: ISessionWithDetails): ICalendarEvent => {
    return generateEvent(session);
  }, []);

  /**
   * Gérer un événement complet
   * @param refreshToken - Le token de rafraîchissement
   * @param session - La session à partir de laquelle générer l'événement
   * @param action - L'action à effectuer (add, update, delete)
   * @returns Le résultat de l'action
   */
  const handleEvent = useCallback(async (
    refreshToken: string,
    session: ISessionWithDetails,
    action: 'add' | 'update' | 'delete'
  ): Promise<ICallback> => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'add': {
          const event = generateEvent(session);
          return await addEvent(refreshToken, event, session._id);
        }
        case 'update': {
          const event = generateEvent(session);
          return await updateEvent(refreshToken, event, session._id);
        }
        case 'delete': {
          return await deleteEvent(refreshToken, session._id);
        }
        default:
          throw new Error("Action non reconnue");
      }
    } finally {
      setIsLoading(false);
    }
  }, [addEvent, updateEvent, deleteEvent]);

  return {
    // États de chargement
    isLoading,
    isAdding,
    isUpdating,
    isDeleting,
    isChecking,
    isSyncing,

    // Fonctions principales
    addEvent,
    updateEvent,
    deleteEvent,
    checkEventExists,
    syncCalendar,
    generateEventFromSession,

    // Fonction utilitaire
    handleEvent,
  };
}; 