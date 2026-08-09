/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FDFBF7',
        foreground: '#1A1A1A',
        'muted-foreground': '#666666',
        
        surface: '#FFFFFF',
        'surface-elevated': '#F8F8F8',
        
        border: '#E5E5E5',
        
        primary: {
          DEFAULT: '#0A7A6A',
          hover: '#086154',
        },
        
        'secondary-accent': '#339989',
        
        success: '#10B981',
        destructive: '#EF4444',
        
        'focus-ring': '#0A7A6A',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
