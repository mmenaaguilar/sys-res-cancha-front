// app/services/httpClient.js

// 1. URL base y objeto de configuración deben ser variables que se llenan de forma asíncrona
let API_BASE_URL = "http://localhost:8000"; // Valor de fallback
let CONFIG_DATA = null;

// La función para cargar la configuración JSON
async function loadConfig() {
  try {
    // Usamos fetch para cargar el archivo JSON como texto
    const response = await fetch("../../config/app.config.json");
    if (!response.ok) {
      console.error(
        "Error al cargar app.config.json. Usando localhost por defecto."
      );
      return;
    }

    // Parseamos el JSON
    CONFIG_DATA = await response.json();

    // 2. LÓGICA DE DETECCIÓN DE ENTORNO
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // Determinar la clave del entorno a usar
    let environmentKey;

    if (isLocalhost) {
      environmentKey = "development";
    } else if (CONFIG_DATA && CONFIG_DATA["production"]) {
      environmentKey = "production";
    } else if (CONFIG_DATA && CONFIG_DATA["default"]) {
      // Si la detección de localhost/production falla, usamos la clave 'default'
      environmentKey = CONFIG_DATA["default"];
    } else {
      // Último recurso si el JSON no tiene 'production' ni 'default'
      environmentKey = "development";
    }

    // Aplicar la URL base
    if (CONFIG_DATA && CONFIG_DATA[environmentKey]) {
      API_BASE_URL = CONFIG_DATA[environmentKey].apiUrl;
      console.log(
        `API Base URL configurada para ${environmentKey}: ${API_BASE_URL}`
      );
    } else {
      // Si la estructura del JSON falla, usamos el valor de fallback
      console.warn(
        `No se encontró la configuración para '${environmentKey}'. Usando fallback.`
      );
    }
  } catch (error) {
    console.error("Error al leer la configuración JSON:", error);
  }
}

// Inicia la carga de la configuración inmediatamente
const configPromise = loadConfig();

const httpClient = {
  // Es CRUCIAL que el método request espere a que la configuración se haya cargado
  async request(endpoint, method = "GET", body = null) {
    // 3. ESPERAR A QUE LA CONFIGURACIÓN ESTÉ LISTA
    if (!CONFIG_DATA) {
      await configPromise;
    }

    // Ahora el resto de tu lógica es correcta:
    const headers = {
      Accept: "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = { method, headers };

    // Lógica de body y Content-Type
    if (body instanceof FormData) {
      config.body = body;
    } else if (body) {
      headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(body);
    }

    try {
      // Usa la API_BASE_URL que ahora es dinámica
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/";
        return;
      }

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error("Respuesta del servidor no es JSON:", text);
        throw new Error(
          "Error de comunicación con el servidor. Revisa la consola."
        );
      }

      if (!response.ok) {
        throw new Error(
          json.error || json.message || `Error ${response.status}`
        );
      }

      if (json.data !== undefined) {
        return json.data;
      }

      return json;
    } catch (error) {
      console.error(`HTTP Error en ${endpoint}:`, error);
      throw error;
    }
  },
};

export default httpClient;
