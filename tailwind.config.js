/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ================================
      // COLORS - CSS Variable Integration
      // ================================
      colors: {
       // Core Theme Colors
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  primary: {
    DEFAULT: 'var(--primary)',
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: 'var(--primary)',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    // Add opacity variants
    90: 'var(--primary-90)',
    80: 'var(--primary-80)',
    70: 'var(--primary-70)',
    60: 'var(--primary-60)',
    50: 'var(--primary-50)',
    40: 'var(--primary-40)',
    30: 'var(--primary-30)',
    20: 'var(--primary-20)',
    10: 'var(--primary-10)',
  },
  secondary: {
    DEFAULT: 'var(--secondary)',
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: 'var(--secondary)',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    // Add opacity variants
    90: 'var(--secondary-90)',
    80: 'var(--secondary-80)',
    70: 'var(--secondary-70)',
    60: 'var(--secondary-60)',
    50: 'var(--secondary-50)',
    40: 'var(--secondary-40)',
    30: 'var(--secondary-30)',
    20: 'var(--secondary-20)',
    10: 'var(--secondary-10)',
  },
  accent: {
    DEFAULT: 'var(--accent)',
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: 'var(--accent)',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    // Add opacity variants
    90: 'var(--accent-90)',
    80: 'var(--accent-80)',
    70: 'var(--accent-70)',
    60: 'var(--accent-60)',
    50: 'var(--accent-50)',
    40: 'var(--accent-40)',
    30: 'var(--accent-30)',
    20: 'var(--accent-20)',
    10: 'var(--accent-10)',
  },

  // State Colors
  success: {
    DEFAULT: 'var(--success)',
    50: '#ecfdf5',
    100: '#d1fae5',
    500: 'var(--success)',
    600: '#059669',
    700: '#047857',
    // Add opacity variants
    90: 'var(--success-90)',
    80: 'var(--success-80)',
    70: 'var(--success-70)',
    60: 'var(--success-60)',
    50: 'var(--success-50)',
    40: 'var(--success-40)',
    30: 'var(--success-30)',
    20: 'var(--success-20)',
    10: 'var(--success-10)',
  },
  warning: {
    DEFAULT: 'var(--warning)',
    50: '#fffbeb',
    100: '#fef3c7',
    500: 'var(--warning)',
    600: '#d97706',
    700: '#b45309',
    // Add opacity variants
    90: 'var(--warning-90)',
    80: 'var(--warning-80)',
    70: 'var(--warning-70)',
    60: 'var(--warning-60)',
    50: 'var(--warning-50)',
    40: 'var(--warning-40)',
    30: 'var(--warning-30)',
    20: 'var(--warning-20)',
    10: 'var(--warning-10)',
  },
  error: {
    DEFAULT: 'var(--error)',
    50: '#fef2f2',
    100: '#fee2e2',
    500: 'var(--error)',
    600: '#dc2626',
    700: '#b91c1c',
    // Add opacity variants
    90: 'var(--error-90)',
    80: 'var(--error-80)',
    70: 'var(--error-70)',
    60: 'var(--error-60)',
    50: 'var(--error-50)',
    40: 'var(--error-40)',
    30: 'var(--error-30)',
    20: 'var(--error-20)',
    10: 'var(--error-10)',
  },
  info: {
    DEFAULT: 'var(--info)',
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: 'var(--info)',
    600: '#0284c7',
    700: '#0369a1',
    // Add opacity variants
    90: 'var(--info-90)',
    80: 'var(--info-80)',
    70: 'var(--info-70)',
    60: 'var(--info-60)',
    50: 'var(--info-50)',
    40: 'var(--info-40)',
    30: 'var(--info-30)',
    20: 'var(--info-20)',
    10: 'var(--info-10)',
  },

  // UI Element Colors
  card: 'var(--card)',
  border: 'var(--border)',
  muted: {
    DEFAULT: 'var(--muted)',
    foreground: 'var(--muted-foreground)',
  },

  // Form Input Colors
  input: {
    DEFAULT: 'var(--input-bg)',
    bg: 'var(--input-bg)',
    border: 'var(--input-border)',
    text: 'var(--input-text)',
    placeholder: 'var(--input-placeholder)',
    focus: 'var(--input-focus)',
  },

  // Semantic Aliases
  destructive: {
    DEFAULT: 'var(--error)',
    foreground: '#ffffff',
  },
  ring: 'var(--primary)',
},
      // ================================
      // TYPOGRAPHY
      // ================================
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      // ================================
      // LAYOUT & SPACING
      // ================================
      spacing: {
        // Custom spacing based on CSS variables
        'nav': 'var(--nav-height)',
        'header': 'var(--header-height)',
        'sidebar': 'var(--sidebar-width)',

        // Extended spacing scale
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      height: {
        'nav': 'var(--nav-height)',
        'header': 'var(--header-height)',
        'screen-nav': 'calc(100vh - var(--nav-height))',
        'screen-header': 'calc(100vh - var(--header-height))',
      },

      width: {
        'sidebar': 'var(--sidebar-width)',
      },

      minHeight: {
        'screen': '100vh',
        'screen-nav': 'calc(100vh - var(--nav-height))',
      },

      maxWidth: {
        'container': 'var(--container-max-width)',
        '8xl': '88rem',
        '9xl': '96rem',
      },

      // ================================
      // BORDER & RADIUS
      // ================================
      borderRadius: {
        'xs': 'var(--radius-sm)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      borderWidth: {
        '3': '3px',
      },

      // ================================
      // SHADOWS & EFFECTS
      // ================================
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow': '0 0 20px rgb(16 185 129 / 0.3)',
        'glow-lg': '0 0 40px rgb(16 185 129 / 0.4)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },

      dropShadow: {
        'glow': '0 0 10px rgb(16 185 129 / 0.5)',
      },

      // ================================
      // ANIMATIONS & TRANSITIONS
      // ================================
      animation: {
        // Loading animations
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        // Custom animations
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'loading-bar': 'loadingBar 2s ease-in-out infinite',
        'loading-dots': 'loadingDots 1.4s infinite ease-in-out both',

        // UI animations
        'accordion-down': 'accordionDown 0.2s ease-out',
        'accordion-up': 'accordionUp 0.2s ease-out',
      },

      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0)' },
        },
        loadingBar: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        loadingDots: {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        accordionDown: {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        accordionUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },

      transitionDuration: {
        '50': '50ms',
        '150': '150ms', // Added for consistency with CSS variables
        '200': '200ms', // Added for consistency with CSS variables
        '250': '250ms',
        '300': '300ms', // Added for consistency with CSS variables
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },

      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },

      // ================================
      // GRID & FLEXBOX
      // ================================
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(0, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(0, 1fr))',
        'auto-fit-250': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
      },

      gap: {
        '18': '4.5rem',
      },

      // ================================
      // BACKGROUNDS & GRADIENTS
      // ================================
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        'gradient-accent': 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\" opacity=\"0.4\"/%3E%3C/svg%3E')",
      },

      backdropBlur: {
        '4xl': '72px',
      },

      // ================================
      // Z-INDEX SCALE
      // ================================
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // ================================
      // ASPECT RATIOS
      // ================================
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },

      // ================================
      // SCREENS (BREAKPOINTS)
      // ================================
      screens: {
        'xs': '475px',
        '3xl': '1680px',
        '4xl': '2560px',
      },
    },
  },

  // ================================
  // PLUGINS
  // ================================
  plugins: [
    // Form plugin for better form styling
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'var(--card)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--border)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'var(--muted)',
          },
        },

        // Glass morphism effects
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },

        '.glass-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },

        // Text selection
        '.select-none': {
          '-webkit-user-select': 'none',
          '-moz-user-select': 'none',
          '-ms-user-select': 'none',
          'user-select': 'none',
        },

        // Focus utilities
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 2px var(--primary)',
          },
        },

        // Gradient text
        '.text-gradient': {
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'color': 'transparent',
        },

        // Smooth scrolling
        '.scroll-smooth': {
          scrollBehavior: 'smooth',
        },

        // Safe area utilities for mobile
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },

        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },

        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },

        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
      });
    },

    // Component variants plugin
    function ({ addComponents, theme }) {
      addComponents({
        // Container component
        '.container': {
          maxWidth: theme('maxWidth.container'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),

          '@screen sm': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },

          '@screen lg': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
        },

        // Section spacing
        '.section': {
          paddingTop: theme('spacing.12'),
          paddingBottom: theme('spacing.12'),

          '@screen lg': {
            paddingTop: theme('spacing.16'),
            paddingBottom: theme('spacing.16'),
          },
        },

        // Typography components
        '.heading-1': {
          fontSize: theme('fontSize.4xl[0]'),
          lineHeight: theme('fontSize.4xl[1].lineHeight'),
          fontWeight: theme('fontWeight.bold'),
          letterSpacing: theme('letterSpacing.tight'),

          '@screen sm': {
            fontSize: theme('fontSize.5xl[0]'),
            lineHeight: theme('fontSize.5xl[1].lineHeight'),
          },

          '@screen lg': {
            fontSize: theme('fontSize.6xl[0]'),
            lineHeight: theme('fontSize.6xl[1].lineHeight'),
          },
        },

        '.heading-2': {
          fontSize: theme('fontSize.2xl[0]'),
          lineHeight: theme('fontSize.2xl[1].lineHeight'),
          fontWeight: theme('fontWeight.bold'),
          letterSpacing: theme('letterSpacing.tight'),

          '@screen sm': {
            fontSize: theme('fontSize.3xl[0]'),
            lineHeight: theme('fontSize.3xl[1].lineHeight'),
          },

          '@screen lg': {
            fontSize: theme('fontSize.4xl[0]'),
            lineHeight: theme('fontSize.4xl[1].lineHeight'),
          },
        },

        '.heading-3': {
          fontSize: theme('fontSize.xl[0]'),
          lineHeight: theme('fontSize.xl[1].lineHeight'),
          fontWeight: theme('fontWeight.semibold'),
          letterSpacing: theme('letterSpacing.tight'),

          '@screen sm': {
            fontSize: theme('fontSize.2xl[0]'),
            lineHeight: theme('fontSize.2xl[1].lineHeight'),
          },
        },

        '.body-large': {
          fontSize: theme('fontSize.lg[0]'),
          lineHeight: theme('fontSize.lg[1].lineHeight'),
        },

        '.body-small': {
          fontSize: theme('fontSize.sm[0]'),
          lineHeight: theme('fontSize.sm[1].lineHeight'),
        },

        '.caption': {
          fontSize: theme('fontSize.xs[0]'),
          lineHeight: theme('fontSize.xs[1].lineHeight'),
          color: 'var(--muted-foreground)',
        },
      });
    },
  ],

  // ================================
  // SAFELIST - Classes to always include
  // ================================
  safelist: [
    // Dynamic color classes that might be generated programmatically
    'text-primary',
    'text-secondary',
    'text-accent',
    'text-success',
    'text-warning',
    'text-error',
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-success',
    'bg-warning',
    'bg-error',
    'border-primary',
    'border-secondary',
    'border-accent',
    'hover:bg-primary/10',
    'hover:bg-secondary/10',
    'hover:bg-accent/10',

    // Grid columns that might be generated
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'grid-cols-6',
    'grid-cols-12',

    // Common responsive classes
    'sm:text-base',
    'md:text-lg',
    'lg:text-xl',
    'xl:text-2xl',

    // Animation classes
    'animate-pulse',
    'animate-spin',
    'animate-bounce',
    'animate-fade-in',
    'animate-fade-in-up',
  ],

  // ================================
  // FUTURE FLAGS
  // ================================
  future: {
    hoverOnlyWhenSupported: true,
  },

  // ================================
  // EXPERIMENTAL FEATURES
  // ================================
  experimental: {
    optimizeUniversalDefaults: true,
  },
};

export default config;