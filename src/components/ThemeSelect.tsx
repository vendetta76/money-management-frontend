import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { Palette, LightMode, DarkMode, Computer, Eco } from "@mui/icons-material";
import { useTheme as useCustomTheme, ThemeMode } from "../hooks/useThemeAdvanced";

const ThemeSelect = () => {
  const { theme, setThemeMode } = useCustomTheme();
  const muiTheme = useTheme();

  const themeOptions = [
    { value: "system", label: "Default", icon: <Computer />, emoji: "🖥️" },
    { value: "light", label: "Light", icon: <LightMode />, emoji: "🌞" },
    { value: "dark", label: "Dark", icon: <DarkMode />, emoji: "🌙" },
    { value: "original", label: "Original", icon: <Eco />, emoji: "🍃" },
    { value: "warm", label: "Warm (Eye-Friendly)", icon: <Palette />, emoji: "🌿" },
  ] as const;

  return (
    <Box 
      sx={{ 
        width: '100%', 
        px: 1,
      }}
    >
      <FormControl 
        fullWidth 
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            borderRadius: 2,
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
            '.dark &': {
              backgroundColor: '#374151',
              color: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4B5563',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00d97e',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00d97e',
              },
            },
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: muiTheme.shadows[2],
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 2px ${alpha('#00d97e', 0.2)}`,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6B7280',
            fontSize: '0.875rem',
            fontWeight: 500,
            '.dark &': {
              color: '#9CA3AF',
            },
            '&.Mui-focused': {
              color: '#00d97e',
            },
          },
          '& .MuiSelect-icon': {
            '.dark &': {
              color: '#9CA3AF',
            },
          },
        }}
      >
        <InputLabel 
          id="theme-select-label"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          🎨 Theme
        </InputLabel>
        
        <Select
          labelId="theme-select-label"
          id="theme-select"
          value={theme}
          label="🎨 Theme"
          onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: '#ffffff',
                borderRadius: 2,
                boxShadow: muiTheme.shadows[8],
                '.dark &': {
                  backgroundColor: '#374151',
                  color: '#ffffff',
                },
                '& .MuiMenuItem-root': {
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  '.dark &': {
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#4B5563',
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha('#00d97e', 0.2),
                      '&:hover': {
                        backgroundColor: alpha('#00d97e', 0.3),
                      },
                    },
                  },
                  '&:hover': {
                    backgroundColor: alpha('#00d97e', 0.1),
                  },
                  '&.Mui-selected': {
                    backgroundColor: alpha('#00d97e', 0.2),
                    '&:hover': {
                      backgroundColor: alpha('#00d97e', 0.3),
                    },
                  },
                },
              },
            },
          }}
        >
          {themeOptions.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.1rem',
                }}
              >
                {option.emoji}
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: theme === option.value ? 600 : 400,
                  flex: 1,
                }}
              >
                {option.label}
              </Typography>
              {theme === option.value && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#00d97e',
                    boxShadow: `0 0 8px ${alpha('#00d97e', 0.5)}`,
                  }}
                />
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ThemeSelect;