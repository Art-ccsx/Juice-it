/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#1a202c',
        'game-text': '#e2e8f0',
        'game-button': '#4299e1',
        'game-button-hover': '#3182ce',
      },
    },
  },
  plugins: [],
}