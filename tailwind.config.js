/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          950: '#0a3d3d',
          900: '#0d4f4f',
          800: '#0f5c5c',
          700: '#126f6f',
          600: '#158282',
          500: '#1a9e9e',
          400: '#22b5b5',
          300: '#3ecece',
          200: '#7de2e2',
          100: '#b8f0f0',
          50: '#e6fafa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

