import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["Outfit", "sans-serif"],
    },
    extend: {
      colors: {
        cherry: "#f7b2b7",
        coral: "#f7717d",
        thulian: "#DE639A",
        mardi: "#7f2982",
        darkpurple: "#16001e",
      },
    },
  },
  plugins: [],
};
export default config;
