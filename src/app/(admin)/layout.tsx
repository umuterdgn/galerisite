import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

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
  title: "360° Sanal Tur Stüdyosu | Lumière B2B Admin",
  description:
    "Emlakçılar ve müteahhitler için 360° sanal tur, cubemap dönüştürücü ve interaktif hotspot yönetim stüdyosu.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-[#06070a] text-foreground antialiased selection:bg-gold-500/20 selection:text-gold-400">
        <AuthProvider>
          <ThemeProvider>
            <AdminLayoutShell>{children}</AdminLayoutShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

