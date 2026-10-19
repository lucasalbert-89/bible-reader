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
          50: '#F0F4FA',
          100: '#D9E2F2',
          200: '#B8CBE6',
          300: '#8DAACF',
          400: '#5F85B2',
          500: '#3D6392',
          600: '#2C4970',
          700: '#223458',
          800: '#16233F',
          900: '#0D1527',
          950: '#070B14',
        },
        reformedGold: {
          50: '#FDF9EF',
          100: '#FBF2DD',
          200: '#F6E4BA',
          300: '#E9CE87',
          400: '#E5BD55',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
          950: '#2E1002',
        },
        reformedGreen: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        parchment: {
          50: '#FDFBF7',
          100: '#F7F3EB',
          200: '#ECE4D4',
          300: '#DDD2BD',
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
