"use client";

import { useEffect } from "react";
import { messages } from "@/i18n/messages";
import { useUIStore } from "@/store/ui-store";
import type { Locale } from "@/types/domain";

export function useI18n() {
  const locale = useUIStore((s) => s.locale);
  const setLocale = useUIStore((s) => s.setLocale);
  const setLanguageModalOpen = useUIStore((s) => s.setLanguageModalOpen);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved === "en" || saved === "ar") {
      setLocale(saved);
      setLanguageModalOpen(false);
      return;
    }

    setLanguageModalOpen(true);
  }, [setLocale, setLanguageModalOpen]);

  useEffect(() => {
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return {
    locale,
    setLocale,
    isRTL: locale === "ar",
    t: (key: keyof (typeof messages)["en"]) => messages[locale][key] ?? key,
  };
}
