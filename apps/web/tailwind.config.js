/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Brand accent: was indigo, now warm orange (Tailwind's orange scale).
        // Any page still using primary-* picks this up automatically.
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        // App background: was #fafafa, now warm charcoal.
        // `bg-surface` still works; `surface-raised` is for cards/panels.
        surface: {
          DEFAULT: "#0c0a09",
          raised: "#14110f",
          card: "#120f0d",
        },
        // Status colors, brightened so they read on a dark background.
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#f43f5e",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        // Dark UIs need deeper shadows to show any depth.
        card: "0 1px 2px 0 rgb(0 0 0 / 0.4), 0 1px 3px 0 rgb(0 0 0 / 0.3)",
        elevated: "0 8px 24px -4px rgb(0 0 0 / 0.5), 0 2px 8px -2px rgb(0 0 0 / 0.4)",
        fab: "0 8px 24px -4px rgb(249 115 22 / 0.45)",
      },
    },
  },
  plugins: [],
};