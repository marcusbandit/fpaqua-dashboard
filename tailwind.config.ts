import type { Config } from "tailwindcss";

export default {
  darkMode: "media", // Respect system preference
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--base)",
        foreground: "var(--text)",
      },
    },
  },
  plugins: [],
} satisfies Config;
