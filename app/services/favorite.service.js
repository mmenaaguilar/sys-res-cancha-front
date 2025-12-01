import http from "./httpClient.js";
import { authService } from "./auth.service.js";

export const favoriteService = {
    // Cache simple en memoria para no saturar la API
    cache: null, 

    /**
     * Obtiene la lista de favoritos del usuario y crea un mapa para búsqueda rápida
     * Retorna un objeto: { complejo_id: favorito_id, ... }
     */
    getUserFavoritesMap: async () => {
        const user = authService.getUser();
        if (!user) return {};

        try {
            // Tu ruta es POST /api/favoritos/list
            const res = await http.request('/api/favoritos/list', 'POST', { 
                usuario_id: user.usuario_id || user.id 
            });
            
            const data = Array.isArray(res) ? res : (res.data || []);
            
            // Convertimos el array en un Mapa: Clave=ComplejoID, Valor=FavoritoID
            const map = {};
            data.forEach(item => {
                map[item.complejo_id] = item.favorito_id;
            });
            
            favoriteService.cache = map;
            return map;
        } catch (e) {
            console.error("Error cargando favoritos:", e);
            return {};
        }
    },

     getList: async () => {
        const user = authService.getUser();
        if (!user) return [];
        try {
            const res = await http.request('/api/favoritos/list', 'POST', { usuario_id: user.usuario_id || user.id });
            return Array.isArray(res) ? res : (res.data || []);
        } catch (e) { 
            console.error("Error obteniendo favoritos:", e);
            return []; 
        }
    },

    add: async (complejoId) => {
        const user = authService.getUser();
        if (!user) throw new Error("Debes iniciar sesión");

        const res = await http.request('/api/favoritos', 'POST', {
            usuario_id: user.usuario_id || user.id,
            complejo_id: complejoId
        });
        
        // Retornamos el nuevo ID del favorito creado
        return res.favorito_id || res.id || res.data?.favorito_id;
    },

    remove: async (favoritoId) => {
        return await http.request(`/api/favoritos/${favoritoId}`, 'DELETE');
    }
};