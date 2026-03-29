import { useAuthStore } from "@/store/auth-store";

/**
 * Returns the access token and an `isAdmin` flag.
 *
 * Rules:
 * - `isAdmin` is only true after Zustand rehydrates AND the stored user has role === "admin"
 * - `token` is undefined (not null) so it can be safely spread into API calls
 * - Never include `token` in React Query queryKeys — doing so causes a new cache entry
 *   each time the token changes, which can fire the queryFn before `enabled` re-evaluates,
 *   producing spurious 401s. Use `enabled: isAdmin` as the sole gate.
 */
export function useAdminAuth() {
  const token = useAuthStore((s) => s.accessToken) ?? undefined;
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = hydrated && user?.role === "admin";
  // adminToken is undefined unless the user is actually admin — passed to queryFns
  // so the API call itself will also fail gracefully even if enabled slips through
  const adminToken = isAdmin ? token : undefined;
  return { token: adminToken, isAdmin, user, hydrated };
}
