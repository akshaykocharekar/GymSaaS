import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import { AuthProvider } from "./context/AuthContext.js";
import { GymProvider } from "./context/GymContext.js";
import { ToastProvider } from "./components/Toast.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GymProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </GymProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);