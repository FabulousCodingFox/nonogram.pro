/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f4f6',
          100: '#e5e7eb',
          200: '#c7d2e0',
          300: '#a9bdd5',
          400: '#6d97bf',
          500: '#3171a9',
          600: '#2c6398',
          700: '#1d4265',
          800: '#16314d',
          900: '#0f2135'
        }
      }
    }
  },
  plugins: []
};
