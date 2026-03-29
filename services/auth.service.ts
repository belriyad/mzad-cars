import { apiRequest } from "@/lib/http";
import type { AuthTokens } from "@/types/api";

export const authService = {
  guestLogin: () =>
    apiRequest<AuthTokens>("/auth/guest/login", { method: "POST" }),

  login: (body: { login: string; password: string }) =>
    apiRequest<AuthTokens>("/auth/login", { method: "POST", body }),

  register: (body: { email: string; password: string; full_name: string }) =>
    apiRequest<AuthTokens>("/auth/register", { method: "POST", body }),

  refresh: (refresh_token: string) =>
    apiRequest<AuthTokens>("/auth/refresh", {
      method: "POST",
      body: { refresh_token },
    }),

  /** Change password for the currently authenticated user */
  changePassword: (body: { old_password: string; new_password: string }, token?: string) =>
    apiRequest<AuthTokens>("/auth/change-password", { method: "POST", body, token }),

  /** Request a password reset token (dev: returned in response body) */
  requestReset: (login: string) =>
    apiRequest("/auth/request-reset", {
      method: "POST",
      body: { login },
    }),

  /** Complete password reset with the token received from requestReset */
  resetPassword: (body: { reset_token: string; new_password: string }) =>
    apiRequest<AuthTokens>("/auth/reset-password", { method: "POST", body }),

  /** Bootstrap first admin account (only works when no admin exists) */
  adminBootstrap: (body: { email: string; password: string; full_name: string }) =>
    apiRequest<AuthTokens>("/auth/admin-bootstrap", { method: "POST", body }),

  logout: (token?: string) =>
    apiRequest("/auth/logout", { method: "POST", token }),
};
