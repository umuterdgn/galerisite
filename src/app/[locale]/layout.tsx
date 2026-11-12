import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LUMIÈRE | Geleceğin Gayrimenkul Deneyimi",
  description:
    "Ultra-lüks gayrimenkuller, yapay zeka destekli sanal sahneleme (AI Virtual Staging), GEO odaklı portföy yönetimi ve yeni nesil B2B emlak ekosistemi.",
  keywords: [
    "Lüks Gayrimenkul",
    "B2B SaaS Emlak",
    "Boğaz Yalısı",
    "Penthouse",
    "AI Virtual Staging",
    "Off-Market Portföy",
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Gelen dil kodunun desteklenen diller arasında olduğunu doğrula
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // İstek için geçerli dil sözlüğünü al
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased transition-colors duration-300 selection:bg-gold-500/25 selection:text-gold-400">
        <AuthProvider>
          <ThemeProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

