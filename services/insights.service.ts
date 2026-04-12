import { apiRequest } from "@/lib/http";
import type { ValueEstimateResponse, DealsRecomputeResponse } from "@/types/api";
import type { Listing, SummaryResponse } from "@/types/domain";

export interface SpottedResponse {
  rows: Array<Listing & { score: number; spot_reasons: string }>;
}

export const insightsService = {
  /** GET /summary — dashboard stats (admin) */
  summary: (token?: string) =>
    apiRequest<SummaryResponse>("/summary", { token }),

  /** GET /ranges — filter min/max ranges for UI sliders */
  ranges: () => apiRequest<Record<string, { min: number; max: number }>>("/ranges"),

  /** GET /spotted — top spotted listings with scoring reasons */
  spotted: () => apiRequest<SpottedResponse>("/spotted"),

  /** GET /value-estimate — estimate car value from comparable peers */
  valueEstimate: (query: {
    make: string;
    class_name: string;
    model?: string;
    year: number;
    km: number;
  }) => {
    const params = new URLSearchParams({
      make: query.make,
      class_name: query.class_name,
      year: String(query.year),
      km: String(query.km),
    });
    if (query.model) params.set("model", query.model);
    return apiRequest<ValueEstimateResponse>(`/value-estimate?${params.toString()}`);
  },

  /** POST /deals/recompute — admin: recompute all deal metrics */
  recomputeDeals: (token?: string) =>
    apiRequest<DealsRecomputeResponse>("/deals/recompute", { method: "POST", token }),
};
