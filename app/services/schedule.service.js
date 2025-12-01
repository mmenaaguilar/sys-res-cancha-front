import http from "./httpClient.js";

export const scheduleService = {
    
    // --- HORARIO BASE (Recurrente) ---
    
    // Listar (El backend pide POST /api/horario-base/list)
    getBase: async (canchaId) => {
        try {
            // Asumimos que el backend acepta filtrar por cancha_id
            const res = await http.request('/api/horario-base/list', 'POST', { 
                cancha_id: parseInt(canchaId),
                limit: 100, // Traemos todos para mostrar la semana completa
                page: 1
            });
            
            // Normalizar respuesta
            if (Array.isArray(res)) return res;
            if (res.data && Array.isArray(res.data)) return res.data;
            return [];
        } catch (e) {
            console.error("Error al obtener horarios base:", e);
            return [];
        }
    },

    createBase: async (data) => {
        // data: { cancha_id, dia_semana, hora_inicio, hora_fin, monto, estado }
        return await http.request('/api/horario-base', 'POST', data);
    },

    updateBase: async (id, data) => {
        return await http.request(`/api/horario-base/${id}`, 'PUT', data);
    },

    toggleStatusBase: async (id) => {
        return await http.request(`/api/horario-base/status/${id}`, 'PUT');
    },

    deleteBase: async (id) => {
        return await http.request(`/api/horario-base/${id}`, 'DELETE');
    },

    getSpecial: async (canchaId) => {
        try {
            const res = await http.request('/api/horario-especial/list', 'POST', { cancha_id: parseInt(canchaId) });
            return Array.isArray(res) ? res : (res.data || []);
        } catch (e) { return []; }
    },

    createSpecial: async (d) => http.request('/api/horario-especial', 'POST', d),
    
    updateSpecial: async (id, d) => http.request(`/api/horario-especial/${id}`, 'PUT', d),
    
    toggleStatusSpecial: async (id) => http.request(`/api/horario-especial/status/${id}`, 'PUT'),
    
    deleteSpecial: async (id) => http.request(`/api/horario-especial/${id}`, 'DELETE'),

    // --- CLONAR (Utilidad potente) ---
    cloneDay: async (canchaId, fromDay, toDay) => {
        return await http.request('/api/horario-base/clone', 'POST', {
            cancha_id: parseInt(canchaId),
            dia_origen: fromDay,
            dia_destino: toDay
        });
    }
};