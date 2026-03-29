/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Fruity primary
        brand: {
          50:  '#fff4ec',
          100: '#ffe4cc',
          200: '#ffbf95',
          300: '#ff9662',
          400: '#ff7a3d',
          500: '#ff5f1f',
          600: '#e04a10',
          700: '#b83a0c',
        },
        dragonfruit: '#e040fb',
        kiwi:        '#65a30d',
        citrus:      '#d97706',
        watermelon:  '#e11d48',
        // Light backgrounds
        cream: {
          50:  '#fffdf9',
          100: '#fef9f4',
          200: '#fdf0e8',
          300: '#fce4d4',
        },
        // Text shades (warm plum)
        plum: {
          950: '#1e0a2e',
          800: '#3d1a5c',
          600: '#6b3d9a',
          400: '#9d6fc5',
          200: '#d4b8f0',
          100: '#f0e4ff',
          50:  '#faf5ff',
        },
      },
    },
  },
  plugins: [],
}
