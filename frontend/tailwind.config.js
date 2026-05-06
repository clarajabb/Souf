/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // SOUF brand — warm terracotta orange extracted from the logo
        brand: {
          50:  '#fdf4ec',
          100: '#fae5d0',
          200: '#f5c9a0',
          300: '#eda66a',
          400: '#e08540',
          500: '#c8773a',  // ← logo colour
          600: '#b36530',
          700: '#975426',
          800: '#7c441f',
          900: '#67391b',
          950: '#3d1f0b',
        },
        // Warm sand / off-white for backgrounds
        sand: {
          50:  '#fdfaf5',
          100: '#f7f0e6',
          200: '#ede0cc',
          300: '#dfc9a8',
          400: '#ceaa7d',
          500: '#be8d57',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
