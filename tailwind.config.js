/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FDFBF7', // Warm Ivory
        foreground: '#1A1C1B', // Deep Charcoal
        'muted-foreground': '#5C6661', // Warm Grey
        
        surface: '#FFFFFF',
        'surface-elevated': '#F4F1EA', // Light Beige / Stone variation
        
        border: '#E8E5DF', // Stone
        
        primary: {
          DEFAULT: '#0A7A6A', // MEDIMESH Teal
          hover: '#086154',
          light: '#E6F2F0', // Soft Mint
        },
        
        secondary: {
          DEFAULT: '#889996', // Muted Sage
          hover: '#6F807D',
        },
        
        blue: {
          light: '#8DB9D9', // Soft Sky Blue
          muted: '#5E8FAF', // Muted Blue
        },
        lavender: {
          DEFAULT: '#B7A9D6', // Soft Lavender
        },
        peach: {
          DEFAULT: '#E7A58B', // Warm Peach
        },
        coral: {
          DEFAULT: '#D98275', // Soft Coral
        },
        amber: {
          DEFAULT: '#D6A85F', // Warm Amber
        },
        sage: {
          DEFAULT: '#9CAF9A', // Muted Sage
        },
        
        accent: {
          DEFAULT: '#339989',
        },
        
        success: '#0A7A6A',
        destructive: '#D9534F',
        
        'focus-ring': '#0A7A6A',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
      },
      animation: {
        shine: 'shine 8s linear infinite',
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'sans-serif'], // Updated to modern sans
        serif: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -4px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 32px -8px rgba(10, 122, 106, 0.1)', // Teal tinted shadow
      }
    },
  },
  plugins: [],
}
