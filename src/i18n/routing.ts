import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // Supported locales
  locales: ["tr", "en"],
  // Default fallback locale
  defaultLocale: "tr",
  // Automatically detect device language based on Accept-Language header
  localeDetection: true,
  // Clean URLs with locale prefix as-needed
  localePrefix: "as-needed",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

