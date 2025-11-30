import http from "./httpClient.js";

export const policyService = {
    list: async (complejoId) => {
        try {
            const res = await http.request('/api/politicas/list', 'POST', { complejo_id: parseInt(complejoId) });
            
            // CORRECCIÓN ROBUSTA:
            // Verificamos si el backend devuelve el array dentro de "politicas"
            if (res && res.politicas && Array.isArray(res.politicas)) {
                return res.politicas;
            }
            
            // Fallback por si la estructura cambia a data o es el array directo
            return Array.isArray(res) ? res : (res.data || []);
        } catch (e) {
            console.error("Error en policyService.list:", e);
            return [];
        }
    },

    create: async (data) => http.request('/api/politicas', 'POST', data),
    
    update: async (id, data) => http.request(`/api/politicas/${id}`, 'PUT', data),
    
    toggleStatus: async (id) => http.request(`/api/politicas/status/${id}`, 'PUT'),
    
    delete: async (id) => http.request(`/api/politicas/${id}`, 'DELETE')
};