import http from "./httpClient.js";

export const fieldService = {
    // ==========================================
    // LISTAR CANCHAS
    // ==========================================
    list: async (complejoId, page = 1, limit = 10, search = '', tipoDeporteId = null) => {
        
        // Limpieza de datos estricta
        const finalTipoDeporte = (tipoDeporteId && tipoDeporteId !== "0" && tipoDeporteId !== "") 
            ? parseInt(tipoDeporteId) 
            : null;

        const payload = {
            complejo_id: parseInt(complejoId),
            page: page,
            limit: limit,
            searchTerm: search || null,
            tipo_deporte_id: finalTipoDeporte
        };
        
        try {
            // CORREGIDO: Agregado prefijo /api
            const response = await http.request('/api/canchas/list', 'POST', payload);
            
            let lista = [];
            let total = 0;

            // Normalización de respuesta (soporta varios formatos de backend)
            if (Array.isArray(response)) {
                lista = response;
                total = response.length;
            } else if (response.data && Array.isArray(response.data)) {
                lista = response.data;
                total = response.total || response.count || lista.length;
            }

            return { data: lista, total: total };

        } catch (e) {
            console.error("❌ [FieldService] Error:", e);
            return { data: [], total: 0 };
        }
    },

    // Crear
    create: async (data) => {
        const payload = {
            complejo_id: parseInt(data.complejo_id),
            tipo_deporte_id: parseInt(data.tipo_deporte_id),
            nombre: data.nombre,
            descripcion: data.descripcion || '',
            estado: data.estado || 'activo'
        };
        // CORREGIDO: /api/canchas
        return await http.request('/api/canchas', 'POST', payload);
    },

    // Actualizar
    update: async (id, data) => {
        const payload = {
            complejo_id: parseInt(data.complejo_id),
            tipo_deporte_id: parseInt(data.tipo_deporte_id),
            nombre: data.nombre,
            descripcion: data.descripcion || '',
            estado: data.estado
        };
        // CORREGIDO: /api/canchas/...
        return await http.request(`/api/canchas/${id}`, 'PUT', payload);
    },

    // Cambiar Estado
    toggleStatus: async (id) => {
        return await http.request(`/api/canchas/status/${id}`, 'PUT');
    },

    // Eliminar
    delete: async (id) => {
        return await http.request(`/api/canchas/${id}`, 'DELETE');
    },

    // Helper
    getByComplejo: async (complejoId) => {
        const res = await fieldService.list(complejoId, 1, 100); 
        return res.data;
    }
};