import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-pp-fragment)', 'sans-serif'],
      serif: ['var(--font-pp-fragment)', 'serif'],
      mono: ['var(--font-pp-fragment)', 'monospace'],
    },
    extend: {
      colors: {
        "brand-bg": "var(--brand-bg)",
        "brand-bg-secondary": "var(--brand-bg-secondary)",
        "brand-green": "var(--brand-green)",
        "brand-lavender": "var(--brand-lavender)",
        "brand-rose": "var(--brand-rose)",
        "brand-border": "var(--brand-border)",
        "brand-border-strong": "var(--brand-border-strong)",
        "brand-hover": "var(--brand-hover)",
      },
      fontFamily: {
        display: ['var(--font-pp-fragment)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
