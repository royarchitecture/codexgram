/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F6",
        ink: "#191B22",
        slate: "#5E6472",
        cobalt: "#2947C6",
        "brand-blue": "#3453D4",
        "apple-button": "#181C22",
        "sign-in-border": "#D9DADE",
      },
    },
  },
};
