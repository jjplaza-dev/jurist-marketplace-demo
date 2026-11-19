import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fb: { DEFAULT: "#1877F2", dark: "#166FE5", soft: "#E7F3FF" },
        surface: "#F0F2F5",
      },
    },
  },
  plugins: [],
};
export default config;
