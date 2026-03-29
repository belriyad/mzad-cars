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
import { mapApiUserToDomain } from "@/lib/auth-session";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <section className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-4 text-xl font-semibold">Create account</h1>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
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

              toast.success("Account created");
              router.replace("/listings");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Registration failed");
            }
          })}
        >
          <Input placeholder="Full name" {...form.register("full_name")} />
          <Input type="email" placeholder="Email" {...form.register("email")} />
          <Input type="password" placeholder="Password" {...form.register("password")} />
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating account..." : "Create free account"}
          </Button>
        </form>
      </Card>
    </section>
  );
}
