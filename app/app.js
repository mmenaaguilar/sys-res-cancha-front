// js/app.js ✅
import { navigate, handleLocation } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  window.router = { navigate };

  if (!window.location.hash) {
    window.location.hash = "#/";
  }

  handleLocation();
});