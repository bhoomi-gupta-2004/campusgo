import { Platform } from 'react-native';

// 1. Define your Brand Palette
const BRAND = {
  primary: '#4a90e2',    // Professional Bus Blue
  secondary: '#C4964B',  // Earthy Tan (Bhoomi Udhyog vibe)
  accent: '#D74E49',     // Alert Red
  success: '#20bf6b',
  warning: '#f7b731',
  surfaceLight: '#F9FAFD',
  surfaceDark: '#121212',
};

const tintColorLight = BRAND.primary;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: BRAND.surfaceLight,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Custom Additions
    card: '#FFFFFF',
    border: '#E1E4E8',
    brand: BRAND,
  },
  dark: {
    text: '#ECEDEE',
    background: BRAND.surfaceDark,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Custom Additions
    card: '#1E1E1E',
    border: '#333333',
    brand: BRAND,
  },
};

// 2. Optimized Global Layout Constants
export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 20,
  full: 999,
};

// 3. Keep your existing Font Logic
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});