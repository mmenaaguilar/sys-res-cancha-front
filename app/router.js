// app/router.js

import homeView from "./views/homeView.js";
import myReservationsView from "./views/myReservationsView.js";
import registerView from "./views/registerView.js";
import notFoundView from "./views/notFoundView.js";
import adminView from "./views/adminView.js";
import userDashboardView from "./views/userDashboardView.js";
import searchResultsView from "./views/searchResultsView.js";
import adminSchedulesView from "./views/adminSchedulesView.js";
import adminContactsView from "./views/adminContactsView.js";
import adminServicesView from "./views/adminServicesView.js";
import adminComplejoFormView from "./views/adminComplejoFormView.js"; 
import adminCanchasView from "./views/adminCanchasView.js";
import adminServicioHorariosView from "./views/adminServicioHorariosView.js";
import adminPoliciesView from "./views/adminPoliciesView.js";
import adminReservasView from "./views/adminReservasView.js";
import adminManagersView from "./views/adminManagersView.js";
import userProfileView from "./views/userProfileView.js";
import complexDetailsView from "./views/complexDetailsView.js"; 
import favoritesView from "./views/favoritesView.js";
import bookingView from "./views/bookingView.js";





const routes = [
  { path: "/", view: homeView },
  { path: "/home", view: homeView },
  { path: "/register", view: registerView },
  { path: "/reservations", view: myReservationsView }, // Solo una vez
  { path: "/dashboard", view: userDashboardView },
  { path: "/search", view: searchResultsView },

  // ✅ NUEVA RUTA DE GESTIÓN DE CANCHAS
  { path: "/admin/canchas", view: adminCanchasView },
  { path: "/admin", view: adminView },
  { path: "/admin/canchas/:id/horarios", view: adminSchedulesView },



  // Rutas estáticas / Landing
  { path: "/software", view: homeView },
  { path: "/contact", view: homeView },
  { path: "/ranking", view: homeView },
  { path: "/privacy", view: homeView },
  { path: "/terms", view: homeView },

  { path: "/admin/contactos", view: adminContactsView },
  { path: "/admin/servicios", view: adminServicesView },
  { path: "/admin/complejos/editar/:id", view: adminComplejoFormView },
  { path: "/admin/servicios/:id/horarios", view: adminServicioHorariosView },
  { path: "/admin/politicas", view: adminPoliciesView },
  { path: "/admin/reservas", view: adminReservasView },
  { path: "/admin/gestores", view: adminManagersView },
  { path: "/profile", view: userProfileView },
  { path: "/search", view: searchResultsView },
  { path: "/complejo/:id", view: complexDetailsView },
  { path: "/favorites", view: favoritesView },
  { path: "/booking/:id", view: bookingView },



];

let currentView = null;

const matchRoute = (routePath, currentPath) => {
  const routeSegments = routePath.split("/").slice(1);
  const currentSegments = currentPath.split("/").slice(1);

  if (routeSegments.length !== currentSegments.length) return null;

  const params = {};
  
  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];
    const currentSegment = currentSegments[i];

    if (routeSegment.startsWith(":")) {
      const paramName = routeSegment.slice(1);
      params[paramName] = currentSegment;
    } else if (routeSegment !== currentSegment) {
      return null;
    }
  }
  return params;
};

const cleanupModals = () => {
    // Eliminar overlays de modales
    const overlays = document.querySelectorAll('.modal-overlay, .modal');
    overlays.forEach(overlay => overlay.remove());
    
    // Eliminar cualquier otro elemento modal
    const modals = document.querySelectorAll('[id*="Modal"], [class*="modal"]');
    modals.forEach(modal => {
        if (modal.style.display === 'flex' || modal.style.display === 'block') {
            modal.remove();
        }
    });
    
    // Restaurar scroll si estaba bloqueado
    document.body.style.overflow = '';
};

const handleLocation = async () => {
  
  let path = window.location.pathname;
  if (path === "") path = "/";

  cleanupModals()

  // LIMPIEZA
  if (currentView && typeof currentView.cleanup === "function") {
    currentView.cleanup();
  }

  let match = null;
  let params = {};

  for (const route of routes) {
    const matchedParams = matchRoute(route.path, path);
    // Manejo especial para query params (?search=...) en rutas exactas
    if (matchedParams) {
      match = route;
      params = matchedParams;
      break;
    }
    // Fallback simple para rutas exactas si matchRoute falla con query params
    if (route.path === path) {
        match = route;
        break;
    }
  }

  const viewObject = match ? match.view : notFoundView;
  const viewContainer = document.getElementById("app-content");

  if (viewContainer) {
    viewContainer.innerHTML = await viewObject.render(params);
    
    if (typeof viewObject.attachEventListeners === "function") {
      viewObject.attachEventListeners();
    }

    currentView = viewObject;
  } else {
    console.error("Error: Contenedor #app-content no encontrado.");
  }
};

const navigate = (pathname) => {
  window.history.pushState({}, "", pathname);
  handleLocation();
};



window.onpopstate = handleLocation;
// Exponer router globalmente para que los onclick="window.router.navigate(...)" funcionen
window.router = { navigate };

export { navigate, handleLocation };