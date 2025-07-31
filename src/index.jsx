import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// project styles - YOL DÜZELTİLDİ
// Vite'a bu dosyanın mevcut klasörün içindeki 'assets' klasöründe olduğunu söylüyoruz.
import './assets/scss/style.scss';

// redux
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
// YOL DÜZELTİLDİ
import reducer from './store/reducer'; 

// project imports - YOLLAR DÜZELTİLDİ
import App from './layout/App';
import { AuthProvider } from './contexts/AuthContext';
import * as serviceWorker from './serviceWorker';

const store = configureStore({ reducer });
const root = createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <BrowserRouter basename={import.meta.env.VITE_APP_BASE_NAME}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </Provider>
);

serviceWorker.unregister();
