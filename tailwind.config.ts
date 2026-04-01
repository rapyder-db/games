import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09111f",
        mist: "#f4f7fb",
        accent: "#0f766e",
        brand: "#1d4ed8",
        gold: "#d97706",
      },
      boxShadow: {
        panel: "0 18px 50px -24px rgba(15, 23, 42, 0.35)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(29, 78, 216, 0.24), transparent 34%), radial-gradient(circle at bottom right, rgba(15, 118, 110, 0.22), transparent 28%)",
      },
    },
  },
  plugins: [],
};

export default config;
