import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SCREEN = { WIDTH: SCREEN_WIDTH, HEIGHT: SCREEN_HEIGHT };

// Premium Medical Color Palette
export const COLORS = {
  // Primary - Soft Medical Green
  primary: '#00B386',
  primaryDark: '#009973',
  primaryLight: '#E8F7F3',
  primaryMuted: '#B8E6DC',

  // Accent - Soft Medical Blue
  accent: '#4A90E2',
  accentLight: '#EBF4FC',
  accentDark: '#3A7BC8',

  // Neutrals - Clean Medical Whites & Grays
  white: '#FFFFFF',
  background: '#F8FAFB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E5E9ED',
  borderLight: '#F0F3F5',

  // Text - Professional Hierarchy
  textPrimary: '#1A2332',
  textSecondary: '#5B6B7C',
  textTertiary: '#8B98A8',
  textDisabled: '#C4CDD5',

  // Health Score Colors
  scoreExcellent: '#00B386',
  scoreGood: '#52C41A',
  scoreOkay: '#FAAD14',
  scoreBad: '#FF7A45',
  scoreAvoid: '#E74C3C',

  // Status Colors
  success: '#00B386',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#4A90E2',

  // Surface variants
  surfaceAlt: '#F0F4F7',

  // Overlays
  overlay: 'rgba(26, 35, 50, 0.6)',
  overlayLight: 'rgba(26, 35, 50, 0.3)',
};

// Typography System
export const TYPOGRAPHY = {
  // Font Families
  fontRegular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  fontMedium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  fontBold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),

  // Font Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 34,
  display: 42,

  // Line Heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.7,

  // Letter Spacing
  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 0.5,
};

// Spacing System (8pt grid)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
};

// Border Radius
export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 999,
};

// Shadows - Subtle & Professional
export const SHADOWS = {
  none: {},
  xs: {
    shadowColor: '#1A2332',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#1A2332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A2332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  }),
};

// Health Score Utilities
export const getScoreColor = (score) => {
  if (score >= 80) return COLORS.scoreExcellent;
  if (score >= 60) return COLORS.scoreGood;
  if (score >= 40) return COLORS.scoreOkay;
  if (score >= 20) return COLORS.scoreBad;
  return COLORS.scoreAvoid;
};

export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Okay';
  if (score >= 20) return 'Poor';
  return 'Avoid';
};

export const getScoreBadgeColor = (score) => {
  const color = getScoreColor(score);
  return {
    bg: color + '15',
    text: color,
    border: color + '30',
  };
};
