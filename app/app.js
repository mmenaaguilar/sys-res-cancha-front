// js/app.js
import { navigate, handleLocation } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Ya no necesitamos loadConfig()

  // 2. Hacer las funciones del router accesibles (para los enlaces onclick)
  window.router = { navigate };

  // 3. Cargar la vista inicial
  handleLocation();
});
