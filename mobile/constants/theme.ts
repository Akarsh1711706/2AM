export const getTheme = () => {
  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour < 6;
  const isLateNight = hour >= 0 && hour < 4;

  const baseBackground = isLateNight ? '#0A0A0F' : isNight ? '#0F0F1A' : '#12121E';
  const cardBackground = isLateNight ? '#111118' : isNight ? '#161625' : '#1A1A2E';
  const surfaceBackground = isLateNight ? '#16161F' : isNight ? '#1C1C2E' : '#20203A';

  return {
    isNight,
    isLateNight,
    colors: {
      background: baseBackground,
      card: cardBackground,
      surface: surfaceBackground,
      primary: '#6C63FF',
      primaryLight: '#8B83FF',
      accent: '#FF6B9D',
      text: '#F0F0FF',
      textSecondary: '#9090B0',
      textMuted: '#60607A',
      border: '#2A2A40',
      success: '#50C878',
      warning: '#FFB347',
      error: '#FF6B6B',
      white: '#FFFFFF',
    },
    typography: {
      fontSizeXS: 11,
      fontSizeSM: 13,
      fontSizeMD: 16,
      fontSizeLG: 20,
      fontSizeXL: 26,
      fontSizeXXL: 34,
      fontWeightRegular: '400' as const,
      fontWeightMedium: '500' as const,
      fontWeightSemiBold: '600' as const,
      fontWeightBold: '700' as const,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 20,
      xl: 32,
      full: 999,
    },
  };
};

export type Theme = ReturnType<typeof getTheme>;
