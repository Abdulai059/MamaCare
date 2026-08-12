/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#208AEF",
        brandBlue: "#208AEF", // or a different shade if you want to differentiate
      },
    },
  },
  plugins: [],
};
