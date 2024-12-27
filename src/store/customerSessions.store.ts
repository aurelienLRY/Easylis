/* Libs */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produce } from "immer";

/* Data */
import { isCacheDuration } from "@/store";

/* Types */
import { ICustomerSession } from "@/types";

/* actions */
import { GET_CUSTOMER_SESSIONS } from "@/libs/ServerAction";

/**
 * CustomerSessions Type
 */
type TuseCustomerSessions = {
  CustomerSessions: ICustomerSession[];
  lastFetch: number;
  setCustomerSessions: (CustomerSessions: ICustomerSession[]) => void;
  updateCustomerSessions: (updatedCustomerSession: ICustomerSession) => void;
  deleteCustomerSessions: (deletedCustomerSession: ICustomerSession) => void;
  addCustomerSessions: (newCustomerSession: ICustomerSession) => void;
  updateLastFetch: () => void;
  fetchCustomerSessions: () => Promise<void>;
};

/**
 * CustomerSessions Store
 */
export const useCustomerSessions = create<TuseCustomerSessions>()(
  devtools(
    (set, get) => ({
      CustomerSessions: [] as ICustomerSession[],
      lastFetch: 0,
      setCustomerSessions: (CustomerSessions: ICustomerSession[]) =>
        set({ CustomerSessions }, false, "setCustomerSessions"),
      updateCustomerSessions: (updatedCustomerSession: ICustomerSession) =>
        set(
          produce((state: { CustomerSessions: ICustomerSession[] }) => {
            const index = state.CustomerSessions.findIndex(
              (s) => s._id === updatedCustomerSession._id
            );
            if (index !== -1) {
              state.CustomerSessions[index] = updatedCustomerSession;
            } else {
              state.CustomerSessions.push(updatedCustomerSession);
            }
          }),
          false,
          "updateCustomerSessions"
        ),
      deleteCustomerSessions: (deletedCustomerSession: ICustomerSession) =>
        set(
          produce((state: { CustomerSessions: ICustomerSession[] }) => {
            state.CustomerSessions = state.CustomerSessions.filter(
              (s: ICustomerSession) => s._id !== deletedCustomerSession._id
            );
          }),
          false,
          "deleteCustomerSessions"
        ),
      addCustomerSessions: (newCustomerSession: ICustomerSession) =>
        set(
          produce((state: { CustomerSessions: ICustomerSession[] }) => {
            state.CustomerSessions.push(newCustomerSession);
          }),
          false,
          "addCustomerSessions"
        ),

      updateLastFetch: () =>
        set({ lastFetch: Date.now() }, false, "updateLastFetch"),
      fetchCustomerSessions: async () => {
        const currentTime = Date.now();
        const cacheDuration = isCacheDuration;
        const lastFetch = get().lastFetch;
        if (
          currentTime - lastFetch > cacheDuration ||
          get().CustomerSessions.length === 0
        ) {
          const response = await GET_CUSTOMER_SESSIONS();
          if (response.success && response.data) {
            const customerSessions = response.data.sort(
              (a: ICustomerSession, b: ICustomerSession) => {
                return a.status === "Validated" ? -1 : 1;
              }
            );
            set(
              { CustomerSessions: customerSessions, lastFetch: currentTime },
              false,
              "fetchCustomerSessions"
            );
          }
        }
      },
    }),
    { name: "CustomerSessionsStore" }
  )
);
