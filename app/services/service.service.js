import http from "./httpClient.js";

export const serviceService = {
    
    list: async (complejoId, page = 1, limit = 10, search = '') => {
        const payload = {
            complejo_id: parseInt(complejoId),
            page: page,
            limit: limit,
            termino_busqueda: search || null
        };
        
        console.log("📡 [Service] Pidiendo servicios con payload:", payload);

        try {
            const res = await http.request('/api/servicios/list', 'POST', payload);
            console.log("📥 [Service] Respuesta del servidor:", res);
            
            // Lógica de extracción de datos
            let lista = [];
            let total = 0;

            if (Array.isArray(res)) {
                lista = res;
                total = res.length;
            } else if (res.data && Array.isArray(res.data)) {
                lista = res.data;
                total = res.total || lista.length;
            } else if (res.data?.data && Array.isArray(res.data.data)) {
                lista = res.data.data;
                total = res.data.total || 0;
            }

            return { data: lista, total: total };

        } catch (e) {
            // ⚠️ AQUÍ ESTÁ EL CAMBIO: Alerta visible para que veas el error
            console.error("❌ Error Fatal en Servicios:", e);
            alert("Error al cargar servicios: " + e.message); 
            return { data: [], total: 0 };
        }
    },

    create: async (data) => {
        const payload = {
            complejo_id: parseInt(data.complejo_id),
            nombre: data.nombre,
            descripcion: data.descripcion || '',
            monto: parseFloat(data.monto),
            estado: data.estado || 'activo'
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