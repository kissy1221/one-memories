/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        desk: "#4A4E45",
        paper: "#F7F3E8",
        rule: "#BFCBD4",
        "margin-red": "#D66A5E",
        ink: "#3B3A36",
        "ink-red": "#A6453B",
        pencil: "#8A857C",
        "pencil-dark": "#736E64",
        scrap: "#FFFDF6",
        "scrap-edge": "#E0D9C4",
        "cover-dark": "#22252B",
      },
      fontFamily: {
        sans: ["'Zen Kaku Gothic New'", "sans-serif"],
        display: ["'Zen Old Mincho'", "serif"],
        hand: ["'Klee One'", "cursive"],
      },
    },
  },
  plugins: [],
};
