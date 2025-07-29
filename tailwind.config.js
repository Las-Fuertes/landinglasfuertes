/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['DM Sans', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
      },
      colors: {
        'brand-blue': '#0413D8',
        'brand-yellow': '#FFD700',
        'brand-pink': '#FF74BA',
      },
    },
  },
  plugins: [],
}
