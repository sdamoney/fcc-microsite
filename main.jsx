import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Path now points to App.jsx in the same root directory
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
