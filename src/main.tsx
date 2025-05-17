import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { Toaster } from 'react-hot-toast' // ✅ import

registerSW()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <App />
    </>
  </StrictMode>,
)

