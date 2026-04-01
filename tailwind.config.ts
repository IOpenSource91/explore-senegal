import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ── Sahelian Horizon Design System ── */
      colors: {
        // Primary — Terracotta (defaults, overridden by CSS vars)
        primary: {
          DEFAULT: 'var(--theme-primary, #9c3d00)',
          container: 'var(--theme-primary-container, #c2500a)',
          fixed: 'var(--theme-primary-fixed, #ffdbcc)',
          'fixed-dim': '#ffb695',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#fff9f8',
          fixed: '#351000',
          'fixed-variant': '#7c2e00',
        },
        // Secondary — Golden Hour
        secondary: {
          DEFAULT: 'var(--theme-secondary, #815500)',
          container: 'var(--theme-secondary-container, #feb234)',
          fixed: '#ffddb2',
          'fixed-dim': '#ffb94c',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          fixed: '#291800',
          'fixed-variant': '#624000',
        },
        // Tertiary — Atlantic Teal
        tertiary: {
          DEFAULT: 'var(--theme-tertiary, #0c6475)',
          container: 'var(--theme-tertiary-container, #abedff)',
          fixed: '#abedff',
          'fixed-dim': '#8bd1e4',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          'fixed-variant': '#004e5c',
        },
        // Surfaces
        surface: {
          DEFAULT: 'var(--theme-surface, #fff8f1)',
          dim: '#dfd9d1',
          variant: '#e8e1da',
          tint: '#a23f00',
          'container-lowest': 'var(--theme-surface-container-lowest, #ffffff)',
          'container-low': 'var(--theme-surface-container-low, #f9f3eb)',
          container: 'var(--theme-surface-container, #f3ede5)',
          'container-high': 'var(--theme-surface-container-high, #eee7df)',
          'container-highest': '#e8e1da',
        },
        'on-surface': {
          DEFAULT: 'var(--theme-on-surface, #1e1b17)',
          variant: 'var(--theme-on-surface-variant, #584239)',
        },
        // Outline
        outline: {
          DEFAULT: '#897267',
          variant: 'var(--theme-outline-variant, #dfc0b3)',
        },
        // Error
        error: {
          DEFAULT: 'var(--theme-error, #ba1a1a)',
          container: 'var(--theme-error-container, #ffdad6)',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        // Inverse
        'inverse-surface': '#33302b',
        'inverse-primary': '#ffb695',
        // Background
        background: 'var(--theme-surface, #fff8f1)',
        'on-background': 'var(--theme-on-surface, #1e1b17)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'headline-lg': ['2rem', { lineHeight: '1.25' }],
        'headline-md': ['1.75rem', { lineHeight: '1.3' }],
        'body-lg': ['1rem', { lineHeight: '1.6' }],
        'body-md': ['0.875rem', { lineHeight: '1.6' }],
        'label-md': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      borderRadius: {
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        ambient: '0 20px 40px color-mix(in srgb, var(--theme-primary, #9c3d00) 8%, transparent)',
        'ambient-lg': '0 30px 60px color-mix(in srgb, var(--theme-primary, #9c3d00) 12%, transparent)',
      },
    },
  },
  plugins: [],
};

export default config;
