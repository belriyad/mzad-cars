"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Car, Heart, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/",              label: "Home",    icon: Home      },
  { href: "/listings",      label: "Browse",  icon: Car       },
  { href: "/dealer-signup", label: "Dealers", icon: Building2 },
  { href: "/favorites",     label: "Saved",   icon: Heart     },
  { href: "/profile",       label: "Me",      icon: User      },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-2xl border border-neutral-200 bg-white/95 p-1 shadow-xl backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px]",
                  active ? "bg-neutral-900 text-white" : "text-neutral-600",
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
