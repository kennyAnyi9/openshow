import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import OutputRenderer from './OutputRenderer'

createRoot(document.getElementById('output-root')!).render(
  <StrictMode>
    <OutputRenderer />
  </StrictMode>
)
