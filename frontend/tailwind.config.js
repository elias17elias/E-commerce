/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#202622',
        muted: '#747a73',
        paper: '#f7f6f2',
        line: '#e8e7e1',
        forest: '#284b3d',
        lime: '#d8ed9c',
        coral: '#f28c70',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(32, 38, 34, 0.09)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
