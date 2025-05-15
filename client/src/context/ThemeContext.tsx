import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create a default context value to avoid the "null (reading 'useState')" error
const defaultContextValue: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Use a try-catch block to handle potential localStorage errors
  const getInitialTheme = (): Theme => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme === 'dark' ? 'dark' : 'light';
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return 'light';
    }
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);

      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error setting theme in localStorage:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context;
};
