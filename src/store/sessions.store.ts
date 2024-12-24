/* Libs */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produce } from "immer";

/* Types */
import { ISession } from "@/types";

/* Services */
import { GET_SESSIONS } from "@/libs/ServerAction";

/* Data */
import { isCacheDuration } from "@/store";

/**
 * Sessions Type
 */
type TuseSessions = {
  sessions: ISession[];
  lastFetch: number;
  setSessions: (sessions: ISession[]) => void;
  updateSessions: (updatedSession: ISession) => void;
  deleteSessions: (deletedSession: ISession) => void;
  addSessions: (newSession: ISession) => void;
  updateLastFetch: () => void;
  fetchSessions: () => Promise<void>;
};

/**
 * Sessions Store
 */
export const useSessions = create<TuseSessions>()(
  devtools(
    (set, get) => ({
      sessions: [] as ISession[],
      lastFetch: 0,
      setSessions: (sessions: ISession[]) =>
        set({ sessions }, false, "setSessions"),
      // Update Session
      updateSessions: (updatedSession: ISession) =>
        set(
          produce((state: { sessions: ISession[] }) => {
            const index = state.sessions.findIndex(
              (s) => s._id === updatedSession._id
            );
            if (index !== -1) {
              state.sessions[index] = updatedSession;
            } else {
              state.sessions.push(updatedSession);
            }
          }),
          false,
          "update session"
        ),
      deleteSessions: (deletedSession: ISession) =>
        set(
          produce((state: { sessions: ISession[] }) => {
            state.sessions = state.sessions.filter(
              (s: ISession) => s._id !== deletedSession._id
            );
          }),
          false,
          "delete session"
        ),
      addSessions: (newSession: ISession) =>
        set(
          produce((state: { sessions: ISession[] }) => {
            state.sessions.push(newSession);
          })
        ),
      updateLastFetch: () =>
        set({ lastFetch: Date.now() }, false, "updateLastFetch"),
      fetchSessions: async () => {
        const currentTime = Date.now();
        const cacheDuration = isCacheDuration;
        const lastFetch = get().lastFetch;
        if (
          currentTime - lastFetch > cacheDuration ||
          get().sessions.length === 0
        ) {
          const response = await GET_SESSIONS();
          if (response.success && response.data) {
            set(
              { sessions: response.data, lastFetch: currentTime },
              false,
              "fetchSessions"
            );
          }
        }
      },
    }),
    { name: "SessionsStore" }
  )
);
