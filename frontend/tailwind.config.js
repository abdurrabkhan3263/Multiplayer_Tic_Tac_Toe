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
        "custom-yellow": "var(--yellow)",
        "dark-yellow": "var(--dark-yellow)",
        "custom-blue": "var(--blue)",
        "dark-blue": "var(--dark-blue)",
      },
      borderColor: {
        "dark-yellow": "var(--dark-yellow)",
      },

      ringColor: {
        "dark-yellow": "var(--dark-yellow)",
        "custom-yellow": "var(--yellow)",
      },
      ringOffsetColor: {
        "dark-yellow": "var(--dark-yellow)",
        "custom-yellow": "var(--yellow)",
      },
      boxShadowColor: {
        yellow: "var(--alpha-yellow)",
      },
      textColor: {
        customYellow: "var(--yellow)",
        customDarkYellow: "var(--dark-yellow)",
        lightText: "var(--text)",
        customBlue: "var(--blue)",
        darkText: "var(--darkText)",
      },
      fontFamily: {
        gameFont: ['"Press Start 2P"', "system-ui"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
