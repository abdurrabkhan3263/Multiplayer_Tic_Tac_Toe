/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {},
      backgroundColor: {
        bg: "var(--bg)",
        yellow: "var(--yellow)",
        "dark-yellow": "var(--dark-yellow)",
      },
      boxShadowColor: {
        yellow: "var(--alpha-yellow)",
      },
      textColor: {
        lightText: "var(--text)",
        darkText: "var(--darkText)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
