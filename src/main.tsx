
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Use standard rendering instead of delayed rendering to avoid React context issues
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
