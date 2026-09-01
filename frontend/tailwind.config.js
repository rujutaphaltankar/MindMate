/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Calm, non-clinical palette: dusk indigo + sage + warm sand accent.
        dusk: {
          50: "#f2f4fb",
          100: "#e3e8f7",
          200: "#c3cdef",
          300: "#9caee2",
          400: "#7086d1",
          500: "#5265ba",
          600: "#414f96",
          700: "#333e77",
          800: "#242b52",
          900: "#171b34",
          950: "#0e1020",
        },
        sage: {
          50: "#f1f7f3",
          100: "#dfeee3",
          200: "#bcdcc5",
          300: "#94c7a2",
          400: "#6bad7e",
          500: "#4d9163",
          600: "#3a744e",
          700: "#2d5b3d",
        },
        sand: {
          100: "#faf3e8",
          200: "#f2e1c4",
          300: "#e6c793",
          400: "#d6a75f",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(23, 27, 52, 0.18)",
        "glow-sage": "0 0 40px -8px rgba(77, 145, 99, 0.55)",
        "glow-sage-sm": "0 0 20px -4px rgba(77, 145, 99, 0.4)",
        "glow-dusk": "0 0 40px -8px rgba(82, 101, 186, 0.45)",
        glass: "0 8px 32px 0 rgba(14, 16, 32, 0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.65s ease-out forwards",
        "fade-in": "fadeIn 0.45s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "float-slower": "float 12s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.8s ease-in-out infinite",
        "spin-slow": "spin 10s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px -4px rgba(77,145,99,0.35)" },
          "50%": { boxShadow: "0 0 48px -4px rgba(77,145,99,0.72)" },
        },
      },
    },
  },
  plugins: [],
};
