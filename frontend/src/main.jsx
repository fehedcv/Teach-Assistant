// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- IMPORT THIS
import App from './App.jsx'
import './index.css' // Your Tailwind imports

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* This BrowserRouter is required for useNavigate to work */}
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)