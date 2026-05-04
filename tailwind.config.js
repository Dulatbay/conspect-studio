/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0a0a0f',
          subtle: '#12121a',
          surface: '#171723',
          elevated: '#1f1f2e',
          panel: '#14141d',
        },
        line: {
          soft: 'rgba(255, 255, 255, 0.06)',
          DEFAULT: 'rgba(255, 255, 255, 0.10)',
          strong: 'rgba(255, 255, 255, 0.18)',
        },
        ink: {
          100: '#f5f5fa',
          200: '#d7d7e0',
          300: '#a7a7b8',
          400: '#7a7a8f',
          500: '#5d5d73',
        },
        brand: {
          50: '#eef0ff',
          100: '#dde0ff',
          200: '#bbc2ff',
          300: '#8e96ff',
          400: '#6d70ff',
          500: '#5348f2',
          600: '#4339d6',
          700: '#352ca8',
          800: '#2a2482',
          900: '#1c1859',
        },
        accent: {
          400: '#34e4c5',
          500: '#10c9a3',
          600: '#0aa384',
        },
        danger: {
          400: '#ff6b6b',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 30px -12px rgba(0,0,0,0.5)',
        card: '0 1px 0 rgba(255,255,255,0.05) inset, 0 10px 30px -15px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(83,72,242,0.25), 0 0 32px -4px rgba(83,72,242,0.35)',
        float: '0 20px 40px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'grid-soft':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'radial-fade':
          'radial-gradient(ellipse at top, rgba(83,72,242,0.18), transparent 60%)',
        'brand-gradient':
          'linear-gradient(135deg, #6d70ff 0%, #5348f2 50%, #4339d6 100%)',
      },
      backgroundSize: {
        grid: '28px 28px',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      animation: {
        'fade-in': 'fadeIn 180ms ease-out',
        'slide-up': 'slideUp 220ms ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
