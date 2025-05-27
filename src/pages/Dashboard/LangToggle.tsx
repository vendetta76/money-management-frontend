import React, { useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  variant?: 'select' | 'buttons' | 'menu' | 'chip';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showFlags?: boolean;
  compact?: boolean;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

const LANGUAGES: LanguageOption[] = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    flag: '🇺🇸', 
    region: 'United States' 
  },
  { 
    code: 'id', 
    name: 'Indonesian', 
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩', 
    region: 'Indonesia' 
  },
  { 
    code: 'es', 
    name: 'Spanish', 
    nativeName: 'Español',
    flag: '🇪🇸', 
    region: 'Spain' 
  },
  { 
    code: 'zh', 
    name: 'Chinese', 
    nativeName: '中文',
    flag: '🇨🇳', 
    region: 'China' 
  },
  { 
    code: 'ja', 
    name: 'Japanese', 
    nativeName: '日本語',
    flag: '🇯🇵', 
    region: 'Japan' 
  },
  { 
    code: 'ko', 
    name: 'Korean', 
    nativeName: '한국어',
    flag: '🇰🇷', 
    region: 'South Korea' 
  }
];

const LangToggle: React.FC<Props> = ({ 
  variant = 'select',
  size = 'small',
  showLabel = false,
  showFlags = true,
  compact = false
}) => {
  const theme = useTheme();
  const { language, setLanguage } = useLanguage();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const currentLanguage = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Select Variant (Enhanced original functionality)
  const SelectVariant = () => (
    <FormControl size={size} sx={{ minWidth: compact ? 80 : 120 }}>
      {showLabel && <InputLabel id="language-select-label">Language</InputLabel>}
      <Select
        labelId="language-select-label"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        label={showLabel ? "Language" : undefined}
        startAdornment={showFlags && !compact ? (
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2em' }}>{currentLanguage.flag}</span>
          </Box>
        ) : undefined}
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box display="flex" alignItems="center" gap={1} width="100%">
              {showFlags && (
                <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>
              )}
              <Box>
                <Typography variant="body2">
                  {compact ? lang.code.toUpperCase() : lang.name}
                </Typography>
                {!compact && (
                  <Typography variant="caption" color="text.secondary">
                    {lang.nativeName}
                  </Typography>
                )}
              </Box>
              {language === lang.code && (
                <CheckIcon 
                  fontSize="small" 
                  color="primary" 
                  sx={{ ml: 'auto' }}
                />
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // Button Group Variant
  const ButtonsVariant = () => (
    <ButtonGroup size={size} variant="outlined">
      {LANGUAGES.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? 'contained' : 'outlined'}
          onClick={() => handleLanguageChange(lang.code)}
          startIcon={showFlags ? <span style={{ fontSize: '1em' }}>{lang.flag}</span> : undefined}
          sx={{
            minWidth: compact ? 40 : 80,
            ...(language === lang.code && {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              }
            })
          }}
        >
          {compact ? lang.code.toUpperCase() : lang.name}
        </Button>
      ))}
    </ButtonGroup>
  );

  // Menu Variant (Dropdown style)
  const MenuVariant = () => (
    <>
      <Tooltip title={`Current: ${currentLanguage.nativeName}`}>
        <Button
          variant="outlined"
          size={size}
          startIcon={showFlags ? <span style={{ fontSize: '1.2em' }}>{currentLanguage.flag}</span> : <LanguageIcon />}
          endIcon={<ExpandMoreIcon />}
          onClick={handleMenuOpen}
          sx={{
            textTransform: 'none',
            minWidth: compact ? 60 : 140,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderColor: alpha(theme.palette.primary.main, 0.2),
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          {compact ? currentLanguage.code.toUpperCase() : currentLanguage.name}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
          },
        }}
      >
        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight="bold" color="primary">
            🌐 Select Language
          </Typography>
        </Box>

        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={language === lang.code}
            sx={{
              ...(language === lang.code && {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              })
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                {showFlags ? lang.flag : lang.code.toUpperCase()}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={lang.name}
              secondary={
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {lang.nativeName}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {lang.region}
                  </Typography>
                </Box>
              }
            />
            {language === lang.code && (
              <CheckIcon fontSize="small" color="primary" />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  // Chip Variant (Compact and modern)
  const ChipVariant = () => (
    <Chip
      icon={showFlags ? <span style={{ fontSize: '1em' }}>{currentLanguage.flag}</span> : <PublicIcon />}
      label={compact ? currentLanguage.code.toUpperCase() : currentLanguage.name}
      onClick={handleMenuOpen}
      variant="outlined"
      size={size}
      sx={{
        cursor: 'pointer',
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        borderColor: alpha(theme.palette.primary.main, 0.2),
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        },
        '& .MuiChip-label': {
          fontWeight: 'medium'
        }
      }}
    />
  );

  // Render based on variant
  switch (variant) {
    case 'buttons':
      return <ButtonsVariant />;
    case 'menu':
      return <MenuVariant />;
    case 'chip':
      return (
        <>
          <ChipVariant />
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                selected={language === lang.code}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {showFlags && <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>}
                  <Typography variant="body2">{lang.name}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </>
      );
    default:
      return <SelectVariant />;
  }
};

export default LangToggle;