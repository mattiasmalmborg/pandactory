/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': '#2d5016',
        'desert-sand': '#c2b280',
        'panda-orange': '#ff6b35',
      },
    },
  },
  plugins: [],
}
