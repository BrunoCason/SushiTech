/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        DEDEDE: "#DEDEDE",
        CC3333: "#CC3333",
        EBEBEB: "#EBEBEB",
        D4D4D4: "#D4D4D4",
        FA958: "#0FA958",
        ADABAC: "#ADABAC"
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
