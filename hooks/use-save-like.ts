"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useLikesStore } from "@/store/likes-store";
import { favoritesService } from "@/services/favorites.service";
import type { FavoriteItem } from "@/types/api";

/**
 * Unified hook for saving (server-side favorites) and liking (local store).
 * Works for both authenticated and guest users.
 */
export function useSaveLike(productId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  // ── likes (local, persisted in localStorage) ──────────────────────────
  const isLiked = useLikesStore((s) => s.isLiked(productId));
  const toggleLike = useLikesStore((s) => s.toggle);

  const handleLike = useCallback(() => {
    toggleLike(productId);
  }, [productId, toggleLike]);

  // ── saves (server-side favorites, requires auth) ───────────────────────
  const userKey = user?.id?.toString() ?? null;

  const favQuery = useQuery({
    queryKey: ["favorites", userKey],
    queryFn: () => favoritesService.list(userKey ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });

  const favoriteRow: FavoriteItem | undefined = favQuery.data?.rows.find(
    (f) => f.product_id === productId
  );
  const isSaved = !!favoriteRow;

  const addMutation = useMutation({
    mutationFn: () =>
      favoritesService.add(productId, userKey ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Saved to your collection");
    },
    onError: () => toast.error("Could not save — try again"),
  });

  const removeMutation = useMutation({
    mutationFn: () => favoritesService.remove(favoriteRow!.id, userKey ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Removed from saved cars");
    },
    onError: () => toast.error("Could not remove — try again"),
  });

  const handleSave = useCallback(() => {
    if (!token) {
      toast.error("Sign in to save cars", {
        action: { label: "Sign in", onClick: () => (window.location.href = "/login") },
      });
      return;
    }
    if (isSaved) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  }, [token, isSaved, addMutation, removeMutation]);

  return {
    isLiked,
    isSaved,
    handleLike,
    handleSave,
    savePending: addMutation.isPending || removeMutation.isPending,
  };
}
