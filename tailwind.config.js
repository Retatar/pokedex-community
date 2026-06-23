/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#CC0000",
        secondary: "#003A8C",
        accent: "#FFCB05",
        error: "#DC2626",
        success: "#059669",
        warning: "#D97706",
      }
    },
  },
  plugins: [],
}

