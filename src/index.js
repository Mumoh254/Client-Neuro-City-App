import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Register the service worker for PWA
if (process.env.NODE_ENV === 'production') {
  const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      console.log('Service Worker registered:', registration);
    })
    .catch(error => {
      console.log('Service Worker registration failed:', error);
    });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
