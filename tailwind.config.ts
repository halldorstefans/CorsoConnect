import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core colors
        primary: {
          DEFAULT: "#053594",
          hover: "#042b7a",
          pressed: "#032161",
        },
        // Status colors
        success: {
          DEFAULT: "#00855d",
          bg: "#e6f6f0",
        },
        error: {
          DEFAULT: "#dc2626",
          bg: "#ffebeb",
        },
        warning: {
          DEFAULT: "#ffa500",
          bg: "#fff4e6",
        },
        // Background colors
        background: {
          DEFAULT: "#f8f9fa",
          card: "#ffffff",
          code: "#f8f9fa",
        },
        // Text colors
        text: {
          DEFAULT: "#121212",
          secondary: "#343a40",
          muted: "#6e7683",
        },
      },
      fontFamily: {
        sans: ["Source Sans Pro", "Open Sans", "sans-serif"],
        heading: ["Roboto", "sans-serif"],
        mono: ["Source Code Pro", "Roboto Mono", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
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
