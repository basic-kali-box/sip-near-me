import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSecurity } from './utils/security'

// Initialize security checks
initSecurity();

createRoot(document.getElementById("root")!).render(<App />);
