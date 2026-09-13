import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles/tokens.css'
import './styles/global.css'

// three r186 deprecates Clock in favor of Timer; R3F still instantiates
// one internally until it migrates — silence the harmless warning.
if (typeof console !== 'undefined') {
  const w = console.warn.bind(console)
  console.warn = (...a: unknown[]) => {
    if (typeof a[0] === 'string' && a[0].includes('THREE.Clock')) return
    w(...(a as never[]))
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Curio: missing #root element')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
