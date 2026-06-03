/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. PROJECT FILES CONTENT SCANNING PERIMETER
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',       // App Router pages and layouts
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // Shared modular component files
    './src/components/ui/**/*.{js,ts,jsx,tsx,mdx}', // Atomic design token components
  ],

  // 2. DESIGN ENGINE THEME EXTENSION CONFIGURATIONS
  theme: {
    extend: {
      // Inject standardized typography rules mapped to optimized Inter font variables
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },

      // Custom color variations tailored for a premium, dark-mode user experience
      colors: {
        slate: {
          750: '#243242', // Perfect midway divider color for soft focus states
          850: '#152132', // Rich secondary card background level
        },
      },

      // Core hardware-accelerated keyframe animations for polished layout entries
      keyframes: {
        fadeInComponent: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(4px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
      },
      
      // Map keyframes directly to dynamic utility classes
      animation: {
        fadeIn: 'fadeInComponent 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },

  // 3. ARCHITECTURAL PLUGINS ATTACHMENTS LAYER
  plugins: [],
};
