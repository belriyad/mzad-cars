"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Car,
  Heart,
  Home,
  User,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const guestItems: NavItem[] = [
  { href: "/",              label: "Home",    icon: Home      },
  { href: "/listings",      label: "Browse",  icon: Car       },
  { href: "/dealer-signup", label: "Dealers", icon: Building2 },
  { href: "/favorites",     label: "Saved",   icon: Heart     },
  { href: "/login",         label: "Login",   icon: User      },
];

const userItems: NavItem[] = [
  { href: "/",              label: "Home",    icon: Home      },
  { href: "/listings",      label: "Browse",  icon: Car       },
  { href: "/favorites",     label: "Saved",   icon: Heart     },
  { href: "/notifications", label: "Alerts",  icon: Bell      },
  { href: "/profile",       label: "Me",      icon: User      },
];

const dealerItems: NavItem[] = [
  { href: "/",                 label: "Home",      icon: Home          },
  { href: "/listings",         label: "Browse",    icon: Car           },
  { href: "/dealer",           label: "Dashboard", icon: LayoutDashboard },
  { href: "/dealer/inventory", label: "Stock",     icon: Package       },
  { href: "/profile",          label: "Me",        icon: User          },
];

const adminItems: NavItem[] = [
  { href: "/",                label: "Home",      icon: Home        },
  { href: "/listings",        label: "Browse",    icon: Car         },
  { href: "/admin",           label: "Admin",     icon: ShieldCheck },
  { href: "/admin/moderation",label: "Moderate",  icon: Bell        },
  { href: "/profile",         label: "Me",        icon: User        },
];

export function MobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);

  const role = user?.role ?? "guest";

  let items: NavItem[];
  if (!token) {
    items = guestItems;
  } else if (role === "admin") {
    items = adminItems;
  } else if (role === "dealer") {
    items = dealerItems;
  } else {
    items = userItems;
  }

  return (
    <nav className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-2xl border border-neutral-200 bg-white/95 p-1 shadow-xl backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px]",
                  active ? "bg-neutral-900 text-white" : "text-neutral-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

