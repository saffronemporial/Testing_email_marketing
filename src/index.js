import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { AuthProvider } from "./context/AuthContext";
import reportWebVitals from './reportWebVitals';
import { ToastContainer, useToast } from './components/Products/Cart/Toast.jsx'

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <reportWebVitals>
      <App />
      </reportWebVitals>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AuthProvider>
  </Provider>
);
