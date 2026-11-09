/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#090909',
        panel: '#121212',
        card: '#181818',
        gold: '#D6A85F',
        'gold-soft': '#E8C995',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 40px rgba(214, 168, 95, .10)',
      },
    },
  },
  plugins: [],
}
