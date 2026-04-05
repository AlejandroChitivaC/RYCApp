/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F5B800',
          'yellow-bright': '#F9C81C',
          'yellow-muted': '#E5AC00',
          dark: '#2B2B2B',
          'dark-deep': '#1A1A1A',
          muted: '#5C5C5C',
        },
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
        card: '0 1px 2px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.1)',
        brand: '0 4px 14px rgba(245, 184, 0, 0.35)',
      },
    },
  },
  plugins: [],
}

