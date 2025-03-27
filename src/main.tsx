
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use concurrent mode for better performance
const root = createRoot(document.getElementById("root")!);

// Delay hydration until the page is idle
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  // @ts-ignore - requestIdleCallback might not be in TypeScript's lib
  window.requestIdleCallback(() => {
    root.render(<App />);
  });
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(() => {
    root.render(<App />);
  }, 1);
}
