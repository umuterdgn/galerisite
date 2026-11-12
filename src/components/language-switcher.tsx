"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = (nextLocale: "tr" | "en") => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-gold-500/25 bg-card/60 p-1 backdrop-blur-md">
      <Globe className="ml-1.5 h-3.5 w-3.5 text-gold-400" />
      <button
        onClick={() => toggleLanguage("tr")}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wider transition-colors ${
          locale === "tr"
            ? "bg-gold-500 text-obsidian-950 shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        TR
      </button>
      <button
        onClick={() => toggleLanguage("en")}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wider transition-colors ${
          locale === "en"
            ? "bg-gold-500 text-obsidian-950 shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}

