/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        red: { DEFAULT: '#e61b1b', light: '#ff2b2b', dim: 'rgba(230,27,27,0.12)' },
        dark: { DEFAULT: '#0a0a0a', 2: '#111111', 3: '#1a1a1a' },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
