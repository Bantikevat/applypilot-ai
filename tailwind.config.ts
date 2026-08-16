import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--bg-dark) / <alpha-value>)",
        surface: {
          1: "hsl(var(--surface-1) / <alpha-value>)",
          2: "hsl(var(--surface-2) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          glow: "var(--primary-glow)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          glow: "var(--secondary-glow)",
        },
        accent: {
          success: "hsl(var(--accent-success) / <alpha-value>)",
          warning: "hsl(var(--accent-warning) / <alpha-value>)",
          danger: "hsl(var(--accent-danger) / <alpha-value>)",
        },
        text: {
          main: "hsl(var(--text-main) / <alpha-value>)",
          muted: "hsl(var(--text-muted) / <alpha-value>)",
          subtle: "hsl(var(--text-subtle) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "sans-serif"],
        body: ["var(--font-plus-jakarta)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        luxury: "var(--shadow-luxury)",
        glow: "var(--shadow-glow)",
      },
      backgroundImage: {
        "electric-aura": "linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(187, 92%, 53%) 100%)",
        "glass-border": "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
