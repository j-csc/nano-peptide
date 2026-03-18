import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'molstar/lib/mol-plugin-ui/skin/light.scss'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
