import http from "./httpClient.js";

export const serviceService = {
    
    // Listar con filtros (igual que canchas)
    list: async (complejoId, page = 1, limit = 10, search = '') => {
        const payload = {
            complejo_id: parseInt(complejoId),
            page: page,
            limit: limit,
            searchTerm: search || null
        };
        
        try {
            const res = await http.request('/api/servicios/list', 'POST', payload);
            
            let lista = [];
            let total = 0;

            if (Array.isArray(res)) {
                lista = res;
                total = res.length;
            } else if (res.data && Array.isArray(res.data)) {
                lista = res.data;
                total = res.total || lista.length;
            }

            return { data: lista, total: total };

        } catch (e) {
            console.error("Error listando servicios:", e);
            return { data: [], total: 0 };
        }
    },

    create: async (data) => {
        const payload = {
            complejo_id: parseInt(data.complejo_id),
            nombre: data.nombre,
            descripcion: data.descripcion || '',
            monto: parseFloat(data.monto),
            estado: 'activo'
        };
        return await http.request('/api/servicios', 'POST', payload);
    },

    update: async (id, data) => {
        const payload = {
            complejo_id: parseInt(data.complejo_id),
            nombre: data.nombre,
            descripcion: data.descripcion || '',
            monto: parseFloat(data.monto),
            estado: data.estado
        };
        return await http.request(`/api/servicios/${id}`, 'PUT', payload);
    },

    toggleStatus: async (id) => {
        return await http.request(`/api/servicios/status/${id}`, 'PUT');
    },

    delete: async (id) => {
        return await http.request(`/api/servicios/${id}`, 'DELETE');
    }
};