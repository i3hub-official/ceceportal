/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        card: 'var(--card)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      height: {
        'nav': 'var(--nav-height)',
        'header': 'var(--header-height)',
      },
      minHeight: {
        'screen': '100vh',
      },
      spacing: {
        'nav': 'var(--nav-height)',
        'header': 'var(--header-height)',
      },
      animation: {
        'loading-bar': 'loadingBar 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        loadingBar: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionProperty: {
        'submenu': 'all',
      },
      transitionDuration: {
        'submenu': '300ms',
      },
      transitionTimingFunction: {
        'submenu': 'ease-in-out',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable class-based dark mode
};

export default config;