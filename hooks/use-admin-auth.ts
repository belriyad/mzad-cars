import { useAuthStore } from "@/store/auth-store";

/**
 * Returns the access token and an `isAdmin` flag.
 * Queries that require admin-role JWTs should be gated on `isAdmin`
 * (not just on the presence of a token) to avoid spurious 401s when a
 * non-admin user visits /admin pages.
 */
export function useAdminAuth() {
  const token = useAuthStore((s) => s.accessToken) ?? undefined;
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = hydrated && user?.role === "admin";
  return { token, isAdmin, user, hydrated };
}
