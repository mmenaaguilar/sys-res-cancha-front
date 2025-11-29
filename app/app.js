import { navigate, handleLocation } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  // Opcional: window.router = { navigate }; 

  document.body.addEventListener("click", e => {
    const link = e.target.closest('a');
    
    // Verificamos que sea un link, que tenga href, y que sea interno (comienza con /)
    // Y IMPORTANTE: que no tenga target="_blank" (para permitir abrir en nueva pestaña)
    if (link && 
        link.getAttribute('href')?.startsWith('/') && 
        link.getAttribute('target') !== '_blank') {
        
      e.preventDefault();
      navigate(link.getAttribute('href'));
    }
  });

  // Manejar el botón "Atrás" del navegador (si no está en router.js)
  window.addEventListener("popstate", handleLocation);

  // Carga inicial
  handleLocation();
});