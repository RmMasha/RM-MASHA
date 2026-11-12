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
        // Colores Principales (La Atmósfera)
        navy: {
          deepest: '#050811', // Fondo base más profundo
          DEFAULT: '#070B19', // Azul marino nocturno
          card: '#0A1128',    // Fondo de contenedores
          surface: '#0E1738', // Capa intermedia
        },
        neon: {
          DEFAULT: '#00D2FF', // Azul eléctrico/neón principal
          blue: '#00D2FF',    // Azul eléctrico/neón principal
          cyan: '#00F0FF',    // Resplandor máximo
          glow: '#38BDF8',    // Iluminación suave
        },
        // Colores Secundarios (El Contraste)
        pure: {
          DEFAULT: '#FFFFFF', // Blanco puro
          white: '#FFFFFF',
        },
        magenta: {
          DEFAULT: '#FF007F', // Fucsia/Magenta distintivo de personajes
          hover: '#E00070',
          light: '#FF3399',
          rose: '#F43F5E',
        },
        // Colores de Acento y Relleno (Los Detalles)
        ice: {
          DEFAULT: '#7DD3FC', // Azul Hielo / Celeste
          light: '#BAE6FD',
          frost: '#E0F2FE',
          crystal: '#A5F3FC', // Nieve y papel de regalo navideño
        },
        pitch: {
          DEFAULT: '#060913', // Negro táctico panel por defecto
          black: '#030712',   // Negro táctico profundo
          panel: '#060913',   // Paneles opacos de alto contraste
          card: '#090D1A',
        },
        gold: {
          DEFAULT: '#FBBF24', // Dorado táctico exclusivo
          amber: '#F59E0B',
          bright: '#FFD700',
        },
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(to right, rgba(0, 210, 255, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 210, 255, 0.07) 1px, transparent 1px)",
        'festive-hero': "radial-gradient(ellipse at 50% -20%, rgba(0, 210, 255, 0.25) 0%, rgba(7, 11, 25, 0.95) 60%, #050811 100%)",
        'ice-gradient': "linear-gradient(135deg, #00D2FF 0%, #7DD3FC 50%, #FF007F 100%)",
      },
      boxShadow: {
        'neon-pill': '0 0 25px -3px rgba(0, 210, 255, 0.65), 0 0 10px rgba(0, 210, 255, 0.4)',
        'neon-magenta': '0 0 25px -3px rgba(255, 0, 127, 0.6), 0 0 10px rgba(255, 0, 127, 0.35)',
        'neon-border': '0 0 15px rgba(0, 210, 255, 0.25)',
        'ice-glow': '0 0 20px rgba(125, 211, 252, 0.35)',
        'gold-glow': '0 0 20px rgba(251, 191, 36, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
