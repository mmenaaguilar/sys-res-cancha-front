import http from "./httpClient.js";
import { authService } from "./auth.service.js";
// import { ubigeoService } from "./ubigeo.service.js"; // Ya no es estrictamente necesario aquí

export const complexService = {
    
    search: async (filters) => {
        const payload = { 
            distrito: filters.location || '', 
            fecha: filters.date, 
            hora: filters.time, 
            tipo_deporte_id: filters.sport 
        };
        return await http.request('/api/alquiler/buscar-complejos-disponibles', 'POST', payload);
    },

    getSports: async () => {
        try {
            const res = await http.request('/api/tipo-deporte/combo');
            return Array.isArray(res) ? res : (res.data || []);
        } catch(e) { return []; }
    },

    getMyComplejos: async () => {
        const user = authService.getUser();
        if (!user) return [];
        const uid = Number(user.usuario_id || user.id);

        try {
            const res = await http.request('/api/complejos/list', 'POST', { 
                usuario_id: uid, 
                limit: 100, 
                page: 1 
            });
            
            let data = [];
            if (Array.isArray(res)) data = res;
            else if (res.data && Array.isArray(res.data)) data = res.data;

            return data.map(c => {
                // Preferimos la ubicación compuesta del backend
                let label = c.ubicacion_completa;
                
                // Si viene vacía, intentamos armarla o mostrar el ID
                if (!label || label.trim() === ',') {
                    label = c.distrito_nombre || (c.distrito_id ? `Zona ${c.distrito_id}` : 'Sin ubicación');
                }

                return {
                    complejo_id: c.complejo_id,
                    nombre: c.nombre,
                    direccion: c.direccion_detalle || c.direccion || 'Sin dirección',
                    
                    distrito_id: c.distrito_id, 
                    provincia_id: c.provincia_id,
                    departamento_id: c.departamento_id,

                    ubicacion_label: label, // Etiqueta lista para la tabla
                    
                    url_imagen: c.url_imagen,
                    estado: c.estado || 'activo'
                };
            });

        } catch (e) {
            console.error("Error:", e);
            return [];
        }
    },

    create: async (data) => {
        const user = authService.getUser();
        const uid = Number(user.usuario_id || user.id);
        if (!uid) throw new Error("Usuario no identificado");

        const cleanInt = (val) => (val === null || val === "" || isNaN(parseInt(val))) ? null : parseInt(val);

        const payload = {
            nombre: data.nombre,
            direccion_detalle: data.direccion_detalle || '',
            distrito_id: cleanInt(data.distrito_id),
            departamento_id: cleanInt(data.departamento_id),
            provincia_id: cleanInt(data.provincia_id),
            url_imagen: data.url_imagen || '',
            descripcion: data.descripcion || '',
            estado: 'activo',
            usuario_id: uid 
        };

        try {
            const res = await http.request('/api/complejos', 'POST', payload);
            const newId = res.complejo_id || (res.data && res.data.complejo_id) || res.id;

            if (!newId) throw new Error("Servidor respondió OK pero sin ID.");

            await http.request('/api/usuario-roles', 'POST', { 
                usuario_id: uid, 
                rol_id: 1, 
                complejo_id: newId, 
                estado: 'activo' 
            });

            return res;
        } catch (error) {
            console.error("Error create:", error);
            throw error; 
        }
    },

    update: async (id, data) => {
        const cleanInt = (val) => (val === null || val === "" || isNaN(parseInt(val))) ? null : parseInt(val);
        const payload = { 
            ...data, 
            distrito_id: cleanInt(data.distrito_id),
            departamento_id: cleanInt(data.departamento_id),
            provincia_id: cleanInt(data.provincia_id)
        };
        return await http.request(`/api/complejos/${id}`, 'PUT', payload);
    },

    toggleStatus: async (id) => {
        return await http.request(`/api/complejos/status/${id}`, 'PUT');
    },

    delete: async (id) => {
        return await http.request(`/api/complejos/${id}`, 'DELETE');
    }
};