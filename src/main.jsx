// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { AuthProvider } from './context/AuthContext.jsx'
import { SearchProvider } from './context/SearchContext';
import { ExportProvider } from './context/ExportContext.jsx'
import { SelectedClientProvider } from './context/SelectedClientContext.jsx'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import './Index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <SearchProvider>
      <BrowserRouter>
        <AuthProvider>
          <ExportProvider>
            <SelectedClientProvider> 
              <CartProvider>
               <FavoritesProvider>
                <App />
               </FavoritesProvider>
              </CartProvider>  
             </SelectedClientProvider>
           </ExportProvider>
         </AuthProvider>
       </BrowserRouter>
      </SearchProvider>
    </Provider>
  </React.StrictMode>,
)
