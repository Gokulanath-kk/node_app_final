/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      letterSpacing: {
        'wider-sm' : '0.01em', // Custom letter-spacing for small screens
      },
      colors: {
        lite: '#BD76F6',
        litegreen: '#14C71A',
      },
      clipPath: {
        'custom-polygon': 'polygon(30% 0%, 100% 0, 100% 30%, 100% 100%, 70% 100%, 30% 100%, 0 100%, 0 0)',
      },
      fontFamily: {
        'astron_boy': ['astron_boy', 'sans-serif'],
        'bankgothic': ['bankgothic', 'serif'],
        'unbounded': ['Unbounded', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        slide: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        spinSlow: {
          
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        'slide-right': 'slide 20s linear infinite',
        'spin-slow': 'spinSlow 10s linear infinite'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function({ addUtilities }) {
      addUtilities({
        '.clip-path-custom-polygon': {
          clipPath: 'polygon(30% 0%, 100% 0, 100% 30%, 100% 100%, 70% 100%, 30% 100%, 0 100%, 0 0)',
        },
      });
    },
  ],
};
