/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'classic-grey': '#D4D0C8',
        'classic-blue': '#000080',
        'classic-aero': '#A6CAF0',
        'classic-header': '#E0E0E0',
        'gjc-green': '#00401A',
        'gjc-gold': '#C5A059',
        /* Win95/98 Dark Mode Palette */
        'dark-surface': '#2D2D2D',
        'dark-surface-alt': '#3A3A3A',
        'dark-panel': '#404040',
        'dark-input': '#1E1E1E',
        'dark-border-light': '#5A5A5A',
        'dark-border-dark': '#1A1A1A',
        'dark-text': '#E0E0E0',
        'dark-text-muted': '#A0A0A0',
        'dark-highlight': '#666666',
        'dark-shadow': '#1A1A1A',
        'dark-title': '#1E3A6E',
        'dark-title-end': '#2A4F8A',
        'dark-accent': '#6B9BD2',
        'dark-selection': '#1E3A6E',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'bevel-raised': '2px 2px 0px #FFFFFF inset, -2px -2px 0px #808080 inset',
        'bevel-sunken': '2px 2px 0px #808080 inset, -2px -2px 0px #FFFFFF inset',
        'bevel-raised-dark': '2px 2px 0px #5A5A5A inset, -2px -2px 0px #1A1A1A inset',
        'bevel-sunken-dark': '2px 2px 0px #1A1A1A inset, -2px -2px 0px #5A5A5A inset',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
