import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import 'assets/scss/style.scss';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import App from 'layout/App';
import reducer from 'store/reducer';
import * as serviceWorker from 'serviceWorker';

import { AuthProvider } from 'contexts/AuthContext';

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
