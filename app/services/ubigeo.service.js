import http from "./httpClient.js";

export const ubigeoService = {
    
    // 1. Obtener Departamentos (Desde Backend)
    getDepartamentos: async () => {
        try {
            // Llama a: /api/ubigeo/departamentos
            const res = await http.request('/api/ubigeo/departamentos');
            return Array.isArray(res) ? res : [];
        } catch (e) { 
            console.error("Error al cargar departamentos:", e);
            return []; 
        }
    },

    // 2. Obtener Provincias por Departamento
    getProvincias: async (depId) => {
        if (!depId) return [];
        try {
            // Llama a: /api/ubigeo/provincias/{id}
            const res = await http.request(`/api/ubigeo/provincias/${depId}`);
            return Array.isArray(res) ? res : [];
        } catch (e) { return []; }
    },

    // 3. Obtener Distritos por Provincia
    getDistritos: async (provId) => {
        if (!provId) return [];
        try {
            // Llama a: /api/ubigeo/distritos/{id}
            const res = await http.request(`/api/ubigeo/distritos/${provId}`);
            return Array.isArray(res) ? res : [];
        } catch (e) { return []; }
    },

    // 4. Helper Visual para la Tabla
    // Recibe el dato que viene del complex.service (que puede ser el nombre o el ID)
    getLocationName: (val) => {
        if (!val) return "--";
        
        // Si el backend ya nos mandó el nombre (string), lo mostramos
        if (typeof val === 'string') return val;
        
        // Si por alguna razón viene como objeto
        if (typeof val === 'object' && val.name) return val.name;
        
        // Si sigue siendo un ID numérico, mostramos un fallback (esto no debería pasar si el JOIN del backend funciona)
        return `Distrito ${val}`;
    }
};