"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

/* services */
import {
  fetcherCheckToken,
  fetcherRefreshToken,
} from "@/services/GoogleCalendar/ClientSide";

/* store */
import { useProfile } from "@/store";
/* types */
import { IUser } from "@/types";

interface CalendarState {
  isInitialized: boolean;
  tokenIsValid: boolean;
  expiryDate: number;
  lastCheck: number;
  isLoading: boolean;
}

interface CalendarActions {
  initialize: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkToken: () => Promise<boolean>;
  checkTokenValidity: () => Promise<void>;
}

type CalendarStore = CalendarState & CalendarActions;

/**
 * Store pour la gestion du calendrier Google
 * Gère l'état de la connexion et le rafraîchissement des tokens
 */
export const useCalendar = create<CalendarStore>()(
  devtools(
    (set, get) => ({
      // État initial
      isInitialized: false,
      tokenIsValid: false,
      expiryDate: 0,
      lastCheck: 0,
      isLoading: false,

      /**
       * Initialise le store et vérifie la validité du token
       */
      initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true }, false, "initialize");
        await get().checkTokenValidity();
        set(
          {
            isInitialized: true,
            isLoading: false,
          },
          false,
          "initialize"
        );
      },

      /**
       * Rafraîchit le token d'accès
       * @returns Résultat de l'opération de rafraîchissement
       */
      refreshToken: async () => {
        const { profile } = await useProfile.getState();
        const updateProfile = useProfile.getState().updateProfile;
        if (!profile?.tokenRefreshCalendar) {
          set({ tokenIsValid: false }, false, "refreshToken");
          return false;
        }

        try {
          set({ isLoading: true }, false, "refreshToken");
          const response = await fetcherRefreshToken(profile);

          if (response.success && response.data) {
            updateProfile(response.data.profile as IUser);
            set(
              {
                tokenIsValid: true,
                expiryDate: response.data.credentials?.expiry_date as number, // 1 heure
              },
              false,
              "refreshToken"
            );
            return true;
          } else {
            set({ tokenIsValid: false }, false, "refreshToken");
            return false;
          }
        } catch (error) {
          console.error("Erreur lors du rafraîchissement du token:", error);
          set({ tokenIsValid: false }, false, "refreshToken");
          return false;
        } finally {
          set({ isLoading: false }, false, "refreshToken");
        }
      },

      /**
       * Vérifie la validité du token
       * @returns true si le token est valide, false sinon
       */
      checkToken: async () => {
        const { profile } = await useProfile.getState();
        if (!profile?.tokenCalendar) return false;
        try {
          const response = await fetcherCheckToken(profile.tokenCalendar);
          if (response.success && response.data) {
            if (response.data.tokenInfo) {
              set(
                {
                  expiryDate: response.data.tokenInfo.expiry_date,
                },
                false,
                "checkToken"
              );
            }
            return response.data.valid;
          }
          return false;
        } catch (error) {
          console.error("Erreur lors de la vérification du token:", error);
          return false;
        }
      },

      /**
       * Vérifie la validité du token et le rafraîchit si nécessaire
       */
      checkTokenValidity: async () => {
        set({ isLoading: true }, false, "checkTokenValidity");
        const currentTime = Date.now();
        const timeToExpiry = get().expiryDate - currentTime;
        const timeSinceLastCheck = currentTime - get().lastCheck;

        // Évite les vérifications trop fréquentes (minimum 5 minutes entre chaque vérification)
        if (get().tokenIsValid && timeSinceLastCheck < 5 * 60 * 1000) {
          set({ isLoading: false }, false, "checkTokenValidity");
          return;
        }

        set({ tokenIsValid: await get().checkToken() });
        set({ lastCheck: currentTime });

        // Si le token expire dans moins de 5 minutes ou n'est pas valide
        if (get().tokenIsValid || timeToExpiry < 7 * 60 * 1000) {
          await get().refreshToken();
        }
        set({ isLoading: false }, false, "checkTokenValidity");
      },
    }),
    { name: "CalendarStore" }
  )
);
