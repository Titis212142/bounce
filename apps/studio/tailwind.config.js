/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dopamine: {
          purple: '#8B5CF6',
          cyan: '#00E5FF',
          green: '#00FF9C',
          yellow: '#FFD93D',
          pink: '#FF2D95',
          gold: '#FFD700',
        },
      },
    },
  },
  plugins: [],
};
