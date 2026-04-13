import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { IUser } from "../types";

// Zustand-compatible storage adapter using expo-secure-store
const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) =>
    SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

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
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);