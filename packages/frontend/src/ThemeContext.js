import { createContext } from 'react';

// Create Theme Context
export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});
