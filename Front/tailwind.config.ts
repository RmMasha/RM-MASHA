import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0E14',
        surface: {
          DEFAULT: '#111622',
          card: '#161D2D',
          hover: '#1F293D',
          border: '#27334D',
        },
        brand: {
          primary: '#FF4655', // Fuego / Free Fire Red
          hover: '#E02F3E',
          accent: '#FF7B00',
          gold: '#FFB703',
          cyan: '#00F5D4',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "radial-gradient(circle at 50% 0%, rgba(255, 70, 85, 0.15) 0%, rgba(11, 14, 20, 1) 75%)",
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(255, 70, 85, 0.4)',
        'glow-gold': '0 0 25px -5px rgba(255, 183, 3, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(0, 245, 212, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
