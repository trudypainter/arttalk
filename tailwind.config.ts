import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        light: "#efefef",
        lightmid: "#949494",
        mid: "#717171",
        dark: "#1E1E1E",

        lightgreen: "#d1dad8",
        darkgreen: "#4e6e68",

        "custom-blue": {
          "50": "#e5f1ff",
          "100": "#c9ddff",
          "200": "#9fb8ff",
          "300": "#7a95ff",
          "400": "#5c75ff",
          "500": "#3956f8",
          "600": "#2940d6",
          "700": "#1e30b4",
          "800": "#16248e",
          "900": "#101c6e",
        },
      },
    },
    fontFamily: {
      sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      serif: ["Georgia", "Cambria", "serif"],
      mono: ["Consolas", "Menlo", "Monaco", "monospace"],
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
      "5xl": "48px",
      "6xl": "64px",
    },
  },
  plugins: [],
} satisfies Config;
