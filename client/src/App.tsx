import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './routes/AppRoutes';

function App() {
  useEffect(() => {
    document.title = 'PharmaSync - Pharmaceutical Care App';
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
