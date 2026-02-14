/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#409eff',
          dark: '#337ecc',
          light: '#66b1ff'
        }
      }
    },
  },
  plugins: [],
}
