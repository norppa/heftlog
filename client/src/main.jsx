import React from 'react'
import ReactDOM from 'react-dom/client'
import HeftLog from './HeftLog'

import './main.css'
import Store from './Store'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Store>
      <HeftLog />
    </Store>
  </React.StrictMode>
)
