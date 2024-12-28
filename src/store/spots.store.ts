/* Libs */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produce } from "immer";

/* Data */
import { isCacheDuration } from "@/store";

/* Types */
import { ISpot } from "@/types";

/* actions */
import { GET_SPOTS } from "@/libs/ServerAction";

/**
 * Spots Type
 */
type TuseSpots = {
  Spots: ISpot[];
  lastFetch: number;
  setSpots: (Spots: ISpot[]) => void;
  updateSpots: (updatedSpot: ISpot) => void;
  deleteSpots: (deletedSpot: ISpot) => void;
  addSpots: (newSpot: ISpot) => void;
  updateLastFetch: () => void;
  fetchSpots: () => Promise<void>;
};

/**
 * Spots Store
 */
export const useSpots = create<TuseSpots>()(
  devtools(
    (set, get) => ({
      Spots: [] as ISpot[],
      lastFetch: 0,
      setSpots: (Spots: ISpot[]) => set({ Spots }),
      updateSpots: (updatedSpot: ISpot) =>
        set(
          produce((state: { Spots: ISpot[] }) => {
            const index = state.Spots.findIndex(
              (s) => s._id === updatedSpot._id
            );
            if (index !== -1) {
              state.Spots[index] = updatedSpot;
            } else {
              state.Spots.push(updatedSpot);
            }
          })
        ),
      deleteSpots: (deletedSpot: ISpot) =>
        set(
          produce((state: { Spots: ISpot[] }) => {
            state.Spots = state.Spots.filter((s) => s._id !== deletedSpot._id);
          })
        ),
      addSpots: (newSpot: ISpot) =>
        set(
          produce((state: { Spots: ISpot[] }) => {
            state.Spots.push(newSpot);
          })
        ),
      updateLastFetch: () => set({ lastFetch: Date.now() }),
      fetchSpots: async () => {
        const currentTime = Date.now();
        const cacheDuration = isCacheDuration;
        const lastFetch = get().lastFetch;
        if (
          currentTime - lastFetch > cacheDuration ||
          get().Spots.length === 0
        ) {
          const response = await GET_SPOTS();
          if (response.success && response.data) {
            set({ Spots: response.data });
            set({ lastFetch: currentTime });
          }
        }
      },
    }),
    { name: "SpotsStore" }
  )
);
