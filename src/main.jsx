import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

const CLIENT_ID="669935809244-dc2s9ht6v5gqc2d3h5l2jlcb1cps4ogn.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
    </GoogleOAuthProvider>
    </BrowserRouter>
  
)
