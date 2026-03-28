/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f0ff',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7c3aed',
        },
      },
    },
  },
  plugins: [],
}

