// services/SearchService.js
import { api } from "../api.js"; // Asumo que tu api.js es un wrapper de fetch

export const SearchService = {
    /**
     * Busca complejos disponibles según filtros
     * @param {Object} filters - { distrito_id, fecha, hora_inicio, etc }
     */
    buscarComplejos: async (filters) => {
        try {
            // Usamos el endpoint que definiste en tu router PHP
            const response = await api.post('/api/alquiler/buscar-complejos-disponibles', filters);
            return response;
        } catch (error) {
            console.error("Error en búsqueda:", error);
            throw error;
        }
    },

    /**
     * (Opcional) Método para obtener la lista de distritos para el <select>
     * Necesitarás un endpoint para esto, o harcodealo por ahora.
     */
    getDistritos: async () => {
        // return await api.get('/api/ubicaciones/distritos');
        // Mock temporal para que funcione el ejemplo visual:
        return [
            { id: 1, nombre: 'Lima Centro' },
            { id: 2, nombre: 'Miraflores' },
            { id: 3, nombre: 'San Isidro' }
        ];
    }
};