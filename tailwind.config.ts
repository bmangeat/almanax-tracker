import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#F3ECD9",
        parchmentDark: "#E7DCBE",
        ink: "#2B2118",
        moss: "#3D5C3A",
        mossDark: "#26402A",
        gold: "#B8863B",
        rust: "#9C4324",
        plum: "#5B3A5C",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
