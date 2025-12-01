import http from "./httpClient.js";

// --- FUNCIONES AUXILIARES (Internal) ---

/**
 * Obtiene la información del usuario del localStorage o caché.
 * ¡CRÍTICO! Asume que el objeto de usuario se almacena con la clave 'user_data'.
 */
const _getComplexRoles = () => {
    try {
        // Leemos la clave correcta que tiene los roles
        const rolesData = localStorage.getItem('user_complex_roles'); 
        if (!rolesData) return [];
        
        const rolesArray = JSON.parse(rolesData);

        // Adaptamos la estructura para que coincida con la lógica de comparación
        // (Convertimos de {"id": 60, "rol": 1} a {"complejo_id": 60, "rol_id": 1})
        return rolesArray.map(item => ({
            complejo_id: item.id,
            rol_id: item.rol
        }));
        
    } catch (e) {
        console.error("Error al obtener o parsear roles del complejo:", e);
        return [];
    }
};

// --- SERVICIO PRINCIPAL ---

export const managerService = {
    // 1. LISTAR GESTORES
    list: async (complejoId, page = 1, searchTerm = '') => {
        try {
            // Se usa parseInt(complejoId) para asegurar el tipo de dato, muy bien.
            const res = await http.request('/api/gestores/list', 'POST', { 
                complejo_id: parseInt(complejoId),
                page: page,
                limit: 10,
                searchTerm: searchTerm
            });
            return res; // Devuelve { total, data, ... }
        } catch(e) { 
            console.error("Error listando gestores", e);
            return { total: 0, data: [] }; 
        }
    },
    
    // 2. INVITAR GESTOR
    invite: async (email, complejoId, rolId) => {
        return await http.request('/api/gestores/invite', 'POST', { 
            email, 
            complejo_id: parseInt(complejoId), 
            rol_id: parseInt(rolId) 
        });
    },
    
    // 3. ELIMINAR GESTOR
    delete: async (id) => http.request(`/api/gestores/${id}`, 'DELETE'),

    // 4. VERIFICACIÓN DE PROPIEDAD (para uso del frontend)
    /**
     * Verifica si el usuario actual tiene rol 1 (Admin/Dueño) para el complejo dado.
     * @param {string|number} complejoId ID del complejo a verificar.
     * @returns {boolean} True si es dueño.
     */
isOwnerOf: (complejoId) => {
        // Obtenemos el array de roles adaptado
        const mis_sedes = _getComplexRoles(); 
        const selectedId = parseInt(complejoId);
        
        if (mis_sedes.length === 0) {
            console.warn("isOwnerOf: No se encontraron roles de complejo.");
            return false;
        }

        const isOwner = mis_sedes.some(sede => {
            // Ya que adaptamos la estructura en _getComplexRoles, 
            // solo necesitamos asegurar que sean números.
            const userComplejoId = parseInt(sede.complejo_id); 
            const userRolId = parseInt(sede.rol_id); 
            
            const match = userComplejoId === selectedId && userRolId === 1;
            
            if (match) {
                console.log(`✅ Permiso concedido: Rol 1 encontrado para Complejo ID ${selectedId}`);
            }
            return match;
        });
        
        console.log(`Resultado final para ID ${selectedId}: ${isOwner ? 'ACCESO CONCEDIDO' : 'ACCESO DENEGADO'}`);
        return isOwner;
        },

    getUser: () => {
        try {
            const userData = localStorage.getItem('user'); 
            return userData ? JSON.parse(userData) : {};
        } catch (e) {
            return {};
        }
    }
};