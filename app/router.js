// js/router.js

import homeView from "./views/homeView.js";
import myReservationsView from "./views/myReservationsView.js";
import registerView from "./views/registerView.js";
import notFoundView from "./views/notFoundView.js";
import adminView from "./views/adminView.js";

const routes = {
  "/": homeView,
  "/home": homeView,
  "/reservations": myReservationsView,
  "/register": registerView,
  "/admin": adminView,
  "/software": homeView,
  "/contact": homeView,
  "/ranking": homeView,
  "/privacy": homeView,
  "/terms": homeView,
};

const handleLocation = () => {
  // 2. Usa window.location.pathname
  let path = window.location.pathname;

  if (path === "") {
    path = "/";
  }

  const view = routes[path] || notFoundView;
  const viewContainer = document.getElementById("app-content");
  if (viewContainer) {
    viewContainer.innerHTML = view.render();
    if (typeof view.attachEventListeners === "function") {
      view.attachEventListeners();
    }
  } else {
    console.error("El contenedor 'app-content' no fue encontrado.");
  }
};

const navigate = (pathname) => {
  window.history.pushState({}, "", pathname);
  handleLocation();
};

window.onpopstate = handleLocation;

export { navigate, handleLocation };