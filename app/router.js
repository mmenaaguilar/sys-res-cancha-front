// js/router.js
import homeView from "./views/homeView.js";
import myReservationsView from "./views/myReservationsView.js";
import registerView from "./views/registerView.js";
import notFoundView from "./views/notFoundView.js";

const routes = {
  "#/": homeView,
  "#/reservations": myReservationsView,
  "#/register": registerView,
  "#/software": homeView,
  "#/contact": homeView,
  "#/ranking": homeView,
  "#/privacy": homeView,
  "#/terms": homeView,
};

const handleLocation = () => {
  let path = window.location.hash;

  // Normaliza rutas vacías o inválidas a la raíz
  if (!path || path === "#" || path === "") {
    path = "#/";
    window.history.replaceState(null, "", path); // corrige la URL sin recargar
  }

  const view = routes[path] || notFoundView;
  const viewContainer = document.getElementById("app-content");
  viewContainer.innerHTML = view.render();
  if (typeof view.attachEventListeners === "function") {
    view.attachEventListeners();
  }
};

const navigate = (pathname) => {
  if (!pathname.startsWith("#")) {
    pathname = "#" + pathname;
  }
  window.history.pushState(null, "", pathname);
  handleLocation();
};

window.onpopstate = handleLocation;

export { navigate, handleLocation };