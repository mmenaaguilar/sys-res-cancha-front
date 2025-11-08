// js/app.js

import { navigate, handleLocation } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {

  window.router = { navigate };

  document.body.addEventListener("click", e => {
    const link = e.target.closest('a');
    
    if (link && link.getAttribute('href').startsWith('/')) {
      e.preventDefault(); // Previene la recarga de la página
      const pathname = link.getAttribute('href');
      navigate(pathname); // Usa tu función de navegación
    }
  });

  handleLocation();
});