import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DealRating } from "@/types/domain";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyQAR(value: number) {
  return new Intl.NumberFormat("en-QA", {
    style: "currency",
    currency: "QAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function dealPercentageFromRating(rating?: DealRating) {
  switch (rating) {
    case "great_deal":
      return 22;
    case "good_deal":
      return 12;
    case "fair_price":
      return 4;
    case "expensive":
      return -8;
    default:
      return 0;
  }
}
