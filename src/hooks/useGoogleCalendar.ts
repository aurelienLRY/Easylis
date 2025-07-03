"use client";

import { useState, useCallback } from "react";
import {
  fetcherAddEvent,
  fetcherUpdateEvent,
  fetcherDeleteEvent,
  fetcherCheckEventExists,
  fetcherCheckToken,
  fetcherRefreshToken,
  fetcherSyncCalendar,
  generateEvent,
} from "@/services/GoogleCalendar/ClientSide";
import { ICalendarEvent, ISessionWithDetails, ICallback, IUser } from "@/types";

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
  checkToken: (token: string) => Promise<ICallback & { data: { valid: boolean; tokenInfo: any } }>;
  refreshToken: (profile: IUser) => Promise<ICallback & { data: { credentials: any; profile: IUser | null } }>;
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

  // Fonction pour ajouter un événement
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

  // Fonction pour mettre à jour un événement
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

  // Fonction pour supprimer un événement
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

  // Fonction pour vérifier si un événement existe
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

  // Fonction pour vérifier un token
  const checkToken = useCallback(async (
    token: string
  ): Promise<ICallback & { data: { valid: boolean; tokenInfo: any } }> => {
    setIsLoading(true);
    try {
      const result = await fetcherCheckToken(token);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour rafraîchir un token
  const refreshToken = useCallback(async (
    profile: IUser
  ): Promise<ICallback & { data: { credentials: any; profile: IUser | null } }> => {
    setIsLoading(true);
    try {
      const result = await fetcherRefreshToken(profile);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour synchroniser le calendrier
  const syncCalendar = useCallback(async (): Promise<ICallback> => {
    setIsSyncing(true);
    try {
      const result = await fetcherSyncCalendar();
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Fonction pour générer un événement à partir d'une session
  const generateEventFromSession = useCallback((session: ISessionWithDetails): ICalendarEvent => {
    return generateEvent(session);
  }, []);

  // Fonction utilitaire pour gérer un événement complet
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
    checkToken,
    refreshToken,
    syncCalendar,
    generateEventFromSession,

    // Fonction utilitaire
    handleEvent,
  };
}; 