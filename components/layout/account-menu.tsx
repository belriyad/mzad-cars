"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ChevronDown,
  LogOut,
  Car,
  Heart,
  Bell,
  BarChart2,
  Package,
  Users,
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

export function AccountMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const role = user?.role ?? "guest";
  const firstName = user?.full_name?.split(" ")[0] ?? "Account";
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  // ── per-role menu items ──────────────────────────────────────────────────
  const commonItems: MenuItem[] = [
    { href: "/profile",       label: "My Profile",     icon: User       },
    { href: "/favorites",     label: "Saved Cars",     icon: Heart      },
    { href: "/notifications", label: "Notifications",  icon: Bell       },
  ];

  const userItems: MenuItem[] = [
    { href: "/my-listings",   label: "My Listings",    icon: Car        },
    { href: "/sell",          label: "Sell a Car",     icon: PlusCircle },
    { href: "/subscription",  label: "Subscription",   icon: CreditCard },
    { href: "/valuation",     label: "Car Valuation",  icon: FileText   },
  ];

  const dealerItems: MenuItem[] = [
    { href: "/dealer",            label: "Dealer Dashboard", icon: LayoutDashboard },
    { href: "/dealer/inventory",  label: "Inventory",        icon: Package         },
    { href: "/dealer/analytics",  label: "Analytics",        icon: BarChart2       },
    { href: "/dealer/team",       label: "Team",             icon: Users           },
    { href: "/sell",              label: "Add Listing",      icon: PlusCircle      },
    { href: "/subscription",      label: "Subscription",     icon: CreditCard      },
  ];

  const adminItems: MenuItem[] = [
    { href: "/admin",             label: "Admin Dashboard",  icon: ShieldCheck     },
    { href: "/admin/listings",    label: "All Listings",     icon: Car             },
    { href: "/admin/moderation",  label: "Moderation",       icon: FileText, badge: "!" },
    { href: "/admin/users",       label: "Users",            icon: Users           },
  ];

  let menuItems: MenuItem[] = [];
  if (role === "admin") {
    menuItems = [...adminItems, ...commonItems];
  } else if (role === "dealer") {
    menuItems = [...dealerItems, ...commonItems];
  } else if (role === "user") {
    menuItems = [...userItems, ...commonItems];
  }

  async function handleLogout() {
    setOpen(false);
    try {
      await authService.logout(useAuthStore.getState().accessToken ?? undefined);
    } catch {
      // ignore
    } finally {
      logout();
      toast.success("Signed out");
      router.push("/");
    }
  }

  // ── not logged in ────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-100"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white transition hover:bg-neutral-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  // ── role badge colour ────────────────────────────────────────────────────
  const roleBadgeClass =
    role === "admin"
      ? "bg-red-100 text-red-700"
      : role === "dealer"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";

  const roleLabel =
    role === "admin" ? "Admin" : role === "dealer" ? "Dealer" : "Member";

  return (
    <div className="relative" ref={ref}>
      {/* trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-2.5 text-sm shadow-sm transition hover:border-neutral-300 hover:shadow"
      >
        {/* avatar */}
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[80px] truncate font-medium text-neutral-800 sm:block">
          {firstName}
        </span>
        <span className={cn("hidden rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:block", roleBadgeClass)}>
          {roleLabel}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-neutral-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {/* dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
          {/* header */}
          <div className="border-b border-neutral-100 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {user?.full_name ?? user?.email}
            </p>
            <p className="truncate text-xs text-neutral-500">{user?.email}</p>
            <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold", roleBadgeClass)}>
              {roleLabel}
            </span>
          </div>

          {/* menu items */}
          <ul className="py-1">
            {menuItems.map(({ href, label, icon: Icon, badge }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50"
                >
                  <Icon className="h-4 w-4 shrink-0 text-neutral-500" />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* logout */}
          <div className="border-t border-neutral-100 py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
