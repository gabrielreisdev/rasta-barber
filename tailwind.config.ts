import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Dark surface palette
        dark: {
          950: 'var(--color-bg-base)',
          900: 'var(--color-bg-card)',
          850: 'var(--color-bg-card-hover)',
          800: 'var(--color-bg-elevated)',
          700: 'var(--color-border-subtle)',
          600: 'var(--color-text-muted)',
          500: 'var(--color-text-base)',
          400: 'var(--color-text-strong)',
          300: 'var(--color-text-stronger)',
        },
        // Accent — emerald-based brand green
        accent: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dim: '#059669',
          soft: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.25)',
          glow: 'rgba(16, 185, 129, 0.20)',
        },
        // Rasta accent colors (subtle usage)
        rasta: {
          green: {
            DEFAULT: '#10B981',
            light: '#34D399',
            soft: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.25)'
          },
          gold: {
            DEFAULT: '#F59E0B',
            light: '#FBBF24',
            soft: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.25)'
          },
          red: {
            DEFAULT: '#EF4444',
            light: '#F87171',
            soft: 'rgba(239, 68, 68, 0.10)',
            border: 'rgba(239, 68, 68, 0.25)'
          }
        },
        // Surface aliases for text/UI
        surface: {
          50: 'var(--color-surface-900)',
          100: 'var(--color-surface-100)',
          200: 'var(--color-surface-200)',
          300: 'var(--color-surface-300)',
          700: 'var(--color-surface-300)',
          800: 'var(--color-surface-200)',
          900: 'var(--color-surface-100)'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'clean': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'clean-md': '0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'clean-lg': '0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 4px 8px -4px rgba(0, 0, 0, 0.3)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.15), 0 0 60px rgba(16, 185, 129, 0.06)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.12)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        // Legacy alias
        'rasta-glow': '0 0 20px rgba(16, 185, 129, 0.15)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")"
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    }
  }
}
