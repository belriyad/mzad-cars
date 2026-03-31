"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mzad_compare_ids";
const MAX_COMPARE = 3;

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("mzad_compare_change"));
}

/** Call this hook anywhere to read/mutate the compare list */
export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  const refresh = useCallback(() => setIds(readIds()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("mzad_compare_change", refresh);
    return () => window.removeEventListener("mzad_compare_change", refresh);
  }, [refresh]);

  const toggle = (id: string) => {
    const current = readIds();
    if (current.includes(id)) {
      writeIds(current.filter((x) => x !== id));
    } else if (current.length < MAX_COMPARE) {
      writeIds([...current, id]);
    }
  };

  const clear = () => writeIds([]);

  return { ids, toggle, clear, isSelected: (id: string) => ids.includes(id), isFull: ids.length >= MAX_COMPARE };
}

/** Checkbox to add/remove a listing from the compare tray */
export function CompareCheckbox({ productId }: { productId: string }) {
  const { isSelected, toggle, isFull } = useCompare();
  const selected = isSelected(productId);

  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-500 select-none">
      <input
        type="checkbox"
        checked={selected}
        disabled={!selected && isFull}
        onChange={() => toggle(productId)}
        className="h-3.5 w-3.5 rounded accent-blue-600"
      />
      Compare
    </label>
  );
}

/** Sticky bar that appears when ≥2 listings are selected */
export function CompareBar() {
  const router = useRouter();
  const { ids, clear } = useCompare();

  if (ids.length < 2) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 shadow-xl md:bottom-6">
      <SlidersHorizontal className="h-4 w-4 text-blue-600 shrink-0" />
      <span className="text-sm font-medium">Compare {ids.length} cars</span>
      <Button
        size="sm"
        onClick={() => router.push(`/compare?ids=${ids.join(",")}`)}
      >
        Compare →
      </Button>
      <button onClick={clear} className="text-neutral-400 hover:text-neutral-700 ml-1">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
