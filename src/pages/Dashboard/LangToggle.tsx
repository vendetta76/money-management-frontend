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
  useMediaQuery,
  alpha,
  Paper,
  Stack
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  // Auto-adapt variant for mobile
  const effectiveVariant = isMobile && variant === 'buttons' ? 'chip' : variant;
  const effectiveCompact = isMobile || compact;
  const effectiveSize = isSmallMobile && size === 'medium' ? 'small' : size;

  // Mobile-optimized Select Variant
  const SelectVariant = () => (
    <FormControl size={effectiveSize} sx={{ minWidth: effectiveCompact ? 60 : 100 }}>
      {showLabel && !effectiveCompact && (
        <InputLabel id="language-select-label">Language</InputLabel>
      )}
      <Select
        labelId="language-select-label"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        label={showLabel && !effectiveCompact ? "Language" : undefined}
        startAdornment={showFlags && !effectiveCompact ? (
          <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: isSmallMobile ? '1em' : '1.2em' }}>{currentLanguage.flag}</span>
          </Box>
        ) : undefined}
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            py: effectiveCompact ? 0.5 : undefined
          }
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box display="flex" alignItems="center" gap={1} width="100%">
              {showFlags && (
                <span style={{ fontSize: '1.1em' }}>{lang.flag}</span>
              )}
              <Box flex={1}>
                <Typography variant={isSmallMobile ? "caption" : "body2"}>
                  {effectiveCompact ? lang.code.toUpperCase() : lang.name}
                </Typography>
                {!effectiveCompact && !isSmallMobile && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {lang.nativeName}
                  </Typography>
                )}
              </Box>
              {language === lang.code && (
                <CheckIcon 
                  fontSize="small" 
                  color="primary" 
                />
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // Mobile-friendly Button Group Variant
  const ButtonsVariant = () => {
    // On mobile, show only first 3 languages as buttons, rest in overflow menu
    const visibleLanguages = isMobile ? LANGUAGES.slice(0, 3) : LANGUAGES;
    const overflowLanguages = isMobile ? LANGUAGES.slice(3) : [];

    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        <ButtonGroup size={effectiveSize} variant="outlined">
          {visibleLanguages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? 'contained' : 'outlined'}
              onClick={() => handleLanguageChange(lang.code)}
              startIcon={showFlags ? <span style={{ fontSize: '0.9em' }}>{lang.flag}</span> : undefined}
              sx={{
                minWidth: effectiveCompact ? 32 : 60,
                px: effectiveCompact ? 0.5 : 1,
                ...(language === lang.code && {
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  }
                })
              }}
            >
              {effectiveCompact ? lang.code.toUpperCase() : (isSmallMobile ? lang.code : lang.name)}
            </Button>
          ))}
        </ButtonGroup>

        {/* Overflow menu for mobile */}
        {overflowLanguages.length > 0 && (
          <>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
            
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
            >
              {overflowLanguages.map((lang) => (
                <MenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  selected={language === lang.code}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {showFlags && <span>{lang.flag}</span>}
                    <Typography variant="body2">{lang.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Box>
    );
  };

  // Enhanced Menu Variant (mobile-optimized)
  const MenuVariant = () => (
    <>
      <Tooltip title={`Current: ${currentLanguage.nativeName}`}>
        <Button
          variant="outlined"
          size={effectiveSize}
          startIcon={showFlags ? (
            <span style={{ fontSize: '1.1em' }}>{currentLanguage.flag}</span>
          ) : (
            <LanguageIcon />
          )}
          endIcon={!effectiveCompact && <ExpandMoreIcon />}
          onClick={handleMenuOpen}
          sx={{
            textTransform: 'none',
            minWidth: effectiveCompact ? 40 : 120,
            px: effectiveCompact ? 1 : 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderColor: alpha(theme.palette.primary.main, 0.2),
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          {effectiveCompact ? (
            currentLanguage.code.toUpperCase()
          ) : (
            isSmallMobile ? currentLanguage.code : currentLanguage.name
          )}
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
            minWidth: isMobile ? 180 : 200,
            maxWidth: isMobile ? '90vw' : 280,
            '& .MuiMenuItem-root': {
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1, sm: 1.5 },
            },
          },
        }}
      >
        {!isMobile && (
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight="bold" color="primary">
              🌐 Select Language
            </Typography>
          </Box>
        )}

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
            <ListItemIcon sx={{ minWidth: { xs: 32, sm: 40 } }}>
              <Avatar sx={{ width: { xs: 20, sm: 24 }, height: { xs: 20, sm: 24 }, fontSize: '0.7rem' }}>
                {showFlags ? lang.flag : lang.code.toUpperCase()}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={lang.name}
              secondary={
                !isSmallMobile && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {lang.nativeName}
                    </Typography>
                    {!effectiveCompact && (
                      <>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {lang.region}
                        </Typography>
                      </>
                    )}
                  </Box>
                )
              }
              primaryTypographyProps={{
                fontSize: isSmallMobile ? '0.85rem' : '0.875rem'
              }}
            />
            {language === lang.code && (
              <CheckIcon fontSize="small" color="primary" />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  // Mobile-optimized Chip Variant
  const ChipVariant = () => (
    <>
      <Chip
        icon={showFlags ? (
          <span style={{ fontSize: '0.9em' }}>{currentLanguage.flag}</span>
        ) : (
          <PublicIcon />
        )}
        label={effectiveCompact ? currentLanguage.code.toUpperCase() : (
          isSmallMobile ? currentLanguage.code : currentLanguage.name
        )}
        onClick={handleMenuOpen}
        variant="outlined"
        size={effectiveSize}
        sx={{
          cursor: 'pointer',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderColor: alpha(theme.palette.primary.main, 0.2),
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          },
          '& .MuiChip-label': {
            fontWeight: 'medium',
            px: effectiveCompact ? 1 : 1.5
          },
          '& .MuiChip-icon': {
            fontSize: effectiveCompact ? '0.8rem' : '1rem'
          }
        }}
      />
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: isMobile ? 150 : 180,
            maxWidth: isMobile ? '80vw' : 200,
          }
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={language === lang.code}
            sx={{
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1, sm: 1.2 }
            }}
          >
            <Box display="flex" alignItems="center" gap={1} width="100%">
              {showFlags && (
                <span style={{ fontSize: '1.1em' }}>{lang.flag}</span>
              )}
              <Box flex={1}>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {lang.name}
                </Typography>
                {!isSmallMobile && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {lang.nativeName}
                  </Typography>
                )}
              </Box>
              {language === lang.code && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  // Render based on effective variant
  switch (effectiveVariant) {
    case 'buttons':
      return <ButtonsVariant />;
    case 'menu':
      return <MenuVariant />;
    case 'chip':
      return <ChipVariant />;
    default:
      return <SelectVariant />;
  }
};

export default LangToggle;