/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Enable dark mode via the `dark` class AND the `[data-theme="dark"]` attribute
  // so AppShell's `document.documentElement.dataset.theme` toggle works.
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        card: "#FFFFFF",
        ink: "#0F172A",
        subtle: "#64748B",
        brand: "#2563EB",
        success: "#16A34A",
        warn: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        lg: "20px",
        xl: "28px",
      },
      boxShadow: {
        panel: "0 6px 24px rgba(2,6,23,.06)",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
