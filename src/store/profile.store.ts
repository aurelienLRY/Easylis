/* Libs */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produce } from "immer";

/* Data */
import { isCacheDuration } from "@/store";

/* Types */
import { IUser } from "@/types";

/* actions */
import { GET_USER_SESSION } from "@/libs/ServerAction";

/* user store types */
type TuseProfile = {
  profile: IUser | null;
  lastFetch: number;
  fetchProfile: () => Promise<void>;
  updateProfile: (updatedProfile: IUser) => void;
};

/* user store */
export const useProfile = create<TuseProfile>()(
  devtools(
    (set, get) => ({
      profile: null,
      lastFetch: 0,
      updateProfile: (updatedProfile: IUser) => {
        set(
          produce((state: { profile: IUser | null }) => {
            state.profile = updatedProfile;
          }),
          false,
          "updateProfile"
        );
      },
      fetchProfile: async () => {
        const currentTime = Date.now();
        const cacheDuration = isCacheDuration;
        const lastFetch = get().lastFetch;
        if (currentTime - lastFetch > cacheDuration || get().profile === null) {
          const response = await GET_USER_SESSION();
          if (response.success && response.data) {
            set(
              { profile: response.data, lastFetch: currentTime },
              false,
              "fetchProfile"
            );
          }
        }
      },
    }),
    { name: "ProfileStore" }
  )
);
