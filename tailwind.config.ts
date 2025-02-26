import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Royal Scale
        royal: {
          50: "var(--royal-50)",
          100: "var(--royal-100)",
          200: "var(--royal-200)",
          300: "var(--royal-300)",
          400: "var(--royal-400)",
          500: "var(--royal-500)",
          600: "var(--royal-600)",
          700: "var(--royal-700)",
          800: "var(--royal-800)",
          900: "var(--royal-900)",
        },
        // Neutral Scale
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
        },
        // Circuit Green Scale
        green: {
          50: "var(--green-50)",
          100: "var(--green-100)",
          200: "var(--green-200)",
          300: "var(--green-300)",
          400: "var(--green-400)",
          500: "var(--green-500)",
          600: "var(--green-600)",
          700: "var(--green-700)",
          800: "var(--green-800)",
          900: "var(--green-900)",
        },
        // Diagnostic Red Scale
        red: {
          50: "var(--red-50)",
          100: "var(--red-100)",
          200: "var(--red-200)",
          300: "var(--red-300)",
          400: "var(--red-400)",
          500: "var(--red-500)",
          600: "var(--red-600)",
          700: "var(--red-700)",
          800: "var(--red-800)",
          900: "var(--red-900)",
        },
        // Status Orange Scale
        orange: {
          50: "var(--orange-50)",
          100: "var(--orange-100)",
          200: "var(--orange-200)",
          300: "var(--orange-300)",
          400: "var(--orange-400)",
          500: "var(--orange-500)",
          600: "var(--orange-600)",
          700: "var(--orange-700)",
          800: "var(--orange-800)",
          900: "var(--orange-900)",
        },
        // Semantic Colors
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "primary-pressed": "var(--primary-pressed)",
        "primary-bg": "var(--primary-bg)",

        error: "var(--error)",
        "error-bg": "var(--error-bg)",
        warning: "var(--warning)",
        "warning-bg": "var(--warning-bg)",
        success: "var(--success)",
        "success-bg": "var(--success-bg)",

        background: "var(--background)",
        "background-card": "var(--background-card)",
        "background-code": "var(--background-code)",
      },
      fontFamily: {
        sans: ["Source Sans Pro", "Open Sans", "sans-serif"],
        heading: ["Roboto", "sans-serif"],
        mono: ["Source Code Pro", "Roboto Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      spacing: {
        // Add any custom spacing if needed
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        dropdown:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  darkMode: ["class", '[data-theme="dark"]'],
  plugins: [],
} satisfies Config;
