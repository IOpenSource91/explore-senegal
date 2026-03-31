export interface ThemeColors {
  primary: string;
  primaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  tertiary: string;
  tertiaryContainer: string;
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  primaryFixed: string;
  error: string;
  errorContainer: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  colors: ThemeColors;
}

export const themePresets: ThemePreset[] = [
  {
    id: 'terracotta',
    name: 'Terracotta',
    colors: {
      primary: '#9c3d00',
      primaryContainer: '#c2500a',
      secondary: '#815500',
      secondaryContainer: '#feb234',
      tertiary: '#0c6475',
      tertiaryContainer: '#abedff',
      surface: '#fff8f1',
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#f9f3eb',
      surfaceContainer: '#f3ede5',
      surfaceContainerHigh: '#eee7df',
      onSurface: '#1e1b17',
      onSurfaceVariant: '#584239',
      outlineVariant: '#dfc0b3',
      primaryFixed: '#ffdbcc',
      error: '#ba1a1a',
      errorContainer: '#ffdad6',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#1a5276',
      primaryContainer: '#2471a3',
      secondary: '#1e8449',
      secondaryContainer: '#82e0aa',
      tertiary: '#d4ac0d',
      tertiaryContainer: '#f9e79f',
      surface: '#f0f8ff',
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#e8f4fd',
      surfaceContainer: '#dceefb',
      surfaceContainerHigh: '#d0e8f8',
      onSurface: '#0d1b2a',
      onSurfaceVariant: '#34495e',
      outlineVariant: '#aed6f1',
      primaryFixed: '#d6eaf8',
      error: '#ba1a1a',
      errorContainer: '#ffdad6',
    },
  },
  {
    id: 'savane',
    name: 'Savane',
    colors: {
      primary: '#8B7355',
      primaryContainer: '#a68b6b',
      secondary: '#CD853F',
      secondaryContainer: '#f5d5a8',
      tertiary: '#556B2F',
      tertiaryContainer: '#c5e1a5',
      surface: '#faf5ef',
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#f5efe7',
      surfaceContainer: '#efe8df',
      surfaceContainerHigh: '#e9e2d8',
      onSurface: '#2c2416',
      onSurfaceVariant: '#5d4e37',
      outlineVariant: '#d4c4a8',
      primaryFixed: '#eedcca',
      error: '#ba1a1a',
      errorContainer: '#ffdad6',
    },
  },
  {
    id: 'foret',
    name: 'Foret',
    colors: {
      primary: '#2d5016',
      primaryContainer: '#4a7c2e',
      secondary: '#6b4226',
      secondaryContainer: '#d4a37a',
      tertiary: '#1a6b5a',
      tertiaryContainer: '#a8e6cf',
      surface: '#f2f8f0',
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#eaf4e7',
      surfaceContainer: '#e2efde',
      surfaceContainerHigh: '#dae9d5',
      onSurface: '#1a2e10',
      onSurfaceVariant: '#3e5534',
      outlineVariant: '#b8d4a8',
      primaryFixed: '#d4edcc',
      error: '#ba1a1a',
      errorContainer: '#ffdad6',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#c0392b',
      primaryContainer: '#e74c3c',
      secondary: '#e67e22',
      secondaryContainer: '#fad7a0',
      tertiary: '#8e44ad',
      tertiaryContainer: '#d7bde2',
      surface: '#fdf6f0',
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#fdf0e8',
      surfaceContainer: '#fbe9de',
      surfaceContainerHigh: '#f8e2d4',
      onSurface: '#2c1810',
      onSurfaceVariant: '#5d3a2e',
      outlineVariant: '#e6c4b8',
      primaryFixed: '#fadbd8',
      error: '#ba1a1a',
      errorContainer: '#ffdad6',
    },
  },
];

export function getThemeById(id: string): ThemePreset {
  return themePresets.find((t) => t.id === id) ?? themePresets[0];
}

/** Map a ThemePreset's colors to CSS custom property assignments */
export function themeToCSSVars(theme: ThemePreset): Record<string, string> {
  const c = theme.colors;
  return {
    '--theme-primary': c.primary,
    '--theme-primary-container': c.primaryContainer,
    '--theme-secondary': c.secondary,
    '--theme-secondary-container': c.secondaryContainer,
    '--theme-tertiary': c.tertiary,
    '--theme-tertiary-container': c.tertiaryContainer,
    '--theme-surface': c.surface,
    '--theme-surface-container-lowest': c.surfaceContainerLowest,
    '--theme-surface-container-low': c.surfaceContainerLow,
    '--theme-surface-container': c.surfaceContainer,
    '--theme-surface-container-high': c.surfaceContainerHigh,
    '--theme-on-surface': c.onSurface,
    '--theme-on-surface-variant': c.onSurfaceVariant,
    '--theme-outline-variant': c.outlineVariant,
    '--theme-primary-fixed': c.primaryFixed,
    '--theme-error': c.error,
    '--theme-error-container': c.errorContainer,
  };
}
