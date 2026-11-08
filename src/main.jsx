import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ShowMessage } from './ShowMessage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ShowMessage>
      <App />
    </ShowMessage>
  </StrictMode>,
)
