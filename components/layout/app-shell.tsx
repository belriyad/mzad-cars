"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageModal } from "@/components/common/language-modal";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold tracking-[0.16em] text-neutral-900 uppercase">
            {APP_NAME}
          </Link>
          <nav className="hidden items-center gap-2 text-sm text-neutral-600 md:flex">
            <Link className="rounded-full px-3 py-1.5 transition hover:bg-neutral-100" href="/listings">Browse</Link>
            <Link className="rounded-full px-3 py-1.5 transition hover:bg-neutral-100" href="/pricing">Pricing</Link>
            <Link className="rounded-full px-3 py-1.5 transition hover:bg-neutral-100" href="/sell">Sell</Link>
            <Link className="rounded-full px-3 py-1.5 transition hover:bg-neutral-100" href="/dealer">Dealer</Link>
            <Link className="rounded-full px-3 py-1.5 transition hover:bg-neutral-100" href="/admin">Admin</Link>
            {token ? (
              <>
                <Link className="rounded-full px-3 py-1.5 transition hover:bg-neutral-100" href="/profile">{user?.full_name ?? "Profile"}</Link>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await authService.logout(useAuthStore.getState().accessToken ?? undefined);
                    } catch {
                      // ignore logout API errors and clear local session anyway
                    } finally {
                      logout();
                      toast.success("Signed out");
                    }
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 md:pb-8">{children}</main>
      <MobileNav />
      <LanguageModal />
    </>
  );
}
