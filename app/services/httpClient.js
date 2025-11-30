// app/services/httpClient.js

// Ajusta tu URL base si es diferente
const API_BASE_URL = "http://localhost:8000"; 

const httpClient = {
    async request(endpoint, method = 'GET', body = null) {
        const headers = {
            "Accept": "application/json"
        };

        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = { method, headers };

        // LOGICA INTELIGENTE: 
        // Si el body es FormData (archivos), NO ponemos Content-Type (el navegador lo pone).
        // Si es objeto normal, lo convertimos a JSON.
        if (body instanceof FormData) {
            config.body = body;
        } else if (body) {
            headers["Content-Type"] = "application/json";
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = "/";
                return;
            }

            // Manejo robusto de respuesta (Texto o JSON)
            const text = await response.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch (e) {
                console.error("Respuesta del servidor no es JSON:", text);
                // Si no es JSON, probablemente sea un error de PHP fatal o un var_dump olvidado
                throw new Error("Error de comunicación con el servidor. Revisa la consola.");
            }

            if (!response.ok) {
                throw new Error(json.error || json.message || `Error ${response.status}`);
            }

            if (json.data !== undefined) {
                return json.data;
            }

            return json;

        } catch (error) {
            console.error(`HTTP Error en ${endpoint}:`, error);
            throw error;
        }
    }
};

export default httpClient;