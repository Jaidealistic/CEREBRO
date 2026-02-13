/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bny: {
          gold: '#B08E39', // Gold
          goldLight: '#D4AF37', // Lighter Gold
          goldDark: '#8A6E2D', // Darker Gold
          dark: '#0a0a0a', // Deep Black
          card: '#141414', // Card Background
          gray: '#333333', // Secondary dark
          text: '#e5e5e5', // Primary Text
          muted: '#a3a3a3', // Muted Text
        }
      }
    },
  },
  plugins: [],
}
