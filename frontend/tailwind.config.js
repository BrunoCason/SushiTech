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
        FACEA8: "#FACEA8",
        E6E6E: "#6E6E6E",
        A7A7A7: "#A7A7A7",
        BCBCBC: "#BCBCBC",
        C99F45: "#C99F45"
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      spacing: {
        "432px": "27em",
        "120px": "7.5em",
        "418px": "26.1em",
        "156px": "9.7em",
      },
    },
  },
  plugins: [],
};
