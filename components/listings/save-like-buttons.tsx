"use client";

import { Bookmark, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveLike } from "@/hooks/use-save-like";

interface SaveLikeButtonsProps {
  productId: string;
  /** Show text labels next to icons (default: false) */
  showLabels?: boolean;
  /** Extra className for the wrapper */
  className?: string;
}

export function SaveLikeButtons({
  productId,
  showLabels = false,
  className,
}: SaveLikeButtonsProps) {
  const { isLiked, isSaved, handleLike, handleSave, savePending } =
    useSaveLike(productId);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Like */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleLike();
        }}
        aria-label={isLiked ? "Unlike" : "Like"}
        className={cn(
          "flex items-center gap-1 rounded-full p-2 text-sm transition",
          isLiked
            ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
            : "text-neutral-400 hover:bg-neutral-100 hover:text-rose-400"
        )}
      >
        <Heart
          className={cn("h-4 w-4", isLiked && "fill-rose-500")}
        />
        {showLabels && (
          <span className="text-xs font-medium">{isLiked ? "Liked" : "Like"}</span>
        )}
      </button>

      {/* Save */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSave();
        }}
        disabled={savePending}
        aria-label={isSaved ? "Unsave" : "Save"}
        className={cn(
          "flex items-center gap-1 rounded-full p-2 text-sm transition",
          isSaved
            ? "bg-blue-50 text-blue-500 hover:bg-blue-100"
            : "text-neutral-400 hover:bg-neutral-100 hover:text-blue-500",
          savePending && "opacity-50 cursor-not-allowed"
        )}
      >
        <Bookmark
          className={cn("h-4 w-4", isSaved && "fill-blue-500")}
        />
        {showLabels && (
          <span className="text-xs font-medium">{isSaved ? "Saved" : "Save"}</span>
        )}
      </button>
    </div>
  );
}
