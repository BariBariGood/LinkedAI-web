/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0)', opacity: 0 },
          '5%': { transform: 'translateY(-100px)', opacity: 0.5 },
          '10%': { transform: 'translateY(-200px)', opacity: 0.55 },
          '20%': { transform: 'translateY(-300px)', opacity: 0.6 },
          '30%': { transform: 'translateY(-400px)', opacity: 0.65 },
          '40%': { transform: 'translateY(-500px)', opacity: 0.6 },
          '50%': { transform: 'translateY(-600px)', opacity: 0.55 },
          '60%': { transform: 'translateY(-700px)', opacity: 0.5 },
          '70%': { transform: 'translateY(-800px)', opacity: 0.45 },
          '80%': { transform: 'translateY(-900px)', opacity: 0.4 },
          '90%': { transform: 'translateY(-1000px)', opacity: 0.3 },
          '100%': { transform: 'translateY(-1100px)', opacity: 0 }
        }
      },
      animation: {
        'float': 'float 20s linear forwards'
      }
    },
  },
  plugins: [daisyui],
} 