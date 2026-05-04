import { alpha, createTheme } from '@mui/material/styles';

const tokens = {
  bg: '#020202',
  surface: 'rgba(17, 16, 12, 0.78)',
  primary: '#D7FF3F',
  secondary: '#FFB020',
  success: '#65FFB4',
  warning: '#F0D061',
  danger: '#FF4D4D',
  text: '#F5F1E6',
  muted: '#AFA99B',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: tokens.primary },
    secondary: { main: tokens.secondary },
    success: { main: tokens.success },
    warning: { main: tokens.warning },
    error: { main: tokens.danger },
    background: { default: tokens.bg, paper: tokens.surface },
    text: { primary: tokens.text, secondary: tokens.muted },
    divider: 'rgba(255,255,255,0.08)',
  },
  shape: { borderRadius: 22 },
  typography: {
    fontFamily: ['Satoshi', 'Inter', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'].join(','),
    h1: { fontWeight: 950, letterSpacing: '-0.06em' },
    h2: { fontWeight: 950, letterSpacing: '-0.055em' },
    h3: { fontWeight: 950, letterSpacing: '-0.05em' },
    h4: { fontWeight: 900, letterSpacing: '-0.04em' },
    h5: { fontWeight: 850, letterSpacing: '-0.03em' },
    h6: { fontWeight: 850, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 850 },
    overline: { letterSpacing: '0.15em', fontWeight: 900, fontSize: 11 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        html: { minHeight: '100%', background: tokens.bg },
        body: {
          minHeight: '100vh',
          margin: 0,
          background: tokens.bg,
          color: tokens.text,
          fontFeatureSettings: '"ss01" on, "cv01" on',
        },
        '#root': { minHeight: '100vh' },
        '::selection': { background: alpha(tokens.primary, 0.45) },
        '::-webkit-scrollbar': { width: 10, height: 10 },
        '::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.18)', borderRadius: 999 },
        '::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.04)' },
        '@keyframes floaty': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        '@keyframes pulseOrb': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.92 },
          '50%': { transform: 'scale(1.045)', opacity: 1 },
        },
        '@keyframes spinSlow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        '@keyframes glowBorder': {
          '0%, 100%': { boxShadow: '0 0 0 rgba(255,176,32,0)' },
          '50%': { boxShadow: '0 0 38px rgba(255,176,32,0.28)' },
        },
        '@keyframes scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(22px)',
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 28px 90px rgba(0,0,0,0.44)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, rgba(18,17,12,0.88), rgba(8,8,6,0.76))',
          border: '1px solid rgba(255,255,255,0.10)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 18, minHeight: 42 },
        sizeLarge: { minHeight: 50, paddingInline: 24 },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${tokens.primary}, ${tokens.secondary})`,
          color: '#070804',
          boxShadow: `0 16px 40px ${alpha(tokens.primary, 0.34)}`,
          '&:hover': { boxShadow: `0 20px 54px ${alpha(tokens.secondary, 0.25)}` },
        },
        containedSuccess: {
          color: '#06110B',
          backgroundImage: `linear-gradient(135deg, ${tokens.success}, ${tokens.secondary})`,
          boxShadow: `0 16px 36px ${alpha(tokens.success, 0.25)}`,
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.16)',
          background: alpha('#ffffff', 0.035),
          '&:hover': { borderColor: alpha(tokens.secondary, 0.55), background: alpha('#ffffff', 0.06) },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: alpha('#ffffff', 0.07),
          border: '1px solid rgba(255,255,255,0.09)',
          fontWeight: 800,
          backdropFilter: 'blur(14px)',
        },
      },
    },

    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        root: {
          color: tokens.muted,
          maxWidth: 'calc(100% - 24px)',
          '&.MuiInputLabel-shrink': {
            background: 'linear-gradient(90deg, rgba(2,2,2,0.96), rgba(18,17,12,0.96))',
            borderRadius: 8,
            padding: '0 6px',
            marginLeft: -4,
            transform: 'translate(18px, -9px) scale(0.78)',
          },
          '&.Mui-focused': { color: tokens.secondary },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.045)',
            borderRadius: 18,
            '& fieldset': { borderColor: 'rgba(255,255,255,0.10)' },
            '&:hover fieldset': { borderColor: 'rgba(255,176,32,0.40)' },
            '&.Mui-focused fieldset': { borderColor: tokens.secondary },
            '& input:-webkit-autofill, & textarea:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 100px rgba(18,17,12,0.98) inset',
              WebkitTextFillColor: tokens.text,
              caretColor: tokens.text,
              borderRadius: 18,
            },
          },
          '& .MuiInputBase-input': {
            color: tokens.text,
            '&::placeholder': { color: alpha(tokens.muted, 0.76), opacity: 1 },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { borderRadius: 18 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(255,255,255,0.08)' },
        bar: { backgroundImage: `linear-gradient(90deg, ${tokens.primary}, ${tokens.secondary}, ${tokens.success})` },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: 99, backgroundImage: `linear-gradient(90deg, ${tokens.primary}, ${tokens.secondary})` },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: tokens.secondary },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: tokens.secondary },
        },
        track: { backgroundColor: 'rgba(255,255,255,0.25)' },
      },
    },
  },
});

export default theme;
