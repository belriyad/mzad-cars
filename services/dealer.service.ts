/**
 * Backend assumption: dealer/team/csv-specific endpoints are not currently in provided swagger.
 * This service is a typed frontend contract placeholder for future API integration.
 */
import { listingsService } from "@/services/listings.service";

export const dealerService = {
  listTeam: async () => Promise.resolve([]),
  inventory: async () => {
    const response = await listingsService.list({ limit: 50 });
    return response.rows;
  },
  inviteStaff: async () => Promise.resolve({ success: true }),
  importCsv: async () => Promise.resolve({ queued: true }),
  analytics: async () => {
    const inventory = await listingsService.list({ limit: 50 }).catch(() => ({ rows: [] }));
    return {
      views: 0,
      leads: 0,
      inventoryCount: inventory.rows.length,
    };
  },
};
