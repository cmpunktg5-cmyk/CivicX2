import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            borderRadius: '500px',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 20px',
            boxShadow: 'var(--shadow-dialog)'
          },
          success: {
            iconTheme: { primary: '#1ed760', secondary: 'var(--color-bg-base)' }
          },
          error: {
            iconTheme: { primary: '#f3727f', secondary: 'var(--color-bg-base)' }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
