import React, { useContext } from 'react';
import {
  Paper,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { ThemeContext } from '../ThemeContext';

function Header() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const theme = useTheme();

  return (
    <Paper
      component="header"
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        mb: 4,
        position: 'relative',
      }}
    >
      <IconButton
        onClick={toggleTheme}
        aria-label="Toggle theme"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'white',
        }}
      >
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        To Do App
      </Typography>
      <Typography variant="h6" sx={{ opacity: 0.9 }}>
        Keep track of your tasks
      </Typography>
    </Paper>
  );
}

export default Header;
