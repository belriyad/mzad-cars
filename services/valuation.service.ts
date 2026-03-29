/**
 * @deprecated Use insightsService.valueEstimate() instead.
 * Kept for backward compatibility with existing UI components.
 */
import { insightsService } from "@/services/insights.service";

export const valuationService = {
  estimate: insightsService.valueEstimate,
};
