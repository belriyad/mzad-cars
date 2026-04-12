"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LikesState {
  likedIds: string[]; // product_id list
  like: (productId: string) => void;
  unlike: (productId: string) => void;
  toggle: (productId: string) => void;
  isLiked: (productId: string) => boolean;
  clear: () => void;
}

export const useLikesStore = create<LikesState>()(
  persist(
    (set, get) => ({
      likedIds: [],
      like: (productId) =>
        set((s) =>
          s.likedIds.includes(productId)
            ? s
            : { likedIds: [...s.likedIds, productId] }
        ),
      unlike: (productId) =>
        set((s) => ({ likedIds: s.likedIds.filter((id) => id !== productId) })),
      toggle: (productId) => {
        const { likedIds } = get();
        if (likedIds.includes(productId)) {
          set({ likedIds: likedIds.filter((id) => id !== productId) });
        } else {
          set({ likedIds: [...likedIds, productId] });
        }
      },
      isLiked: (productId) => get().likedIds.includes(productId),
      clear: () => set({ likedIds: [] }),
    }),
    {
      name: "mzad-liked-cars",
    }
  )
);
