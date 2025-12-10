import http from "./httpClient.js";
import { authService } from "./auth.service.js";
import { toast } from "../utils/toast.js";

export const complexService = {
    
      search: async (filters) => {
        const sportId = filters.sport && filters.sport !== "" ? parseInt(filters.sport) : -1;

        let depId = Number(filters.department) || 0;
        let provId = Number(filters.province) || 0;
        let distId = Number(filters.district) || 0;

        if (distId === 0 && filters.location) {
            distId = Number(filters.location) || 0;
        }

        const payload = {
            departamento_id: depId,
            provincia_id: provId,
            distrito_id: distId,
            tipoDeporte_id: sportId,
            fecha: filters.date,
            hora: filters.time || ''
        };
        
        
        console.log("🚀 Payload búsqueda:", payload);
        return await http.request('/api/alquiler/buscar-complejos-disponibles', 'POST', payload);
     },

    getActiveLocations: async () => {
        try {
            const res = await http.request('/api/complejos/ubicaciones-activas', 'GET');
            return Array.isArray(res) ? res : (res.data || []);
        } catch (e) {
            console.error("Error cargando ubicaciones:", e);
            return [];
        }
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

            const listaProcesada = data.map(c => {
                let label = '';
                if (c.distrito_nombre) label = c.distrito_nombre + (c.provincia_nombre ? `, ${c.provincia_nombre}` : '');
                else if (c.distrito_id) label = `ID: ${c.distrito_id}`;
                else label = '--';

                return {
                    complejo_id: c.complejo_id,
                    nombre: c.nombre,
                    direccion: c.direccion_detalle || c.direccion || 'Sin dirección',
                    descripcion: c.descripcion, 
                    url_map: c.url_map,   
                    url_imagen: c.url_imagen, 
                    distrito_id: c.distrito_id, 
                    provincia_id: c.provincia_id,
                    departamento_id: c.departamento_id,
                    ubicacion_label: label, 
                    estado: c.estado || 'activo',
                    
                    // ✅ CORRECCIÓN CRÍTICA: Guardar el rol que viene del backend
                    mi_rol: c.mi_rol 
                };
            });

            // Actualizamos la caché de roles para el Sidebar
            const rolesCache = listaProcesada.map(c => ({ id: c.complejo_id, rol: c.mi_rol }));
            localStorage.setItem('user_complex_roles', JSON.stringify(rolesCache));

            return listaProcesada;

        } catch (e) {
            console.error("Error al listar complejos:", e);
            return [];
        }
    },

    getRoleForComplex: (complejoId) => {
        if (!complejoId) return null;
        try {
            const cache = JSON.parse(localStorage.getItem('user_complex_roles') || '[]');
            const found = cache.find(x => x.id == complejoId);
            return found ? parseInt(found.rol) : null;
        } catch (e) { return null; }
    },

    isOwnerOf: (complejoId) => {
        const role = complexService.getRoleForComplex(complejoId);
        return role === 1;
    },
    
    create: async (data) => {
        const user = authService.getUser();
        const uid = Number(user.usuario_id || user.id);
        
        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('direccion_detalle', data.direccion_detalle || '');
        formData.append('descripcion', data.descripcion || '');
        formData.append('estado', 'activo');
        formData.append('usuario_id', uid);
        
        if(data.departamento_id) formData.append('departamento_id', data.departamento_id);
        if(data.provincia_id) formData.append('provincia_id', data.provincia_id);
        if(data.distrito_id) formData.append('distrito_id', data.distrito_id);
        if (data.file) formData.append('imagen', data.file);
        if (data.url_map) formData.append('url_map', data.url_map);

        try {
            const res = await http.request('/api/complejos', 'POST', formData);
            const newId = res.complejo_id || res.data?.complejo_id || res.id;
            
            // Asignar rol de dueño inmediatamente
            if (newId) {
                await http.request('/api/usuario-roles', 'POST', { usuario_id: uid, rol_id: 1, complejo_id: newId, estado: 'activo' });
                
                // ✅ TRUCO: Actualizar caché manualmente para que el sidebar reaccione rápido
                try {
                    let cache = JSON.parse(localStorage.getItem('user_complex_roles') || '[]');
                    cache.push({ id: newId, rol: 1 });
                    localStorage.setItem('user_complex_roles', JSON.stringify(cache));
                } catch(e){}
            }
            return res;
        } catch (error) { throw error; }
    },

    update: async (id, data) => {
        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('direccion_detalle', data.direccion_detalle || '');
        formData.append('descripcion', data.descripcion || '');
        formData.append('estado', data.estado);
        formData.append('_method', 'PUT');

        if(data.departamento_id) formData.append('departamento_id', data.departamento_id);
        if(data.provincia_id) formData.append('provincia_id', data.provincia_id);
        if(data.distrito_id) formData.append('distrito_id', data.distrito_id);

        if (data.file) formData.append('imagen', data.file);
        else if (data.url_imagen) formData.append('url_imagen', data.url_imagen);
        
        formData.append('url_map', data.url_map || '');

        return await http.request(`/api/complejos/${id}`, 'POST', formData);
    },

    toggleStatus: async (id) => http.request(`/api/complejos/status/${id}`, 'PUT'),
    delete: async (id) => http.request(`/api/complejos/${id}`, 'DELETE'),

getPublicDetails: async (id) => {
        try {
            // Hacemos las 3 peticiones en paralelo para que sea rápido
            const [complexRes, canchasRes, serviciosRes] = await Promise.all([
                http.request(`/api/complejo-publico/${id}`, 'GET'),
                http.request('/api/canchas/list', 'POST', { complejo_id: id, estado: 'activo', limit: 50 }),
                http.request('/api/servicios/list', 'POST', { complejo_id: id, limit: 20 }) // <-- Petición de Servicios
            ]);

            // Procesar Complejo
            const complex = complexRes.data || complexRes;
            if (!complex || !complex.complejo_id) throw new Error("Complejo no encontrado");

            // Procesar Canchas
            const canchas = Array.isArray(canchasRes) ? canchasRes : (canchasRes.data || []);

            // Procesar Servicios
            const servicios = Array.isArray(serviciosRes) ? serviciosRes : (serviciosRes.data || []);
            
            // Inyectamos los servicios dentro del objeto complejo para que la vista lo lea fácil
            complex.servicios = servicios; 

            return { complex, canchas };

        } catch (error) {
            console.error("Error en getPublicDetails:", error);
            throw error;
        }
    },

    getActiveLocations: async () => {
        try {
            // Llama a la nueva ruta que creamos
            const res = await http.request('/api/complejos/ubicaciones-activas', 'GET');
            return Array.isArray(res) ? res : (res.data || []);
        } catch (e) {
            console.error("Error cargando ubicaciones:", e);
            return [];
        }
    },

    // 🛠️ FIX DEPORTE: Agregamos logs para ver qué devuelve el backend
    getSports: async () => {
        try { 
            const res = await http.request('/api/tipo-deporte/combo');
            // Si retorna undefined, devuelve array vacío
            return Array.isArray(res) ? res : (res.data || []); 
        } catch(e) { return []; }
    },

    
};