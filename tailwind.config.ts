import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 40px rgba(15, 23, 42, 0.10)',
      },
      colors: {
        city: {
          ink: '#0f172a',
          panel: '#ffffff',
          soft: '#f3f6fb',
          accent: '#3966ff',
          accentSoft: '#eaf0ff',
          mint: '#14b8a6',
          ember: '#ff7a59',
          bus: '#f5a623',
          subway: '#2b7cff',
          walk: '#5f6c7b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
