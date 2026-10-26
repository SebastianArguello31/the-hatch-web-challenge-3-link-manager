import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./styles.css";

// Monta React en el HTML. BrowserRouter permite navegar sin recargar la página.
// StrictMode realiza comprobaciones adicionales durante el desarrollo.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
