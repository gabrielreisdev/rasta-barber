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
        // Cores da Bandeira do Reggae / Rasta
        rasta: {
          green: {
            DEFAULT: '#15803D',
            light: '#22C55E',
            soft: '#DCFCE7',
            border: '#86EFAC'
          },
          gold: {
            DEFAULT: '#D97706',
            light: '#F59E0B',
            soft: '#FEF3C7',
            border: '#FDE68A'
          },
          red: {
            DEFAULT: '#DC2626',
            light: '#EF4444',
            soft: '#FEE2E2',
            border: '#FCA5A5'
          }
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      boxShadow: {
        'clean': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'clean-md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'clean-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'rasta-glow': '0 4px 20px -2px rgba(22, 163, 74, 0.15)'
      }
    }
  }
}
