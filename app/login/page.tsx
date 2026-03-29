"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/auth-store";
import { fallbackUserFromAuth, mapApiUserToDomain } from "@/lib/auth-session";

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(8),
});

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <section className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-4 text-xl font-semibold">Login</h1>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              const tokens = await authService.login(values);
              const profile = await profileService.me(tokens.access_token).catch(() => null);

              setSession({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                user: profile ? mapApiUserToDomain(profile) : fallbackUserFromAuth(values.login),
              });

              const nextPath =
                typeof window !== "undefined"
                  ? new URLSearchParams(window.location.search).get("next") || "/listings"
                  : "/listings";
              toast.success("Welcome back");
              router.replace(nextPath);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Login failed");
            }
          })}
        >
          <Input placeholder="Email or phone" {...form.register("login")} />
          <Input type="password" placeholder="Password" {...form.register("password")} />
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in..." : "Continue"}
          </Button>
        </form>
      </Card>
    </section>
  );
}
