import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#111111',
          color: '#fdf8f8',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: '600',
          borderRadius: '0',
          border: '1px solid #333',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#4ade80', secondary: '#111111' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#111111' },
        },
      }}
    />
  </StrictMode>,
)
