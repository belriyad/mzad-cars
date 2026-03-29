"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/auth-store";
import { mapApiUserToDomain } from "@/lib/auth-session";
import { ApiError } from "@/lib/http";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <section className="mx-auto max-w-md space-y-3 pt-4">
      <Card className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Free to join — get deal alerts and save your favourite cars.
          </p>
        </div>

        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            setAuthError(null);
            try {
              const tokens = await authService.register(values);
              const profile = await profileService.me(tokens.access_token).catch(() => ({
                id: values.email,
                role: "user",
                tier: "registered_free",
                email: values.email,
                full_name: values.full_name,
              }));

              setSession({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                user: mapApiUserToDomain(profile),
              });

              toast.success("Account created — welcome!");
              router.replace("/listings");
            } catch (error) {
              if (error instanceof ApiError && error.status === 409) {
                setAuthError("An account with this email already exists. Try signing in.");
              } else {
                setAuthError(
                  error instanceof Error ? error.message : "Registration failed. Please try again."
                );
              }
            }
          })}
        >
          <div className="space-y-1">
            <Input
              placeholder="Full name"
              autoComplete="name"
              {...form.register("full_name")}
            />
            {form.formState.errors.full_name && (
              <p className="text-xs text-red-500">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              type="password"
              placeholder="Password (min 8 characters)"
              autoComplete="new-password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          {authError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {authError}
            </div>
          )}

          <Button className="w-full gap-2" disabled={form.formState.isSubmitting}>
            <UserPlus className="h-4 w-4" />
            {form.formState.isSubmitting ? "Creating account…" : "Create free account"}
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-neutral-900 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </section>
  );
}
