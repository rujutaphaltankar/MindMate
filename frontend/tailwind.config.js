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
        },
        sage: {
          50: "#f1f7f3",
          100: "#dfeee3",
          200: "#bcdcc5",
          300: "#94c7a2",
          400: "#6bad7e",
          500: "#4d9163",
          600: "#3a744e",
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
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
