import { apiRequest } from "@/lib/http";
import type {
  ValueEstimateResponse,
  DealsRecomputeResponse,
  MLEstimateParams,
  MLEstimateResponse,
} from "@/types/api";
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

  /** GET /ml/estimate — ML-powered price estimate (model v5, segmented GradientBoosting) */
  mlEstimate: (query: MLEstimateParams) => {
    const params = new URLSearchParams();
    params.set("make", query.make);
    params.set("class_name", query.class_name);
    params.set("manufacture_year", String(query.manufacture_year));
    params.set("km", String(query.km));
    if (query.model)           params.set("model", query.model);
    if (query.trim)            params.set("trim", query.trim);
    if (query.fuel_type)       params.set("fuel_type", query.fuel_type);
    if (query.gear_type)       params.set("gear_type", query.gear_type);
    if (query.car_type)        params.set("car_type", query.car_type);
    if (query.cylinder_count)  params.set("cylinder_count", String(query.cylinder_count));
    if (query.city)            params.set("city", query.city);
    if (query.warranty_status) params.set("warranty_status", query.warranty_status);
    if (query.seller_type)     params.set("seller_type", query.seller_type);
    return apiRequest<MLEstimateResponse>(`/ml/estimate?${params.toString()}`);
  },
};
