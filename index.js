import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This uses the modern createRoot API for React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
