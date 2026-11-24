import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/**
 * THE LOOK AND FEEL OF THE WHOLE SITE
 *
 * Colours, fonts, rounded corners and default component styles all live here.
 * When the creative team's designs arrive, start by changing the values below:
 * every page uses this theme, so most of the site follows without touching page code.
 *
 * Guide to the options: https://mui.com/material-ui/customization/theming/
 */
const baseTheme = createTheme({
  palette: {
    primary: { main: '#1e3a5f' }, // brand colour: store name, main buttons, links
    secondary: { main: '#c2410c' }, // accent colour, for highlights
    background: {
      default: '#f6f7f9', // page background
      paper: '#ffffff', // background of cards, the header and forms
    },
  },

  // How rounded corners are on cards, buttons and inputs (in pixels)
  shape: { borderRadius: 8 },

  typography: {
    // The device's own system font: looks native and needs no download
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
  },

  components: {
    // Buttons: normal sentence case instead of ALL CAPITALS, and flat (no shadow)
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
    // Cards: a thin outline instead of a drop shadow
    MuiCard: {
      defaultProps: { variant: 'outlined' },
    },
  },
});

// Makes headings a little smaller on small screens
export const theme = responsiveFontSizes(baseTheme);
