"use client";

import { useI18n } from "@/hooks/use-i18n";
import { useUIStore } from "@/store/ui-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LanguageModal() {
  const { locale, setLocale } = useI18n();
  const isOpen = useUIStore((s) => s.languageModalOpen);
  const setOpen = useUIStore((s) => s.setLanguageModalOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
    >
      <Card className="pointer-events-auto w-full max-w-sm space-y-3" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">Choose your language</h2>
        <p className="text-sm text-neutral-500">اختر لغتك المفضلة</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={locale === "en" ? "default" : "secondary"}
            onClick={() => setLocale("en")}
          >
            English
          </Button>
          <Button
            type="button"
            variant={locale === "ar" ? "default" : "secondary"}
            onClick={() => setLocale("ar")}
          >
            العربية
          </Button>
        </div>
        <Button type="button" className="w-full" onClick={() => setOpen(false)}>
          Continue
        </Button>
      </Card>
    </div>
  );
}
