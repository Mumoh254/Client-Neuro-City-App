import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './Context/authContext.jsx';
import { HashRouter } from 'react-router-dom';
import  ScrollToTop   from "./components/handler/gotToTop.jsx"
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ScrollToTop />
      <AuthProvider>

        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);