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
      /* ================================
         COLORS
        ========================= */
      colors: {
        blue: {
          DEFAULT: '#0413D8',
          700: '#78C2FF', // light blue
          300: '#030fa5', // dark blue
        },
        purple: {
          DEFAULT: '#b3b8f0',
        },
        red: {
          DEFAULT: '#F57087',
        },
        pink: {
          DEFAULT: '#FF74BA',
        },
        yellow: {
          DEFAULT: '#FFD700',
        },
        orange: {
          DEFAULT: '#FF7E37',
        },
        black: {
          DEFAULT: '#242424',
        },
      },

      /* ================================
         TYPOGRAPHY SCALE
         ================================ */
      fontSize: {
        h1: ['40px', { lineHeight: '1.1', fontWeight: '400' }],
        h2: ['30px', { lineHeight: '1.2', fontWeight: '400' }],
        h3: ['20px', { lineHeight: '1.3', fontWeight: '400' }],
        h4: ['18px', { lineHeight: '1.4', fontWeight: '400' }],
        'p-lg': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'p-sm': ['13px', { lineHeight: '1.6', fontWeight: '400' }],
      },

      /* ================================
         SPACING SCALE
         ================================ */
      spacing: {
        xs: '5px',
        s: '10px',
        m: '15px',
        l: '25px',
        xl: '40px',
        xxl: '65px',
      },
    },
  },

  /* ================================
     PLUGINS
     ================================ */
  plugins: [
    require('@tailwindcss/forms'), // Mejora inputs por defecto
  ],
};
