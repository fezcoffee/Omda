import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          50:  "#FDF8F3",
          100: "#F5E9D8",
          200: "#E8CDB0",
          300: "#D4A97A",
          400: "#C08050",
          500: "#A0612E",
          600: "#7B4520",
          700: "#5A3016",
          800: "#3B1F0A",
          900: "#1F0F03",
        },
      },
    },
  },
  plugins: [],
};
export default config;
