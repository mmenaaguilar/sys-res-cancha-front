// js/router.js

// Importación directa de vistas para la versión síncrona simple
// Nota: En un proyecto más grande, la carga dinámica ('() => import(...)') sería mejor.
import homeView from "./views/homeView.js";
// IMPORTANTE: Debes crear los archivos myReservationsView.js y notFoundView.js
import myReservationsView from "./views/myReservationsView.js";
import notFoundView from "./views/notFoundView.js";

const routes = {
  "/": homeView,
  "/reservations": myReservationsView,
  // Puedes dejar rutas vacías por ahora, o crear vistas placeholder
};

// Función principal que lee la URL y carga la vista
const handleLocation = () => {
  // YA NO ES ASÍNCRONA
  const path = window.location.pathname;

  // Selecciona la vista (si la ruta no existe, usa notFoundView)
  const view = routes[path] || notFoundView;

  const viewContainer = document.getElementById("app-content");

  // 1. Inyecta el esqueleto HTML de la vista (síncrono)
  viewContainer.innerHTML = view.render();

  // 2. Ejecuta la lógica de la vista (adjuntar listeners)
  view.attachEventListeners();
};

// Función para cambiar la URL y notificar al router
const navigate = (pathname) => {
  window.history.pushState({}, pathname, window.location.origin + pathname);
  handleLocation();
};

// Escucha los eventos del navegador (Botón Atrás/Adelante)
window.onpopstate = handleLocation;

// Exporta las funciones para que app.js las use
export { navigate, handleLocation };
