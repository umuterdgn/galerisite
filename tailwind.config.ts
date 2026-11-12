import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        
        // Luxury Gold Palette (Accent & Highlights)
        gold: {
          50: "#FAF7EE",
          100: "#F5EDD6",
          200: "#EBDAAD",
          300: "#DFC380",
          400: "#D3AD55",
          500: "#C59B27", // Primary Signature Gold
          600: "#A67F1C",
          700: "#7F5F14",
          800: "#59420D",
          900: "#362707",
          950: "#1E1503",
          champagne: "#F7E7CE",
          bronze: "#A37C40",
          metallic: "#D4AF37",
        },

        // Deep Navy / Midnight Blue Palette (Royalty & Authority)
        navy: {
          50: "#F2F6FA",
          100: "#E1EAF3",
          200: "#C5D7E8",
          300: "#9EBDD8",
          400: "#6C99C0",
          500: "#4478A7",
          600: "#305C88",
          700: "#224467",
          800: "#162E48",
          900: "#0D1E30",
          950: "#07101B", // Deepest Midnight Navy
        },

        // Obsidian / Deep Black Palette (Luxury Dark Mode)
        obsidian: {
          50: "#F6F6F7",
          100: "#E2E3E6",
          200: "#C5C7CD",
          300: "#9EA2AC",
          400: "#6F7583",
          500: "#4A4F5D",
          600: "#363A45",
          700: "#24272F",
          800: "#16181D",
          900: "#0D0E12",
          950: "#060709", // Velvet Obsidian Black
        },

        // Design System Tokens
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F5EDD6 0%, #D3AD55 50%, #A67F1C 100%)",
        "gold-shimmer": "linear-gradient(90deg, #C59B27 0%, #FAF7EE 50%, #C59B27 100%)",
        "luxury-dark": "radial-gradient(ellipse at top, #162E48 0%, #07101B 65%, #060709 100%)",
        "luxury-mesh": "radial-gradient(at 0% 0%, rgba(197, 155, 39, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(13, 30, 48, 0.45) 0px, transparent 50%)",
      },
      boxShadow: {
        "gold-sm": "0 2px 10px rgba(197, 155, 39, 0.15)",
        "gold-md": "0 4px 20px rgba(197, 155, 39, 0.25)",
        "gold-lg": "0 10px 30px rgba(197, 155, 39, 0.35)",
        "luxury-glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};

export default config;
