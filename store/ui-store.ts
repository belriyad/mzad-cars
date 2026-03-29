"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/types/domain";

interface UIState {
  locale: Locale;
  feedView: "comfortable" | "compact";
  filterDrawerOpen: boolean;
  languageModalOpen: boolean;
  setLocale: (locale: Locale) => void;
  setFeedView: (view: "comfortable" | "compact") => void;
  setFilterDrawerOpen: (open: boolean) => void;
  setLanguageModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      locale: "en",
      feedView: "comfortable",
      filterDrawerOpen: false,
      languageModalOpen: false,
      setLocale: (locale) => set({ locale }),
      setFeedView: (feedView) => set({ feedView }),
      setFilterDrawerOpen: (filterDrawerOpen) => set({ filterDrawerOpen }),
      setLanguageModalOpen: (languageModalOpen) => set({ languageModalOpen }),
    }),
    {
      name: "mzad-ui-state",
      partialize: (state) => ({
        locale: state.locale,
        feedView: state.feedView,
      }),
    },
  ),
);
