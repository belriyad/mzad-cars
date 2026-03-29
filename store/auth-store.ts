"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserTier } from "@/types/domain";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) => void;
  logout: () => void;
  tier: () => UserTier;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      tier: () => get().user?.tier ?? "guest",
    }),
    {
      name: "mzad-auth-session",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

