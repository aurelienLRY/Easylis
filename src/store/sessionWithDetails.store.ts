/* Libs */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produce } from "immer";

/* Data */
import { isCacheDuration } from "@/store";

/* Types */
import { ISessionWithDetails } from "@/types";

/* actions */
import { GET_SESSIONS_WITH_DETAILS } from "@/libs/ServerAction";

/**
 * SessionWithDetails Type
 */
type TuseSessionWithDetails = {
  SessionWithDetails: ISessionWithDetails[];
  lastFetch: number;
  setSessionWithDetails: (SessionWithDetails: ISessionWithDetails[]) => void;
  updateSessionWithDetails: (
    updatedSessionWithDetails: ISessionWithDetails
  ) => void;
  deleteSessionWithDetails: (
    deletedSessionWithDetails: ISessionWithDetails
  ) => void;
  addSessionWithDetails: (newSessionWithDetails: ISessionWithDetails) => void;
  updateLastFetch: () => void;
  fetchSessionWithDetails: () => Promise<void>;
};

/**
 * Session With Details Store
 * @returns TuseSessionWithDetails
 */
export const useSessionWithDetails = create<TuseSessionWithDetails>()(
  devtools(
    (set, get) => ({
      SessionWithDetails: [] as ISessionWithDetails[],
      lastFetch: 0,
      setSessionWithDetails: (SessionWithDetails: ISessionWithDetails[]) =>
        set({ SessionWithDetails }),
      updateSessionWithDetails: (
        updatedSessionWithDetails: ISessionWithDetails
      ) =>
        set(
          produce((state: { SessionWithDetails: ISessionWithDetails[] }) => {
            const index = state.SessionWithDetails.findIndex(
              (s) => s._id === updatedSessionWithDetails._id
            );
            if (index !== -1) {
              state.SessionWithDetails[index] = updatedSessionWithDetails;
            } else {
              state.SessionWithDetails.push(updatedSessionWithDetails);
            }
          }),
          false,
          "Update sessionWithDetails"
        ),
      deleteSessionWithDetails: (
        deletedSessionWithDetails: ISessionWithDetails
      ) =>
        set(
          produce((state: { SessionWithDetails: ISessionWithDetails[] }) => {
            state.SessionWithDetails = state.SessionWithDetails.filter(
              (s: ISessionWithDetails) =>
                s._id !== deletedSessionWithDetails._id
            );
          }),
          false,
          "Delete sessionWithDetails"
        ),
      addSessionWithDetails: (newSessionWithDetails: ISessionWithDetails) =>
        set(
          produce((state: { SessionWithDetails: ISessionWithDetails[] }) => {
            state.SessionWithDetails.push(newSessionWithDetails);
          }),
          false,
          "Add sessionWithDetails"
        ),
      updateLastFetch: () =>
        set({ lastFetch: Date.now() }, false, "updateLastFetch"),
      fetchSessionWithDetails: async () => {
        const currentTime = Date.now();
        const cacheDuration = isCacheDuration;
        const lastFetch = get().lastFetch;
        if (
          currentTime - lastFetch > cacheDuration ||
          get().SessionWithDetails.length === 0
        ) {
          const response = await GET_SESSIONS_WITH_DETAILS();
          if (response.success && response.data) {
            set(
              { SessionWithDetails: response.data, lastFetch: currentTime },
              false,
              "fetchSessionWithDetails"
            );
          }
        }
      },
    }),
    { name: "SessionWithDetailsStore" }
  )
);
