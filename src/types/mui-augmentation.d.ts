import '@mui/material/Grid';
import '@mui/material/Typography';

declare module '@mui/material/Grid' {
  interface GridBaseProps {
    alignItems?: string;
    justifyContent?: string;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyOwnProps {
    textAlign?: string;
  }
}
