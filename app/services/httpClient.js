// app/services/httpClient.js
import config from "../../config/app.config.json";

<<<<<<< HEAD
// Ajusta tu URL base si es diferente
const API_BASE_URL = config[config.default].apiUrl; 
=======
const API_BASE_URL = "http://localhost:8000";
>>>>>>> parent of 4ae944e (Merge branch 'dev1_changes')

const httpClient = {
    async request(endpoint, method = 'GET', body = null) {
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = "/";
                return;
            }

            // 1. LEEMOS EL TEXTO CRUDO PRIMERO
            const text = await response.text();
            
            let json;
            try {
                // 2. INTENTAMOS CONVERTIR A JSON
                json = JSON.parse(text);
            } catch (e) {
                // 3. SI FALLA, ES UN ERROR DE PHP (HTML/TEXTO)
                console.error("🔥 CRITICAL ERROR SERVER:", text);
                throw new Error(`Error del Servidor (No JSON): ${text.substring(0, 150)}...`);
            }

            if (!response.ok) {
                throw new Error(json.error || json.message || `Error ${response.status}`);
            }

            // 4. ESTRUCTURA DE RESPUESTA UNIFICADA
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