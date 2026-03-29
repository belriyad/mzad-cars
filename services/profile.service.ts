import { apiRequest } from "@/lib/http";
import type { User, Profile, ProfileUpdate } from "@/types/domain";

export const profileService = {
  /** GET /me — returns the current authenticated user */
  me: (token?: string) => apiRequest<User>("/me", { token }),

  /** GET /me/profile */
  getProfile: (token?: string) => apiRequest<Profile>("/me/profile", { token }),

  /** PUT /me/profile — full replace */
  setProfile: (body: ProfileUpdate, token?: string) =>
    apiRequest<Profile>("/me/profile", { method: "PUT", body, token }),

  /** PATCH /me/profile — partial update */
  updateProfile: (body: ProfileUpdate, token?: string) =>
    apiRequest<Profile>("/me/profile", { method: "PATCH", body, token }),
};
