import http from "./httpClient.js";

export const serviceScheduleService = {
    
    // Listar
    list: async (servicioId) => {
        try {
            const res = await http.request('/api/servicio-horarios/list', 'POST', { 
                servicio_id: parseInt(servicioId),
                limit: 100,
                page: 1
            });
            
            let data = [];
            if (Array.isArray(res)) data = res;
            else if (res.data && Array.isArray(res.data)) data = res.data;

            return data;
        } catch (e) {
            console.error("Error listando servicio-horarios:", e);
            return [];
        }
    },

    create: async (data) => {
        // LÓGICA ROBUSTA: Convierte cualquier valor 'truthy' (true, 1, "1") a 1, sino 0
        const esObligatorio = (data.is_obligatorio === true || data.is_obligatorio == 1) ? 1 : 0;

        const payload = {
            servicio_id: parseInt(data.servicio_id),
            horarioBase_id: parseInt(data.horarioBase_id),
            is_obligatorio: esObligatorio,
            estado: 'activo'
        };
        return await http.request('/api/servicio-horarios', 'POST', payload);
    },

    update: async (id, data) => {
        // LÓGICA ROBUSTA: Misma validación para la edición
        const esObligatorio = (data.is_obligatorio === true || data.is_obligatorio == 1) ? 1 : 0;

        const payload = {
            servicio_id: parseInt(data.servicio_id),
            horarioBase_id: parseInt(data.horarioBase_id),
            is_obligatorio: esObligatorio,
            estado: data.estado
        };
        return await http.request(`/api/servicio-horarios/${id}`, 'PUT', payload);
    },

    toggleStatus: async (id) => {
        return await http.request(`/api/servicio-horarios/status/${id}`, 'PUT');
    },

    delete: async (id) => {
        return await http.request(`/api/servicio-horarios/${id}`, 'DELETE');
    }
};