"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageModal } from "@/components/common/language-modal";
import { AccountMenu } from "@/components/layout/account-menu";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",              label: "Home"        },
  { href: "/listings",      label: "Browse"      },
  { href: "/sell",          label: "Sell"        },
  { href: "/dealer-signup", label: "For Dealers" },
  { href: "/pricing",       label: "Pricing"     },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "guest";

  // Hide public nav links that are role-redundant when logged in as dealer/admin
  const visibleLinks = NAV_LINKS.filter(({ href }) => {
    if (href === "/dealer-signup" && (role === "dealer" || role === "admin")) return false;
    if (href === "/sell" && role === "admin") return false;
    return true;
  });

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold tracking-[0.16em] text-neutral-900 uppercase">
            {APP_NAME}
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-neutral-600 md:flex">
            {visibleLinks.map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition",
                    active
                      ? "bg-neutral-900 text-white"
                      : "hover:bg-neutral-100 text-neutral-600"
                  )}
                >
                  {label}
                </Link>
              );
            })}
            <AccountMenu />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 md:pb-8">{children}</main>
      <MobileNav />
      <LanguageModal />
    </>
  );
}
