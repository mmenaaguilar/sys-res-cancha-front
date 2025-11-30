import http from "./httpClient.js";
import { authService } from "./auth.service.js";
import { ubigeoService } from "./ubigeo.service.js";

export const complexService = {
    
    search: async (filters) => {
        const payload = { distrito: filters.location || '', fecha: filters.date, hora: filters.time, tipo_deporte_id: filters.sport };
        return await http.request('/api/alquiler/buscar-complejos-disponibles', 'POST', payload);
    },

    getSports: async () => {
        try { return await http.request('/api/tipo-deporte/combo') || []; } catch(e) { return []; }
    },

     getMyComplejos: async () => {
        const user = authService.getUser(); 
        if (!user) return [];
        const uid = Number(user.usuario_id || user.id);

        try {
            const res = await http.request('/api/complejos/list', 'POST', { usuario_id: uid, limit: 100, page: 1 });
            
            let data = [];
            if (Array.isArray(res)) data = res;
            else if (res.data && Array.isArray(res.data)) data = res.data;
            else if (res.data && Array.isArray(res.data.data)) data = res.data.data;

            return data.map(c => {
                let label = '';
                if (c.distrito_nombre) label = c.distrito_nombre + (c.provincia_nombre ? `, ${c.provincia_nombre}` : '');
                else if (c.distrito_id) label = `ID: ${c.distrito_id}`;
                else label = '--';

                return {
                    complejo_id: c.complejo_id,
                    nombre: c.nombre,
                    direccion: c.direccion_detalle || c.direccion || 'Sin dirección',
                    
                    // IMPORTANTE: Estos campos faltaban o se perdían
                    descripcion: c.descripcion, 
                    url_map: c.url_map,   
                    url_imagen: c.url_imagen, 
                    
                    distrito_id: c.distrito_id, 
                    provincia_id: c.provincia_id,
                    departamento_id: c.departamento_id,
                    ubicacion_label: label, 
                    estado: c.estado || 'activo'
                };
            });
        } catch (e) {
            console.error("Error al listar complejos:", e);
            return [];
        }
    },
    
    // --- CREATE (Soporte FormData + Mapa) ---
    create: async (data) => {
        const user = authService.getUser();
        const uid = Number(user.usuario_id || user.id);
        
        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('direccion_detalle', data.direccion_detalle || '');
        formData.append('descripcion', data.descripcion || '');
        formData.append('estado', 'activo');
        formData.append('usuario_id', uid);
        
        // Ubicación
        if(data.departamento_id) formData.append('departamento_id', data.departamento_id);
        if(data.provincia_id) formData.append('provincia_id', data.provincia_id);
        if(data.distrito_id) formData.append('distrito_id', data.distrito_id);

        // Archivo
        if (data.file) formData.append('imagen', data.file);
        
        // ✅ CORRECCIÓN: Agregar URL MAPA explícitamente
        if (data.url_map) formData.append('url_map', data.url_map);

        try {
            const res = await http.request('/api/complejos', 'POST', formData);
            const newId = res.complejo_id || res.data?.complejo_id || res.id;
            if (newId) {
                await http.request('/api/usuario-roles', 'POST', { usuario_id: uid, rol_id: 1, complejo_id: newId, estado: 'activo' });
            }
            return res;
        } catch (error) { throw error; }
    },

    // --- UPDATE (Soporte FormData + Mapa) ---
    update: async (id, data) => {
        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('direccion_detalle', data.direccion_detalle || '');
        formData.append('descripcion', data.descripcion || '');
        formData.append('estado', data.estado);
        formData.append('_method', 'PUT'); // Truco para PHP

        if(data.departamento_id) formData.append('departamento_id', data.departamento_id);
        if(data.provincia_id) formData.append('provincia_id', data.provincia_id);
        if(data.distrito_id) formData.append('distrito_id', data.distrito_id);

        if (data.file) formData.append('imagen', data.file);
        else if (data.url_imagen) formData.append('url_imagen', data.url_imagen);
        
        // ✅ CORRECCIÓN: Agregar URL MAPA
        // Si viene vacío, enviamos cadena vacía
        formData.append('url_map', data.url_map || '');

        return await http.request(`/api/complejos/${id}`, 'POST', formData);
    },

    toggleStatus: async (id) => http.request(`/api/complejos/status/${id}`, 'PUT'),
    delete: async (id) => http.request(`/api/complejos/${id}`, 'DELETE')
};