/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': 'var(--color-game-bg)',
        'game-text': 'var(--color-game-text)',
        'game-button': 'var(--color-game-button)',
        'game-button-hover': 'var(--color-game-button-hover)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
}