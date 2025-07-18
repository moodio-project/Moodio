import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Moodio Spotify-inspired color palette
        background: {
          DEFAULT: '#121212', // Charcoal Black
          secondary: '#181818',
          tertiary: '#282828',
        },
        accent: {
          DEFAULT: '#22C55E', // Mint Green
          hover: '#16A34A',
          muted: '#15803D',
        },
        highlight: {
          lavender: '#A78BFA', // Soft Lavender
          pink: '#F472B6', // Warm Pink
        },
        text: {
          DEFAULT: '#FFFFFF', // White
          muted: '#B3B3B3', // Muted Gray
          secondary: '#A7A7A7',
        },
        border: {
          DEFAULT: '#282828',
          secondary: '#404040',
        },
        // Spotify-like gradients
        gradient: {
          primary: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          secondary: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
          background: 'linear-gradient(135deg, #121212 0%, #181818 100%)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'spotify': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config 