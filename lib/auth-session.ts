import type { User, UserRole, UserTier } from "@/types/domain";

type UnknownUser = Record<string, unknown>;

function normalizeRole(raw: unknown): UserRole {
  if (raw === "admin") return "admin";
  if (raw === "dealer") return "dealer";
  if (raw === "user") return "user";
  return "user";
}

function normalizeTier(raw: unknown): UserTier {
  if (raw === "dealer") return "dealer";
  if (raw === "paid_private") return "paid_private";
  if (raw === "registered_free") return "registered_free";
  if (raw === "guest") return "guest";
  return "registered_free";
}

export function mapApiUserToDomain(input: unknown): User {
  const user = (input ?? {}) as UnknownUser;
  const role = normalizeRole(user.role);

  return {
    id: String(user.id ?? user.user_id ?? ""),
    role,
    tier: normalizeTier(user.tier),
    email: typeof user.email === "string" ? user.email : undefined,
    phone: typeof user.phone === "string" ? user.phone : undefined,
    full_name: typeof user.full_name === "string" ? user.full_name : undefined,
    is_active: typeof user.is_active === "boolean" ? user.is_active : true,
  };
}

export function fallbackUserFromAuth(loginOrEmail: string): User {
  return {
    id: loginOrEmail,
    role: "user",
    tier: "registered_free",
    email: loginOrEmail.includes("@") ? loginOrEmail : undefined,
  };
}
