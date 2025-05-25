import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';

interface MuiThemeProviderProps {
  children: React.ReactNode;
}

const MuiThemeProvider = ({ children }: MuiThemeProviderProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      setIsDark(htmlElement.classList.contains('dark'));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const theme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#00d97e',
        light: '#4ade80',
        dark: '#16a34a',
      },
      secondary: {
        main: '#00c2ff',
        light: '#38bdf8',
        dark: '#0284c7',
      },
      background: {
        default: isDark ? '#111827' : '#ffffff',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#374151',
        secondary: isDark ? '#9CA3AF' : '#6B7280',
      },
      divider: isDark ? '#374151' : '#e5e7eb',
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#111827' : '#ffffff',
            color: isDark ? '#ffffff' : '#374151',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MuiThemeProvider;