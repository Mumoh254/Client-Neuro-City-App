import { StrictMode, Suspense } from 'react';  // 👈 Added Suspense
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './Context/authContext.jsx';
import { HashRouter } from 'react-router-dom';
import ScrollToTop from './components/handler/gotToTop.jsx';
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#10b981',
    danger: '#ef4444',
    text: '#1f2937',
    background: '#f8fafc',
  },
  fonts: {
    main: "'Poppins', sans-serif",
  },
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ScrollToTop />
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <Suspense fallback={<div>Loading...</div>}> {/* 👈 Added Suspense here */}
            <App />
          </Suspense>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
