/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  mode: 'jit',
  safelist: [
    // Colores del brand
    'text-brand-yellow',
    'text-brand-blue',
    'text-brand-pink',
    'bg-brand-yellow',
    'bg-brand-blue',
    'bg-brand-pink',
    // Tamaños específicos que usa
    'text-[40px]',
    'text-[82px]',
    'text-[16px]',
    'lg:text-[82px]',
    'lg:text-[40px]',
    // Márgenes específicos
    '-mb-6',
    'lg:-mb-16',
    'mb-[10vh]',
    // Otros estilos específicos
    'leading-1',
    'transform',
    '-rotate-1',
    'py-0',
    // Estados hover/focus
    'hover:bg-pink-400',
    'focus:ring-pink-500',
    'focus:ring-pink-300',
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
