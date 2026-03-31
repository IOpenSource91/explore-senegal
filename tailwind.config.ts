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
        // Primary — Terracotta
        primary: {
          DEFAULT: '#9c3d00',
          container: '#c2500a',
          fixed: '#ffdbcc',
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
          DEFAULT: '#815500',
          container: '#feb234',
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
          DEFAULT: '#0c6475',
          container: '#abedff',
          fixed: '#abedff',
          'fixed-dim': '#8bd1e4',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          'fixed-variant': '#004e5c',
        },
        // Surfaces
        surface: {
          DEFAULT: '#fff8f1',
          dim: '#dfd9d1',
          variant: '#e8e1da',
          tint: '#a23f00',
          'container-lowest': '#ffffff',
          'container-low': '#f9f3eb',
          container: '#f3ede5',
          'container-high': '#eee7df',
          'container-highest': '#e8e1da',
        },
        'on-surface': {
          DEFAULT: '#1e1b17',
          variant: '#584239',
        },
        // Outline
        outline: {
          DEFAULT: '#897267',
          variant: '#dfc0b3',
        },
        // Error
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        // Inverse
        'inverse-surface': '#33302b',
        'inverse-primary': '#ffb695',
        // Background
        background: '#fff8f1',
        'on-background': '#1e1b17',
      },
      fontFamily: {
        heading: ['Epilogue', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
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
        ambient: '0 20px 40px rgba(156, 61, 0, 0.08)',
        'ambient-lg': '0 30px 60px rgba(156, 61, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
