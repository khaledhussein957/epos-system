import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { IUser } from "../types";

const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) =>
    SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export interface IAuthStore {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: IUser, token: string, refreshToken: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      logout: () =>
        set(() => ({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
