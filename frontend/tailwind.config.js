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
        ADABAC: "#ADABAC",
        FACEA8: "#FACEA8"
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      spacing: {
        "510px": "31.8em",
        "120px": "7.5em",
      },
    },
  },
  plugins: [],
};
