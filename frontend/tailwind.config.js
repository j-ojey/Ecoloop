/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',
        primaryDark: '#15803d',
        primaryLight: '#22c55e',
        accent: '#f59e0b',
        accentDark: '#d97706',
        softBg: '#f8fafc',
        softBorder: '#e2e8f0'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(0,0,0,0.15)',
        glow: '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-lg': '0 0 30px rgba(34, 197, 94, 0.4)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite'
      }
    }
  },
  plugins: [forms, typography]
};
