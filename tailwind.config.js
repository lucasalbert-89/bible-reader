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
        reformedNavy: {
          950: '#070B14',
          900: '#0D1527',
          800: '#16233F',
          700: '#223458',
        },
        reformedGold: {
          50: '#FDF9EF',
          100: '#FBF2DD',
          200: '#F6E4BA',
          400: '#EAB308',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        reformedGreen: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        parchment: {
          50: '#FDFBF7',
          100: '#F7F3EB',
          200: '#ECE4D4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        display: ['Cinzel', 'Crimson Pro', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(217, 119, 6, 0.25)',
        'sacred-glow': '0 0 25px rgba(245, 158, 11, 0.15)',
        'reformed-card': '0 10px 30px -10px rgba(7, 11, 20, 0.4)',
      }
    },
  },
  plugins: [],
}
