import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { IUser } from "../types";

export interface IAuthStore {
  user: IUser | null;
  token: string | null;
  logout: () => void;
  isAuthenticated: boolean;
  setAuth: (user: IUser, token: string) => void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () =>
        set(() => ({ user: null, token: null, isAuthenticated: false })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);