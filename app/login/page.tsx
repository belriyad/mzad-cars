"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, LogIn, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/auth-store";
import { fallbackUserFromAuth, mapApiUserToDomain } from "@/lib/auth-session";
import { ApiError } from "@/lib/http";

const schema = z.object({
  login: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [authError, setAuthError] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const getNextPath = () =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/listings"
      : "/listings";

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      const tokens = await authService.guestLogin();
      setSession({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        user: fallbackUserFromAuth("guest"),
      });
      toast.success("Browsing as guest");
      router.replace(getNextPath());
    } catch {
      toast.error("Could not start guest session, please try again.");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-3 pt-4">
      <Card className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Welcome back — enter your credentials to continue.
          </p>
        </div>

        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            setAuthError(null);
            try {
              const tokens = await authService.login(values);
              const profile = await profileService.me(tokens.access_token).catch(() => null);

              setSession({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                user: profile ? mapApiUserToDomain(profile) : fallbackUserFromAuth(values.login),
              });

              toast.success("Welcome back");
              router.replace(getNextPath());
            } catch (error) {
              if (error instanceof ApiError && error.status === 401) {
                setAuthError("Incorrect email or password. Please try again.");
              } else {
                setAuthError(
                  error instanceof Error ? error.message : "Login failed. Please try again."
                );
              }
            }
          })}
        >
          <div className="space-y-1">
            <Input
              placeholder="Email or phone"
              autoComplete="username"
              {...form.register("login")}
            />
            {form.formState.errors.login && (
              <p className="text-xs text-red-500">{form.formState.errors.login.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* inline auth error */}
          {authError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {authError}
            </div>
          )}

          <Button className="w-full gap-2" disabled={form.formState.isSubmitting}>
            <LogIn className="h-4 w-4" />
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {/* divider */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-neutral-100" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="h-px flex-1 bg-neutral-100" />
        </div>

        {/* guest login */}
        <Button
          variant="ghost"
          className="w-full gap-2 border border-neutral-200"
          onClick={handleGuestLogin}
          disabled={guestLoading}
          type="button"
        >
          <User className="h-4 w-4" />
          {guestLoading ? "Loading…" : "Continue as guest"}
        </Button>

        <p className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-neutral-900 hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </section>
  );
}
