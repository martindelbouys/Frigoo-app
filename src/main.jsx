import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Sur iOS en mode standalone (écran d'accueil), window.innerHeight et
// visualViewport.height se sont révélés sous-estimer la vraie hauteur d'écran
// de ~47px sur certains appareils (mesuré : 797 au lieu de 844 réels) — bug
// confirmé via un overlay de diagnostic. window.screen.height, lui, correspond
// à l'écran physique réel. On prend le max des trois pour ne jamais se
// retrouver avec un root plus court que l'écran (au pire un peu plus grand,
// invisible avec overflow:hidden).
function setAppHeight() {
  const candidates = [window.innerHeight, window.visualViewport?.height, window.screen?.height]
    .filter(v => typeof v === 'number' && v > 0)
  const h = Math.max(...candidates)
  document.documentElement.style.setProperty('--app-height', h + 'px')
}
setAppHeight()
window.addEventListener('resize', setAppHeight)
window.addEventListener('orientationchange', setAppHeight)
window.visualViewport?.addEventListener('resize', setAppHeight)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
