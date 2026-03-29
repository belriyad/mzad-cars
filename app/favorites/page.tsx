"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { favoritesService } from "@/services/favorites.service";
import type { FavoriteItem } from "@/types/api";

export default function FavoritesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesService.list(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => favoritesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const favorites: FavoriteItem[] = data?.rows ?? [];

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Saved cars</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Cars you have hearted — come back and compare at any time.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <Heart className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-700">No saved cars yet</p>
          <p className="max-w-xs text-sm text-neutral-400">
            Tap the heart icon on any listing to save it here for later.
          </p>
          <Link href="/listings">
            <Button className="mt-2">Browse listings</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-neutral-400">{favorites.length} saved</p>
          {favorites.map((fav) => (
            <Card key={fav.id} className="flex items-center gap-4">
              <Heart className="h-5 w-5 shrink-0 fill-rose-400 text-rose-400" />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/listings/${fav.product_id}`}
                  className="font-medium text-neutral-800 hover:underline truncate block"
                >
                  View listing #{fav.product_id}
                </Link>
                {fav.created_at && (
                  <p className="text-xs text-neutral-400">
                    Saved {new Date(fav.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeMutation.mutate(fav.id)}
                disabled={removeMutation.isPending}
                className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
