/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: '#17212b',
          secondary: '#2b5278',
          accent: '#64a9dc',
          text: '#ffffff',
          muted: '#8e9aaf',
        },
        card: {
          visa: '#1a1f71',
          mastercard: '#eb001b',
          gold: '#ffd700',
          silver: '#c0c0c0',
        }
      },
      fontFamily: {
        'telegram': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(100, 169, 220, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(100, 169, 220, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
