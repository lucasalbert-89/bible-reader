/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neonGreen: '#39FF14',
        neonOrange: '#FF5F1F',
        holyGold: '#D97706',
        holyGoldLight: '#FBBF24',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Crimson Pro', 'serif'],
        condensed: ['Roboto Condensed', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(57, 255, 20, 0.25)',
        'neon-orange': '0 0 15px rgba(255, 95, 31, 0.25)',
        'holy-glow': '0 0 20px rgba(217, 119, 6, 0.2)',
      }
    },
  },
  plugins: [],
}
