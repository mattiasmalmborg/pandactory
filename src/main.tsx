import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerServiceWorker } from './registerSW'

// Register service worker for PWA support (production only)
if (import.meta.env.PROD) {
  registerServiceWorker()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Temporarily disabled StrictMode to fix save/load issues in development
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)
