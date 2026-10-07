/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf8f5',
          100: '#f5efe7',
          200: '#e9dacb',
          300: '#dbc0ab',
          400: '#cca086',
          500: '#c08466',
          600: '#b26e53',
          700: '#945543',
          800: '#78463a',
          900: '#623b32',
          950: '#341d18',
        },
        dark: {
          900: '#111111',
          800: '#1a1a1a',
          700: '#262626',
          600: '#333333'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
